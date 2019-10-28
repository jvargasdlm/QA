const globalVars = require('./globalVars');

class ExpressionEhr {

    constructor(ehrExpressionObj, questionId){
        this.questionId = questionId;
        this.questionName = ehrExpressionObj.questionName;//.
        this.operator = ehrExpressionObj.operator;
        this.value = ehrExpressionObj.value;
        this.isMetadata = (ehrExpressionObj.questionName.includes("Metadata"));
    }

    toOtusStudioObj(){
        //console.log("antes", this.value);//.
        if(!this.isMetadata) {
            this.value = globalVars.choiceGroups.findChoiceLabel(this.value);
        }
        //console.log("antes", this.value);//.

        const operatorDict = {
            "EQ": "equal",
            "GT": "greater"
        };
        return {
            "extents": "SurveyTemplateObject",
            "objectType": "Rule",
            "when": this.questionId,
            "operator": operatorDict[this.operator],
            "answer": this.value,
            "isMetadata": this.isMetadata,
            "isCustom": true
        };
    }
}

module.exports = ExpressionEhr;