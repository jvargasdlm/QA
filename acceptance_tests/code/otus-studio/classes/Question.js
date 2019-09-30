const PageElement    = require('../../classes/PageElement');
const Button         = require('../../classes/Button');
const Dialog         = require('../../classes/Dialog');
const InputField     = require('../../classes/InputField');
const OptionSelector = require('../../classes/OptionSelector');
const GroupItem      = require('./GroupItem');

// ***********************************************
// Constants

const typeEnum = {
    INSERIR_ITEM_TEXTO: 0,
    INSERIR_ITEM_IMAGEM: 1,
    AUTOCOMPLETAR: 2,
    UPLOAD: 3,
    GRADE_TEXTO: 4,
    GRADE_NUMERO_INTEIRO: 5,
    DATA: 6,
    NUMERO_INTEIRO: 7,
    NUMERO_DECIMAL: 8,
    SELECAO_UNICA: 9,
    CHECKBOX: 10,
    TEXTO: 11,
    EMAIL: 12,
    HORA: 13,
    TELEFONE: 14
};

const moveCriteriaIndex = {
    INICIO: 0,
    APOS: 1
};

const selectors = {
    QUESTION_ITEM: 'otus-survey-item-editor',
    QUESTION_ELEMENT_WITH_ID: 'md-whiteframe',
    sub_item: {
        EXPAND: 'otus-button > button',
        MENU: 'md-menu > button',
        GROUP_ITEM: 'survey-item-group',
        TEMPLATE_ID_INPUT: 'editable-id > div',
        idPrefix: {
            EXPAND: 'expandButton',
            MENU: 'menuButton',
            GROUP_ITEM: 'groupItem',
            TEMPLATE_ID_INPUT: 'templateIdInput'
        },
        id:{
            getExpandButton: function(templateId){return 'expandButton' + templateId;},
            getGroupItemButton: function(templateId){return 'groupItem' + templateId;},
            getMenuButton: function(templateId){return 'menuButton' + templateId;},
            getTemplateIdInput: function(templateId){return 'templateIdInput' + templateId;}
        }
    },
    menu:{
        OPTIONS_CONTENT: "md-menu-content[class='md-layoutTheme-theme']",
        MOVE_OPTION: "button[ng-click='$ctrl.moveSurveyItem()']",
        DELETE_OPTION: "button[ng-click='$ctrl.deleteSurveyItem()']"
    },
    moveQuestionDialog: {
        SELECT_CRITERIA_ATTRIBUTE: "[ng-model='$ctrl.selectedCriteria']",
        CRITERIA_OPTION_ATTRIBUTE: "[ng-value='criteria.value']",
        SELECT_NEIGHBOR_ATTRIBUTE: "[ng-model='$ctrl.selectedQuestionNeighbor']",
        QUESTION_POSITION_OPTION_ATTRIBUTE: "[ng-value='question.position']"
    }
};

// ***********************************************

class Question extends PageElement {

    constructor(editionTabPage, number){
        super(editionTabPage);
        this.number = number;
        this.templateId = '';
        this.templateIdInput = new InputField(editionTabPage);
        this.expandButton = new Button(editionTabPage);
        this.menuButton = new Button(editionTabPage);
        this.groupItem = new GroupItem(editionTabPage);
    }

    // ---------------------------------------------------------------
    // Initialization

    async init() {
        //this.editionPageTab.enableConsoleLog();//.
        await this.pageExt.waitForSelector(selectors.QUESTION_ITEM);
        let questionItemElemArray = await this.pageExt.page.$$(selectors.QUESTION_ITEM);
        await this.initFromElementHandle(questionItemElemArray[this.number - 1]);
    }
    
    async initFromElementHandle(questionElementHandle){
        this.elementHandle = questionElementHandle;

        // set element ids
        this.templateId = await this.pageExt.page.evaluate((number, selectors) => {
            let questionItemArray = document.body.querySelectorAll(selectors.QUESTION_ITEM);
            let questionItem = questionItemArray[number-1];
            let templateId = questionItem.querySelector(selectors.QUESTION_ELEMENT_WITH_ID).getAttribute('id');
            questionItem.querySelector(selectors.sub_item.EXPAND).setAttribute('id',            selectors.sub_item.idPrefix.EXPAND + templateId);
            questionItem.querySelector(selectors.sub_item.GROUP_ITEM).setAttribute('id',        selectors.sub_item.idPrefix.GROUP_ITEM +  templateId);
            questionItem.querySelector(selectors.sub_item.MENU).setAttribute('id',              selectors.sub_item.idPrefix.MENU + templateId);
            questionItem.querySelector(selectors.sub_item.TEMPLATE_ID_INPUT).setAttribute('id', selectors.sub_item.idPrefix.TEMPLATE_ID_INPUT + templateId);
            return templateId;
        }, this.number, selectors);

        this.templateIdInput.elementHandle = await this.elementHandle.$(selectors.sub_item.TEMPLATE_ID_INPUT);
        //this.templateIdInput.init();

        await this.expandButton.setId(selectors.sub_item.id.getExpandButton(this.templateId));
        await this.menuButton.setId(selectors.sub_item.id.getMenuButton(this.templateId));

        await this.initGroupItem();
    }

    async initGroupItem(){
        let groupItemParentElementHandle = await this.elementHandle.$(selectors.sub_item.GROUP_ITEM);
        await this.groupItem.init(groupItemParentElementHandle);
    }

    // ---------------------------------------------------------------
    // Simple operations

    async create(questionType){
        //await this.editionPageTab.clickOnEdition();
        let palette = new QuestionPalette(this.pageExt);
        await palette.open();
        const selector = "button[class='  md-button']";
        await this.pageExt.clickOnElementOfList(selector, questionType);
        await this.pageExt.waitForMilliseconds(200);
        await this.init();
        await palette.close();
    }

    async openOptions(){
        await this.menuButton.click();
        await this.pageExt.waitForSelector(selectors.menu.OPTIONS_CONTENT);
    }

    async openOption(menuOptionSelector){
        await this.openOptions();
        await this.pageExt.clickOnLastElementOfList(menuOptionSelector);
        let dialog = new Dialog(this.pageExt);
        await dialog.waitForOpen();
        return dialog;
    }

    async delete(){
        let dialog = await this.openOption(selectors.menu.DELETE_OPTION);
        await dialog.waitForOpenAndClickOnOkButton();
    }

    // ------------------------------------------------------------------------------
    // Move

    async moveToBegin(){
        let dialog = await this.openOption(selectors.menu.MOVE_OPTION);
        let optionSelector = new OptionSelector(this.pageExt);
        await optionSelector.selectOptionBySelectors(
            selectors.moveQuestionDialog.SELECT_CRITERIA_ATTRIBUTE,
            moveCriteriaIndex.INICIO,
            selectors.moveQuestionDialog.CRITERIA_OPTION_ATTRIBUTE);
        await optionSelector.waitCloseForFirstTime();
        await dialog.waitForOpenAndClickOnOkButton();

        const myNewNumber = 1;
        let questionOfMyNewSupposedPosition = await Question.getInstanceAndInit(this.pageExt, myNewNumber);
        if(questionOfMyNewSupposedPosition.templateId === this.templateId) { // success
            Object.assign(this, questionOfMyNewSupposedPosition);
            //await this.init();
        }
    }

    async moveToAfter(newPrevNeighborQuestionNumber){
        let dialog = await this.openOption(selectors.menu.MOVE_OPTION);
        let optionSelector = new OptionSelector(this.pageExt);
        await optionSelector.selectOptionBySelectors(
            selectors.moveQuestionDialog.SELECT_CRITERIA_ATTRIBUTE,
            moveCriteriaIndex.APOS,
            selectors.moveQuestionDialog.CRITERIA_OPTION_ATTRIBUTE);
        await optionSelector.waitClose();
        // select previous neighbor
        await optionSelector.selectOptionBySelectors(
            selectors.moveQuestionDialog.SELECT_NEIGHBOR_ATTRIBUTE,
            newPrevNeighborQuestionNumber-1,
            selectors.moveQuestionDialog.QUESTION_POSITION_OPTION_ATTRIBUTE);
        await optionSelector.waitClose();
        await dialog.waitForOpenAndClickOnOkButton();
    }

    async moveToAfterAndReset(newPrevNeighborQuestionNumber){
        await this.moveToAfter(newPrevNeighborQuestionNumber);
        // check move: if success => reset
        const IwasBefore = (this.number < newPrevNeighborQuestionNumber);
        const myNewNumber = newPrevNeighborQuestionNumber + (IwasBefore? 0 : 1);
        let questionOfMyNewSupposedPosition = await Question.getInstanceAndInit(this.pageExt, myNewNumber);
        const success = (questionOfMyNewSupposedPosition.templateId === this.templateId);
        if(success) {
            Object.assign(this, questionOfMyNewSupposedPosition);
            //await this.init();
        }
        return success;
    }

    // ------------------------------------------------------------------------------
    // Group

    async clickOnGroupItemButton() {
        await this.groupItem.click();
        let oldGroupItemId = this.groupItem.id;
        await this.pageExt.waitForMilliseconds(5000);//.
        await this.pageExt.waitForSelectorHidden('#'+oldGroupItemId);
        await this.initGroupItem();
    }

    async clickOnGroupItemCheckbox() {
        await this.groupItem.click();
    }

    async getStateItemGroup() {
        if (!this.groupItem.state) {
            return this.groupItem.updateAndGetState(this.number);
        }
        return this.groupItem.state;
    }

    async customizeTemplateId(newTemplateId){
        //TODO
    }

    // ------------------------------------------------------
    // Assertions

    assertNumber(expectedNumber) {
        try {
            expect(this.number).toBe(expectedNumber);
        }
        catch (e) {
            const message = `at question ${this.templateId} number - expected '${expectedNumber}', received '${this.number}'`;
            this.pageExt.errorLogger.addWrongAssertionLogFromCurrSpec(message);
        }
    }

    assertTemplateId(expectedTemplateId) {
        try {
            expect(this.templateId).toBe(expectedTemplateId);
        }
        catch (e) {
            const message = `at question ${this.number} templateId - expected '${expectedTemplateId}', received '${this.templateId}'`;
            this.pageExt.errorLogger.addWrongAssertionLogFromCurrSpec(message);
        }
    }

    async assertState(expectedState) {
        let state = await this.getStateItemGroup();
        try {
            expect(state).toBe(expectedState);
        }
        catch (e) {
            const message = `at question ${this.number} state - expected '${expectedState}', received '${state}'`;
            this.pageExt.errorLogger.addWrongAssertionLogFromCurrSpec(message);
        }
    }

    async assert(expectedNumber, expectedTemplateId, expectedState) {
        this.assertNumber(expectedNumber);
        this.assertTemplateId(expectedTemplateId);
        await this.assertState(expectedState);
    }

    // ------------------------------------------------------
    // Static methods

    static get typeEnum(){
        return typeEnum;
    }

    static get selectors(){
        return selectors;
    }

    static async getInstanceAndInit(editionPageTab, number){
        let question = new Question(editionPageTab, number);
        await question.init();
        return question;
    }

    static async createQuestionsOfSameType(editionPageTab, numQuestions, questionType){
        let questions = [];
        for (let i = 1; i <= numQuestions; i++) {
            let question = new Question(editionPageTab, i);
            await question.create(questionType);
            questions.push(question);
        }
        return questions;
    }
}

class QuestionPalette {

    constructor(editionPageTab){
        this.editionPageTab = editionPageTab;
    }

    async open(){
        await this.editionPageTab.toolbar.clickOnMenuQuestionButton();
        const plusButtonSelector = "button[ng-click='isOpened=!isOpened']";
        await this.editionPageTab.clickWithWait(plusButtonSelector);
        await this.editionPageTab.waitForMilliseconds(100); // wait rest buttons show up
    }

    async close(){
        //console.log('close palette');
        await this.editionPageTab.page.mouse.click(10, 10);
    }
}

module.exports = Question;