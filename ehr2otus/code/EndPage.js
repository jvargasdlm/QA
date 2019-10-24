const globalVars = require('./globalVars');
const QuestionPage = require('./QuestionPage');

class EndPage extends QuestionPage{

    constructor(){
        super();
        this.id = globalVars.END_PAGE_ID;
    }

    // TODO
    readFromJsonObj(ehrEndPageObj){

    }

}

module.exports = EndPage;