const PageElement = require('./PageElement');

class Calendar extends PageElement {

    constructor(pageExt){
        super(pageExt, "md-input-container");
        this.input = pageExt.getNewInputField();
        this.dialog = pageExt.getNewDialog();
        this.currDate = new Date();
    }

    async init(index=0){
        await this.initByAttributeSelector("[id='date']", index);
    }

    async initByAttributeSelector(attributeSelector, index=0){
        await super.initByAttributeSelectorAndSetTempId(attributeSelector, 'date', index);
    }

    async _initMyOwnAttributes(){
        this.input.elementHandle = await this.elementHandle.$(this.input.tagName+"[id='datetime']");
    }

    async _open(){
        await this.input.click();
        await this.dialog.waitForOpen();
        await this.pageExt.waitForMilliseconds(500);
    }

    async chooseToday(){
        await this.dialog.clickOnCustomizedActionButtonByIndex(0);
    }

    async _selectYear(year, millisecondsToWait=10){
        const numSteps = year - this.currDate.getFullYear();
        let numClicks = Math.abs(numSteps);
        let sign = numSteps / numClicks;
        let selector = `div[ng-click ='picker.incrementYear(${sign})']`;
        for (let i=0; i < numClicks; i++) {
            await this.pageExt.page.click(selector);
            await this.pageExt.waitForMilliseconds(millisecondsToWait);
        }
    }

    async _selectMonth(month, millisecondsToWait=10){
        const numSteps = month - (this.currDate.getMonth()+1);
        let numClicks = Math.abs(numSteps);
        let sign = numSteps / numClicks;
        let selector = `div[ng-click ='picker.incrementMonth(${sign})']`;
        for (let i=0; i < numClicks; i++) {
            await this.pageExt.page.click(selector);
            await this.pageExt.waitForMilliseconds(millisecondsToWait);
        }
    }

    async _selectDay(day){
        let actualMonthName = await this.pageExt.page.evaluate(() =>
            document.querySelector("div[class='dtp-actual-month ng-binding flex']").innerText);
        const MONTHS = (process.env.SHOW_BROWSER==='true' ?
            ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'] :
            ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']);
        let month = MONTHS.indexOf(actualMonthName) + 1;

        let year = await this.pageExt.page.evaluate(() =>
            document.querySelector("div[class='dtp-actual-year ng-binding flex']").innerText);

        let monthStr = month.toString().padStart(2, '0');
        let dayStr = day.toString().padStart(2, '0');

        await this.pageExt.clickWithWait(`#date-${year}-${monthStr}-${dayStr}`);
    }

    async openAndSelectDate(date) {
        try {
            await this._open();
            await this._selectYear(date.getFullYear());
            await this._selectMonth(date.getMonth());
            await this._selectDay(date.getDate());
            await this.dialog.clickOnOkButton();
            this.currDate = date;
        }
        catch (e) {
            console.log(`*${date}*\n`, e);
            throw e;
        }
    }

    async openAndSelectPeriod(year, month) {
        await this._open();
        await this._selectYear(year);
        await this._selectMonth(month);
        await this.dialog.clickOnOkButton();
    }

}

module.exports = Calendar;