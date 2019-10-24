const globalVars = require('../globalVars');

let currIndex = globalVars.FIRST_QUESTION_INDEX;

class EhrQuestion {

    constructor(ehrQuestionObj, pageId){
        this.id = ehrQuestionObj.id;
        this.name = ehrQuestionObj.name;
        this.label = ehrQuestionObj.label;
        this.metaDataGroupId = ehrQuestionObj.metaDataGroupId;
        this.pageId = pageId;
        this.index = currIndex++;
        this.hiddenQuestion = ehrQuestionObj.hiddenQuestion;
        this.visibleWhen = ehrQuestionObj.visibleWhen;
    }

    static get globalVars(){
        return globalVars;
    }

    equals(otherQuestion){
        if(!otherQuestion instanceof EhrQuestion){
            return false;
        }
        return (otherQuestion.id === this.id || otherQuestion.name === this.name);
    }

    // Must be implemented by children classes
    toOtusStudioObj(){

    }

    getOtusStudioQuestionHeader(questionType, dataType){
        let metaDataOptions = [];
        if(this.metaDataGroupId){
            metaDataOptions = this._getQuestionMetadataObj()
        }
        return {
            "extents": "SurveyItem",
            "objectType": questionType,
            "templateID": this.id,
            "customID": this.id,
            "dataType": dataType,
            "label": this._getLabelObj(),
            "metadata": {
                "extents": "StudioObject",
                "objectType": "MetadataGroup",
                "options": metaDataOptions
            },
            "fillingRules": {
                "extends": "StudioObject",
                "objectType": "FillingRules",
                "options": {
                    "mandatory": {
                        "extends": "StudioObject",
                        "objectType": "Rule",
                        "validatorType": "mandatory",
                        "data": {
                            "canBeIgnored": false,
                            "reference": true
                        }
                    }
                }
            }
        };
    }

    _getQuestionMetadataObj(){
        const labels = globalVars.metaDataGroups[this.metaDataGroupId];
        let options = [];
        let value = 1;
        for(let label of labels) {
            options.push({
                "extends": "StudioObject",
                "objectType": "MetadataAnswer",
                "dataType": "Integer",
                "value": value,
                "extractionValue": value,
                "label": this._getLabelObj()
            });
            value++;
        }
        return options;
    }

    _getLabelObj(){
        return EhrQuestion.getLabelObj(this.label);
    }

    static getLabelObj(label){
        label = label.replace("[\/b]", "").replace("[b]", "");
        return {
            "ptBR": {
                "extends": "StudioObject",
                "objectType": "Label",
                "oid": "",
                "plainText": label,
                "formattedText": label
            },
            "enUS": {
                "extends": "StudioObject",
                "objectType": "Label",
                "oid": "",
                "plainText": "",
                "formattedText": ""
            },
            "esES": {
                "extends": "StudioObject",
                "objectType": "Label",
                "oid": "",
                "plainText": "",
                "formattedText": ""
            }
        };
    }

}

module.exports = EhrQuestion;