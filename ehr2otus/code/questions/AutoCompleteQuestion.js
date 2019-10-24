const EhrQuestion = require('./EhrQuestion');

class AutoCompleteQuestion extends EhrQuestion {

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId);
        this.itemValue = ehrQuestionObj.itemValue;
    }

    toOtusStudioObj(){
        let questionObj = this.getOtusStudioQuestionHeader("AutocompleteQuestion", "String");
        questionObj['dataSources'] = [this.itemValue];
        return questionObj;
    }
}

module.exports = AutoCompleteQuestion;