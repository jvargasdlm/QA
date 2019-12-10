const ReportPage = require('../ReportPage');

class ActivityReportPage extends ReportPage {

    constructor(page){
        super(page);
    }

    // TODO
    async extractItems(){
        return (await this.getInnerTextBySelector(ReportPage.selectors.ITEMS))
            .split('\n');
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
        this.condition = '';
        this.checked = false;
    }
}

module.exports = ActivityReportPage;