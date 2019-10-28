class BasicQuestionGroup {

    constructor(){
        this.name = undefined;
        this.id = undefined;
        this.questionIdArr = [];
    }

    addQuestionId(questionId){
        this.questionIdArr.push(questionId);
    }

    getFirstQuestionId(){
        return this.questionIdArr[0];
    }
}

module.exports = BasicQuestionGroup;