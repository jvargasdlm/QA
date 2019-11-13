const PageOtus = require('../PageOtus');

const selectors = {
    participantData: '$ctrl.filters.participantData',
    questionInfo: {
        item: 'survey-item-view',
        text: "span[ng-bind-html='$ctrl.item.label.ptBR.formattedText']",
        customId: '$ctrl.filters.customID',
        answerState: '$ctrl.filters.displayState'
    },
    singleSelectionQuestion:{
        view: 'single-selection-question-view'
    },
};

const answerInnerText = {
    radioButton: {
        prefix: 'radio_button',
        checked: 'radio_button_checked'
    },
    checkbox: {
        prefix: 'check_box',
        selected: 'check_box',
        unselected: 'check_box_outline_blank'
    }
};

class ActivityViewPage extends PageOtus  {

    constructor(page){
        super(page);
    }

    async extractAnswers(){

        return await this.page.evaluate((selectors, answerInnerText) => {

            function findAnswer(answerArr){
                const firstAnswer = answerArr[0];
                let answer = undefined, isMultipleAnswer = false;
                if(answerArr.length === 1){
                    answer = firstAnswer;
                }
                else if(firstAnswer.includes(answerInnerText.radioButton.prefix)){
                    const innerText = answerInnerText.radioButton.checked;
                    let option = answerArr.filter((answer) => answer.includes(innerText))[0];
                    answer = option.replace(innerText, '');
                }
                else {
                //if(firstAnswer.includes(answerInnerText.checkbox.prefix)){
                    const unselectedInnerText = answerInnerText.checkbox.unselected;
                    const selectedInnerText = answerInnerText.checkbox.selected;
                    answer = [];
                    for(let option of answerArr){
                        if(!option.includes(unselectedInnerText)){
                            answer.push(option.replace(selectedInnerText, ''));
                        }
                    }
                    isMultipleAnswer = (answer.length === 1);
                    if(isMultipleAnswer){
                        answer = answer[0];
                    }
                }
                return [answer, isMultipleAnswer];
            }

            let questionElems = document.body.querySelectorAll(selectors.questionInfo.item);
            let textElems = document.body.querySelectorAll(selectors.questionInfo.text);
            let result = {};
            for (let i = 0; i < questionElems.length; i++) {
                let content = questionElems[i].innerText;
                content = content
                    .replace(textElems[i].innerText, '')
                    .replace(/[\n]+/, '\n');

                if(content.includes('Resposta')) {
                    content = content.replace('Resposta\n\n', '');
                    let parts = content.split('\n');
                    let templateId = parts[0];
                    let answers = parts.slice(1, parts.length);
                    let [filteredAnswer, isMultipleAnswer] = findAnswer(answers);
                    result[templateId] = {
                        isMultiple: isMultipleAnswer,
                        value: filteredAnswer
                    };
                }
            }
            return result;
        }, selectors, answerInnerText);
        //console.log(result);
    }

}

module.exports = ActivityViewPage;