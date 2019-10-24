const EhrQuestion = require('./EhrQuestion');

class BasicQuestionGroup extends EhrQuestion{

    constructor(jsonObject, pageId){
        super(jsonObject, pageId);
    }

    toOtusStudioObj(ehrQuestionObj){

    }

}

module.exports = BasicQuestionGroup;