const EhrQuestion = require('./EhrQuestion');

class DateQuestion extends EhrQuestion{

    constructor(jsonObject, pageId){
        super(jsonObject, pageId);
    }

    toOtusStudioObj(){
        return this.getOtusStudioQuestionHeader( "CalendarQuestion", "LocalDate");
    }

}

module.exports = DateQuestion;