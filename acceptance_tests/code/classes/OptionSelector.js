const PageElement = require('./PageElement');

const selectorsForOtusStudio = {
    OPTIONS_CLOSED_FOR_FIRST_TIME:  "div[class='md-select-menu-container md-layoutTheme-theme']",
    OPTIONS_OPENED:                 "div[class='md-select-menu-container md-layoutTheme-theme md-active md-clickable']",
    OPTIONS_CLOSED_ALREADY_OPENED:  "div[class='md-select-menu-container md-layoutTheme-theme md-leave']",
};

const selectorsForOtus = {
    OPTIONS_CLOSED_FOR_FIRST_TIME:  "div[class='md-select-menu-container md-default-theme']",
    OPTIONS_OPENED:                 "div[class='md-select-menu-container md-default-theme md-active md-clickable']",
    OPTIONS_CLOSED_ALREADY_OPENED:  "div[class='md-select-menu-container md-default-theme md-leave']",
};

let selectors;

class OptionSelector extends PageElement {

    constructor(pageExt){
        super(pageExt, 'md-select');
        selectors = (pageExt.typeCode === pageExt.typeCodes.OTUS_STUDIO ? selectorsForOtusStudio : selectorsForOtus);
    }

    async selectOption(optionValue){
        await this.elementHandle.click();
        //await this.pageExt.waitForSelector(selectors.OPTIONS_OPENED); // wait open options
        await this.pageExt.clickWithWait(`md-option[value='${optionValue}']`);
    }

    async selectOptionByIndex_temp(optionIndex){
        await this.elementHandle.click();
        await this.pageExt.waitForSelector(`${this.tagName}[aria-expanded='true']`); // wait open options
        const option = (await this.pageExt.page.$$("md-option"))[optionIndex];
        await option.click();
    }

    async selectOptionBySelectors(selectAttributesSelector, optionValue, optionExtraAttrSelector=''){
        await this.pageExt.clickWithWait(`${this.tagName}${selectAttributesSelector}`);
        await this.pageExt.waitForSelector(selectors.OPTIONS_OPENED); // wait open options
        await this.pageExt.clickWithWait(`md-option[value='${optionValue}']${optionExtraAttrSelector}`);
    }

    async waitCloseForFirstTime(){
        await this.pageExt.waitForSelector(selectors.OPTIONS_CLOSED_FOR_FIRST_TIME);
    }

    async waitClose(){
        await this.pageExt.waitForSelector(selectors.OPTIONS_CLOSED_ALREADY_OPENED);
    }
}

module.exports = OptionSelector;