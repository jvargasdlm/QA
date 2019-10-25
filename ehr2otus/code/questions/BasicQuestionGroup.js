class BasicQuestionGroup {

    constructor(){
        this.name = undefined;
        this.id = undefined;
        this.questionIdArr = [];
    }

    addQuestionId(questionId){
        this.questionIdArr.push(questionId);
    }
}

module.exports = BasicQuestionGroup;