const PageElement = require('./PageElement');

class Calendar extends PageElement {

    constructor(pageExt){
        super(pageExt, '');
    }

    async open(inputAriaLabelValue){
        await this.pageExt.clickWithWait(`input[aria-label='${inputAriaLabelValue}']`);
        await (this.pageExt.getNewDialog()).waitForOpen();
    }

    async waitForClose(){
        await (this.pageExt.getNewDialog()).waitForClose();
    }

    async chooseToday(){
        await this.pageExt.clickWithWait("button[ng-click='picker.today()'");
    }

    async clickCancelButton(){
        await this.pageExt.clickWithWait("button[ng-click='picker.cancel()'");
    }

    async clickOkButton(){
        await this.pageExt.clickWithWait("button[ng-click='picker.ok()'");
    }

    async selectYear(numSteps, millisecondsToWait=10){
        let numClicks = Math.abs(numSteps);
        let sign = numSteps / numClicks;
        let selector = `div[ng-click ='picker.incrementYear(${sign})']`;
        for (let i=0; i < numClicks; i++) {
            await this.pageExt.page.click(selector);
            await this.pageExt.waitForMilliseconds(millisecondsToWait);
        }
    }

    async selectMonth(numSteps, millisecondsToWait=10){
        let numClicks = Math.abs(numSteps);
        let sign = numSteps / numClicks;
        let selector = `div[ng-click ='picker.incrementMonth(${sign})']`;
        for (let i=0; i < numClicks; i++) {
            await this.pageExt.page.click(selector);
            await this.pageExt.waitForMilliseconds(millisecondsToWait);
        }
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
    }

    async openAndSelectDate(inputAriaLabel, yearSteps, monthSteps, day) {
        await this.open(inputAriaLabel);
        await this.selectYear(yearSteps);
        await this.selectMonth(monthSteps);
        await this.selectDay(day);
        await this.clickOkButton();
        await this.waitForClose();
    }

    async openAndSelectPeriod(inputAriaLabel, yearSteps, monthSteps) {
        await this.open(inputAriaLabel);
        await this.selectYear(yearSteps);
        await this.selectMonth(monthSteps);
        await this.clickOkButton();
        await this.waitForClose();
    }

}

module.exports = Calendar;