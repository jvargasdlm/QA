const PageOtus = require('./PageOtus');
const ActivityQuestionAnswer = require('./activities/ActivityQuestionAnswer');

const selectors = {
    backCover: {
        VISIBLE: "otus-survey-back-cover[aria-hidden='false']",
        START_BUTTON: "button[aria-label='Iniciar']",
        FINISH_BUTTON: "button[aria-label='Finalizar']"
    },
    commanderButtons: {
        TAG: "otus-player-commander",
        PREVIOUS_QUESTION: '#previousQuestion',
        CANCEL: '#cancelActivity',
        SAVE: '#saveActivity',
        NEXT_QUESTION: '#nextQuestion',
        defineToolbarIndexAccordingHideXs: function (isHideXs) {
            return(isHideXs? 1 : 3);
        }
    },
    inputDataType: {
        'number': "input[placeholder='Insira um valor inteiro']",
        'text': '#textQuestion',
        'date': "input[aria-label='Insira a data']",
        'time': '#inputtime',
        'singleOption': function(label){
            return `md-radio-button[aria-label='${label}']`;
            },
        'multipleOption': function(label){
            return `md-checkbox[aria-label='${label}']`;
        }
    }
};

class PreviewPage extends PageOtus {

    constructor(page){
        super(page);
    }

    async fillActivityQuestions(answersArr){
        await this.clickWithWait(selectors.backCover.START_BUTTON);
        const inputSelectors = selectors.inputDataType;
        const types = ActivityQuestionAnswer.dataTypes;

        const index = selectors.commanderButtons.defineToolbarIndexAccordingHideXs(this.isBigScreenHideXs);
        const nextQuestionButtonElem = (await this.page.$$(selectors.commanderButtons.NEXT_QUESTION))[index];

        for(let answer of answersArr){
            switch (answer.type) {
                case types.time:
                    await this.clickWithWait(inputSelectors.time);
                    await this.typeWithWait(inputSelectors.time, answer.value); break;
                case types.singleOption:
                    await this.clickWithWait(inputSelectors.singleOption(answer.value)); break;
                case types.multipleOption:
                    const checkbox = this.getNewCheckbox();
                    const checkBoxSelector = inputSelectors.multipleOption(answer.value);
                    checkbox.elementHandle = await this.page.$(checkBoxSelector);
                    //!(await checkbox.isChecked())
                    const isChecked = await this.page.evaluate((selector) => {
                        const value = document.body.querySelector(selector).getAttribute("aria-checked");
                        return (value === 'true');
                    }, checkBoxSelector);
                    if( !isChecked ){
                        await checkbox.click();
                    }
                    break;
                default:
                    await this.typeWithWait(inputSelectors[answer.type], answer.value); break;
            }

            await this.waitForMilliseconds(500); // for NEXT BUTTON "to know" that input was filled
            //await this.clickWithWait(selectors.commanderButtons.NEXT_QUESTION);
            await nextQuestionButtonElem.click();
        }

        try {
            await this.waitForSelector(selectors.backCover.VISIBLE, 1000);
        }
        catch (e) { // has a "thank you" question
            //await this.clickWithWait(selectors.commanderButtons.NEXT_QUESTION);
            await nextQuestionButtonElem.click();
        }

        // finalize
        await this.clickWithWait(selectors.backCover.FINISH_BUTTON);
        await this.waitLoad();
    }
}

module.exports = PreviewPage;