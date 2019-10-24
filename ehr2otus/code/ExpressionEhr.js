const globalVars = require('./globalVars');

class ExpressionEhr {

    constructor(ehrExpressionObj, questionId){
        this.questionId = questionId;
        this.questionName = ehrExpressionObj.questionName;//.
        this.operator = ehrExpressionObj.operator;
        this.value = ehrExpressionObj.value;
        this.isMetadata = (ehrExpressionObj.questionName.includes("Metadata"));
    }

    parseValue(){
        if(!this.isMetadata){
            const isNumValue = !isNaN(parseInt(this.value));
            const isBoolValue = (this.value === 'true' || this.value === 'false');
            if(isNumValue || isBoolValue){
                return;
            }

            for(let [id, choices] of Object.entries(globalVars.choiceGroups)) {
                for (let choice of choices) {
                    if(choice.name === this.value){
                        this.value = choice.label;
                        return;
                    }
                }
            }
        }
    }

    toOtusStudioObj(){
        //console.log("antes", this.value);//.
        this.parseValue();
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