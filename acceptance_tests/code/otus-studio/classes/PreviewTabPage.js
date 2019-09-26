const PageOtusStudio = require('./PageOtusStudio');
const TabPage = require('./TabPage');
const PageElement = require('../../classes/PageElement');
const InputField = require('../../classes/InputField');

const selectors = {
    INITIAL_PAGE: "otus-survey-cover",
    initialButtons:{
        INICIAR: "button[aria-label='Iniciar']",
        SAIR: "button[aria-label='Sair']"
    },
    buttons: {
        PREVIOUS_QUESTION: '#previousQuestion',
        CANCEL: '#cancelActivity',
        SAVE: '#saveActivity',
        NEXT_QUESTION: '#nextQuestion',
        CLEAN: "button[aria-label='Limpar Resposta']",
        CLOSE_AUX_INFO: '#ButtonIsLockOpenClose'
    },
    questionsDisplay:{
        DISPLAY: 'otus-player-display',
        QUESTION_ITEM: 'otus-survey-item',
        QUESTION_LABEL: 'otus-label'
    }
};

class PreviewDisplayQuestionTypeInput extends PageElement {

    constructor(previewTabPage){
        super(previewTabPage);
        this.questionLabel = '';
        this.inputAnswer = new InputField(previewTabPage);
    }

    async initFromElementHandle(index, questionElementHandle){
        this.elementHandle = questionElementHandle;

        // set element ids
        await this.pageExt.page.evaluate((index, selectors) => {
            let questionItemArray = document.body.querySelectorAll(selectors.questionsDisplay.QUESTION_ITEM);
            let questionItem = questionItemArray[index];

            const questionLabel = '';
            let templateId = questionItem.querySelector(selectors.QUESTION_ELEMENT_WITH_ID).getAttribute('id');
            questionItem.querySelector(selectors.sub_item.EXPAND).setAttribute('id',            selectors.sub_item.idPrefix.EXPAND + templateId);
            questionItem.querySelector(selectors.sub_item.GROUP_ITEM).setAttribute('id',        selectors.sub_item.idPrefix.GROUP_ITEM +  templateId);
            questionItem.querySelector(selectors.sub_item.MENU).setAttribute('id',              selectors.sub_item.idPrefix.MENU + templateId);
            questionItem.querySelector(selectors.sub_item.TEMPLATE_ID_INPUT).setAttribute('id', selectors.sub_item.idPrefix.TEMPLATE_ID_INPUT + templateId);
        }, index, selectors);

    }

}

class PreviewTabPage extends TabPage {

    constructor(editorPage) {
        super(editorPage);
        this.displayQuestions = [];
        this.questionLabels = [];
    }

    async init(){
        this.questionLabels = await this.page.evaluate(() => {
            let arr = document.body.querySelectorAll(selectors.questionsDisplay.QUESTION_LABEL);
            return arr.map((element) => element.innerText);
        });
    }

    async getNumQuestionItems(){
        return await this.page.$(selectors.questionsDisplay.QUESTION_ITEM).length;
    }

    async typeValueInQuestionInput(questionLabel){
        let index = this.questionLabels.indexOf(questionLabel);
        let input = await this.page.$$('')
    }

    async updateDisplayQuestions(){

        await this.page.waitForSelector(selectors.questionsDisplay.QUESTION_ITEM);
        let questionItemElemArray = await this.page.$$(selectors.questionsDisplay.QUESTION_ITEM);

        let index = 0;
        for(let elementHandle of questionItemElemArray){
            let displayQuestion = new PreviewDisplayQuestionTypeInput(this, index++);
            await displayQuestion.initFromElementHandle(elementHandle);
            this.displayQuestions.push(displayQuestion);
        }

        await this.page.evaluate((selector) => {
            let elemList = document.body.querySelectorAll(selector);

        }, selectors.questionsDisplay.QUESTION_ITEM);
    }

    getQuestionItem(question){
        return `[id=${question.templateId}]`;
    }

    getQuestionLabel(question){
        let id = this.getQuestionItem(question);
        return this.page.evaluate((id) => {
            return document.body.querySelector(id).innerText;
        }, id);
    }

}

module.exports = PreviewTabPage;