class HiddenQuestion {

    constructor(id, conditionQuestionId, conditionAnswerToBeVisible){
        this.id = id;
        this.conditionQuestionId = conditionQuestionId;
        this.conditionAnswerToBeVisible = conditionAnswerToBeVisible;
    }
}

module.exports = HiddenQuestion;