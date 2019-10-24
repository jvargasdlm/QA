const EhrQuestion = require('./EhrQuestion');

class BasicQuestionGroup extends EhrQuestion{

    constructor(ehrQuestionObj, pageId){
        super(ehrQuestionObj, pageId);
    }

    toOtusStudioObj(ehrQuestionObj){

    }

}

module.exports = BasicQuestionGroup;