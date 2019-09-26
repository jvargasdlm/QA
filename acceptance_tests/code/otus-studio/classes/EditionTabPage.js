const TabPage = require('./TabPage');
const Question = require('./Question');

class EditionTabPage extends TabPage {

    constructor(editorPage) {
        super(editorPage);
        this.questions = [];
    }

    async init(){
        await this.page.waitForSelector(Question.selectors.QUESTION_ITEM);
        let questionItemElemArray = await this.page.$$(Question.selectors.QUESTION_ITEM);
        let number = 1;
        for(let elementHandle of questionItemElemArray){
            let question = new Question(this, number++);
            await question.initFromElementHandle(elementHandle);
            this.questions.push(question);
        }
    }

    getNumQuestions(){
        return this.questions.length;
    }

    getQuestion(questionNumber){
        return this.questions[questionNumber-1];
    }

    removeQuestionFromArray(questionNumber){
        this.questions = this.questions.filter((question) => (question.number !== questionNumber));
    }

    async initQuestion(questionNumber){
        this.questions[questionNumber-1].init();
    }

    async createQuestion(questionType){
        let number = this.getNumQuestions() + 1;
        let newQuestion = new Question(this, number);
        await newQuestion.create(questionType);
        this.questions.push(newQuestion);
    }

    async deleteQuestion(questionNumber){
        let question = this.getQuestion(questionNumber);
        await question.delete();
        this.removeQuestionFromArray(questionNumber);
    }

    async moveQuestionToBegin(questionNumber){
        let questionToMove = new Question(this, 0);
        Object.assign(questionToMove, this.getQuestion(questionNumber));
        await questionToMove.moveToBegin();

        this.removeQuestionFromArray(questionNumber);
        this.questions = [questionToMove].concat(this.questions);

        for (let i = 0; i < questionNumber; i++) {
            //this.questions[i].init(); // need?
            this.questions[i].number++;
        }
    }

    async moveQuestionToAfter(questionNumberToMove, newPrevQuestionNumber){
        let questionToMove = new Question(this, 0);
        Object.assign(questionToMove, this.getQuestion(questionNumberToMove));
        await questionToMove.moveToAfter(newPrevQuestionNumber);

        if(questionNumberToMove < newPrevQuestionNumber){
            // middle questions to up
            for (let q = questionNumberToMove+1; q <= newPrevQuestionNumber; q++) {
                let question = this.getQuestion(q);
                question.number--;
                Object.assign(this.getQuestion(q-1), question);
            }

            questionToMove.number = newPrevQuestionNumber;
            Object.assign(this.getQuestion(newPrevQuestionNumber), questionToMove);
        }
        else{
            // middle questions to down
            for (let q = questionNumberToMove; q <= newPrevQuestionNumber+2; q--) {
                Object.assign(this.getQuestion(q), this.getQuestion(q-1));
            }

            Object.assign(this.getQuestion(newPrevQuestionNumber+1), questionToMove);
        }
    }

    async clickOnQuestionGroupItemButton(questionNumber){
        await this.getQuestion(questionNumber).clickOnGroupItemButton();
        // update all group items left
        let questions = this.questions.filter((question) => (question.number !== questionNumber));
        for(let question of questions){
            console.log(`question ${question.number} - reinit group item`);
            await question.initGroupItem();
        }
    }
}

module.exports = EditionTabPage;