const ReportPage = require('./ReportPage');

class ActivityReportPage extends ReportPage {

    constructor(page){
        super(page);
    }

    // TODO
    async extractItems(){

    }
}

class ActivityReportItem {

    // TODO
    constructor(innerTextArr) {
        //this.questionText = '';
        //this.answer = '';
        this.condition = '';
        this.checked = false;
    }
}

module.exports = ActivityReportPage;