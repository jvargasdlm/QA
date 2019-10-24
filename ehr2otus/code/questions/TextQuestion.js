const EhrQuestion = require('./EhrQuestion');

class TextQuestion extends EhrQuestion{

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId);
        this.minLength = parseInt(ehrQuestionObj["minLength"]);
        this.maxLength = parseInt(ehrQuestionObj["maxLength"]);
    }

    toOtusStudioObj(){
        if(this.name.toLowerCase().includes("phone") || this.label.toLowerCase().includes("telefone")){
            return this.getOtusStudioQuestionHeader( "PhoneQuestion", "Integer");
        }
        let questionObj =  this.getOtusStudioQuestionHeader( "TextQuestion", "String");
        const limits = {
            "minLength": this.minLength,
            "maxLength": this.maxLength
        };
        for(let [limit, value] of Object.entries(limits)){
            if(!isNaN(value)){
                questionObj["fillingRules"]["options"][limit] = {
                    "extends": "StudioObject",
                    "objectType": "Rule",
                    "validatorType": limit,
                    "data": {
                        "canBeIgnored": true,
                        "reference": value
                    }
                };
            }
        }
        return questionObj;
    }

}

module.exports = TextQuestion;