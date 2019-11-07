const ReportPage = require('../ReportPage');

class ActivityReportPage extends ReportPage {

    constructor(page){
        super(page);
    }

    // TODO
    async extractItems(){
        this.enableConsoleLog();
        return await this.page.evaluate((valuesSelector) => {
            const element = document.body.querySelector(valuesSelector);
            return element.innerText.split('\n');
        }, ReportPage.selectors.ITEMS);
    }

    async _replaceContent(sentencesArr){
        await this.page.evaluate((itemSelector, sentencesArr) => {
            document.body.querySelector(itemSelector).innerText = sentencesArr.join('\n');
        }, ReportPage.selectors.ITEMS, sentencesArr);
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