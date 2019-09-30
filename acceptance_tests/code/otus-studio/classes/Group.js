const PageElement   = require('../../classes/PageElement');
const Dialog        = require('../../classes/Dialog');
const Question      = require('./Question');
const GroupButton   = require('./GroupItem');
const groupItemState = GroupButton.stateItemEnum;

// ***********************************************
// Constants

const selectors = {
    dialog:{
        DELETE_GROUP_BUTTON_LABEL: 'DELETAR GRUPO',
        DELETE_GROUP_BUTTON: "button[aria-label='deleteGroupButton']",
        INTERRUPTED_CREATION_OK_BUTTON: "button[md-autofocus='dialog.$type==='alert'']"
    }
};

// ***********************************************

class Group extends PageElement {

    constructor(pageOtusStudio){
        super(pageOtusStudio);
        this.questions = [];
    }

    // -------------------------------------------------------
    // Getters

    getFirstQuestion(){
        return this.questions[0];
    }

    getLastQuestion(){
        return this.questions[this.questions.length - 1];
    }

    getTailQuestions(){
        return this.questions.slice(1, this.questions.length);
    }

    getQuestion(number){
        let result = this.questions.filter((question) => question.number === number);
        return result[0];
    }

    getNumQuestions(){
        return this.questions.length;
    }

    getQuestionsTemplateIds(){
        return this.questions.map((question) => question.templateId);
    }

    // -------------------------------------------------------
    // Operations

    async save(){
        const firstQuestion = this.questions[0];
        await firstQuestion.clickOnGroupItemButton();
        const dialog = new Dialog(this.pageExt);
        await dialog.waitForOpenAndClickOnOkButton();
        await firstQuestion.initGroupItem();
    }

    async cancelEdition(){
        const dialog = new Dialog(this.pageExt);
        await dialog.waitForOpenAndClickOnCancelButton();
    }

    async create(firstQuestion, lastQuestion) {
        // click
        await firstQuestion.clickOnGroupItemButton();
        await lastQuestion.initGroupItem(); // update to checkbox
        await lastQuestion.clickOnGroupItemCheckbox();
        //
        this.questions.push(firstQuestion);
        // save
        await this.save();
        // update state
        await lastQuestion.initGroupItem();
        // group created => assign rest group questions
        for (let number = firstQuestion.number+1; number < lastQuestion.number; number++) {
            this.questions.push(await Question.getInstanceAndInit(this.pageExt, number));
        }
        this.questions.push(lastQuestion);
    }

    async clickOnFirstQuestionToEdit(){
        // open edition
        await this.questions[0].clickOnGroupItemButton();
        // update state of tail questions to checkbox
        for(let question of this.getTailQuestions()){
            await question.initGroupItem();
        }
    }

    async addQuestionsUntil(newLastQuestion){
        let lastQuestion = this.getLastQuestion();
        const lastQuestionNumber = lastQuestion.number;
        // open edition
        await this.questions[0].clickOnGroupItemButton();
        // update state (to checkbox)
        await newLastQuestion.initGroupItem();
        await newLastQuestion.clickOnGroupItemCheckbox();
        // save
        await this.save();
        // update state
        await newLastQuestion.initGroupItem();
        // group edited => add new rest questions
        for (let number = lastQuestionNumber+1; number <= newLastQuestion.number ; number++) {
            this.questions.push(await Question.getInstanceAndInit(this.pageExt, number));
        }
    }

    async excludeQuestionsAfter(newLastQuestionNumber) {
        /// open edition
        await this.questions[0].clickOnGroupItemButton();
        // click on any question from 2th to deselect all and select new last question
        let newLastQuestion = this.getQuestion(newLastQuestionNumber);
        await newLastQuestion.initGroupItem();
        await newLastQuestion.clickOnGroupItemCheckbox(); // deselect all
        await newLastQuestion.clickOnGroupItemCheckbox(); // select new last
        await this.save();
        await newLastQuestion.initGroupItem();
        // group edited => update rest questions
        let oldQuestions = [];
        const lastQuestionNumber = this.getLastQuestion().number;
        for (let number = lastQuestionNumber; number > newLastQuestion.number ; number--) {
            let oldQuestion = this.questions.pop();
            await oldQuestion.initGroupItem();
            oldQuestions.push(oldQuestion);
        }
        return oldQuestions.reverse();
    }

    async delete(){
        let firstQuestion = this.questions[0];
        await firstQuestion.clickOnGroupItemButton(); // open edition
        await firstQuestion.clickOnGroupItemButton(); // open dialog
        await (new Dialog(this.pageExt)).clickOnCustomizedActionButton(selectors.dialog.DELETE_GROUP_BUTTON_LABEL);

        for(let question of this.questions){
            await question.initGroupItem();
        }

        let oldQuestions = [...this.questions];
        this.questions = [];
        return oldQuestions;
    }

    async deleteQuestion(questionNumber){
        let question = this.getQuestion(questionNumber);
        const deleteFirst = (questionNumber === this.getFirstQuestion().number);
        await question.delete();
        this.questions = this.questions.filter((question) => (question.number !== questionNumber));

        if(this.getNumQuestions() === 1){
            let newFirstQuestion = this.getFirstQuestion();
            if(deleteFirst){
                newFirstQuestion.number--;
            }
            await newFirstQuestion.initGroupItem();
            this.questions = [];
            return newFirstQuestion;
        }

        let questionsToShift = this.questions.filter((question) => question.number > questionNumber);

        for (let question of questionsToShift) {
            question.number--;
            await question.initGroupItem();
        }
    }


    // ------------------------------------------
    // Assertions

    async assertGroupCreatedSuccessfully() {
        try{
            let firstQuestion = this.getFirstQuestion();
            await firstQuestion.assertState(groupItemState.SAVED_EDITOR);
            // check if rest questions have been included
            for(let question of this.getTailQuestions()) {
                await question.assertState(groupItemState.SAVED_ITEM);
            }
        }
        catch (msg) {
            this.pageExt.errorLogger.addWrongAssertionLogFromCurrSpec('Group assertion with template json object failed:\n' + msg);
        }
    }

    assertWithJsonObject(jsonObject){
       /*
       {
            "objectType": "SurveyItemGroup",
            "start": "DST1",
            "end": "DST3",
            "members": [
                {
                    "id": "DST1",
                    "position": "start"
                },
                {
                    "id": "DST2",
                    "position": "middle"
                },
                {
                    "id": "DST3",
                    "position": "end"
                }
            ]
        }
        */
       try {
           // jsonObject is not empty
           expect(Object.entries(jsonObject).length).not.toBe(0);

           const firstQuestionTemplateId = jsonObject['start'];
           const lastQuestionTemplateId = jsonObject['end'];
           expect(firstQuestionTemplateId).not.toBe(undefined);
           expect(lastQuestionTemplateId).not.toBe(undefined);

           const questionsObjArr = jsonObject['members'];
           const questionObjArraySize = questionsObjArr.length;
           expect(questionObjArraySize).toBe(this.getNumQuestions());

           const fisrtQuestionObj = questionsObjArr[0];
           expect(fisrtQuestionObj['id']).toBe(firstQuestionTemplateId);
           expect(fisrtQuestionObj['position']).toBe('start');

           const lastQuestionObj = questionsObjArr[questionObjArraySize-1];
           expect(lastQuestionObj['id']).toBe(lastQuestionTemplateId);
           expect(lastQuestionObj['position']).toBe('end');

           const templateIdArr = this.getQuestionsTemplateIds();
           for (let i = 1; i < questionObjArraySize-1; i++) {
               const questionObj = questionsObjArr[i];
               expect(questionObj['id']).toBe(templateIdArr[i]);
               expect(questionObj['position']).toBe('middle');
           }
       }
       catch (e) {
           console.error(jsonObject);
           this.pageExt.errorLogger.addWrongAssertionLogFromCurrSpec('Group assertion with template json object failed:\n' + e.message);
       }
    }

    assertIAmEmpty(jsonObjectArr){
        try {
            expect(this.questions.length).toBe(0);
            expect(jsonObjectArr.length).toBe(0);
        }
        catch (e) {
            console.error(jsonObjectArr);
            this.pageExt.errorLogger.addWrongAssertionLogFromCurrSpec('Group assertion with template json object failed: should be empty\n' + e.message);
        }
    }

}

module.exports = Group;