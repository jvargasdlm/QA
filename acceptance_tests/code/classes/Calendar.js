const Dialog = require('./Dialog');

class Calendar extends Dialog {

    constructor(pageExt){
        super(pageExt);
        this.input = pageExt.getNewInputField();
        this.currDate = null;
    }

    async init(index=0){
        await this.initBySelector("md-input-container[id='date']", index);
    }

    async _initMyOwnAttributes(){
        this.input.elementHandle = await this.elementHandle.$("input[id='datetime']");
    }

    async open(){
        await this.input.click();
        await this.waitForOpen();
        this.currDate = new Date();
    }

    async chooseToday(){
        await this.clickOnCustomizedActionButtonByIndex(0);
        //await this.pageExt.clickWithWait("button[ng-click='picker.today()'");
    }

    async selectYear(year, millisecondsToWait=10){
        const numSteps = year - this.currDate.getFullYear();
        let numClicks = Math.abs(numSteps);
        let sign = numSteps / numClicks;
        let selector = `div[ng-click ='picker.incrementYear(${sign})']`;
        for (let i=0; i < numClicks; i++) {
            await this.pageExt.page.click(selector);
            await this.pageExt.waitForMilliseconds(millisecondsToWait);
        }
        this.currDate.year = year;
    }

    async selectMonth(month, millisecondsToWait=10){
        const numSteps = month - (this.currDate.getMonth()+1);
        let numClicks = Math.abs(numSteps);
        let sign = numSteps / numClicks;
        let selector = `div[ng-click ='picker.incrementMonth(${sign})']`;
        for (let i=0; i < numClicks; i++) {
            await this.pageExt.page.click(selector);
            await this.pageExt.waitForMilliseconds(millisecondsToWait);
        }
        this.currDate.month = month-1;
    }

    async selectDay(day){
        let actualMonthName = await this.pageExt.page.evaluate(() =>
            document.querySelector("div[class='dtp-actual-month ng-binding flex']").innerText);
        const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        let month = MONTHS.indexOf(actualMonthName) + 1;

        let year = await this.pageExt.page.evaluate(() =>
            document.querySelector("div[class='dtp-actual-year ng-binding flex']").innerText);

        let monthStr = month.toString().padStart(2, '0');
        let dayStr = day.toString().padStart(2, '0');

        await this.pageExt.clickWithWait(`#date-${year}-${monthStr}-${dayStr}`);
        this.currDate.date = day;
    }

    async openAndSelectDate(date) {
        await this.open();
        await this.selectYear(date.getFullYear());
        await this.selectMonth(date.getMonth());
        await this.selectDay(date.getDate());
        await this.clickOnOkButton();
    }

    async openAndSelectPeriod(year, month) {
        await this.open();
        await this.selectYear(year);
        await this.selectMonth(month);
        await this.clickOnOkButton();
    }

}

module.exports = Calendar;