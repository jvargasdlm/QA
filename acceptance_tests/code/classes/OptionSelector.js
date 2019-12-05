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

const OPTION_TAG = 'md-option',
    MENU_OPTIONS_OPENED = 'md-select-menu';

class OptionSelector extends PageElement {

    constructor(pageExt){
        super(pageExt, 'md-select');
        selectors = (pageExt.typeCode === pageExt.typeCodes.OTUS_STUDIO ? selectorsForOtusStudio : selectorsForOtus);
    }

    async _openMenu(){
        await this.elementHandle.click();
        await this.pageExt.waitForSelector(selectors.OPTIONS_OPENED);
    }

    async _openMenuAndSetOptionTempIds(){
        await this._openMenu();
        return await this.pageExt.findChildrenToSetTempIdsFromInnerText(selectors.OPTIONS_OPENED, OPTION_TAG);
    }

    async selectOption(optionValue){
        await this._openMenu();
        await this.pageExt.clickWithWait(`${OPTION_TAG}[value='${optionValue}']`);
    }

    async selectOptionByIndex(optionIndex){
        let tempIds = [];
        try {
            tempIds = await this._openMenuAndSetOptionTempIds();
            await this.pageExt.waitForMilliseconds(500);
            await this.pageExt.clickWithWait('#'+tempIds[optionIndex]);
        }
        catch(e){
            await this.pageExt.hasElementWithLog(OPTION_TAG);
            await this.pageExt.hasElementWithLog(MENU_OPTIONS_OPENED);
            await this.pageExt.hasElementWithLog(selectors.OPTIONS_OPENED);//.
            throw e;
        }
    }

    async selectOptionBySelectors(selectAttributesSelector, optionValue, optionExtraAttrSelector=''){
        await this.pageExt.clickWithWait(`${this.tagName}${selectAttributesSelector}`);
        await this.pageExt.waitForSelector(selectors.OPTIONS_OPENED); // wait open options
        await this.pageExt.clickWithWait(`${OPTION_TAG}[value='${optionValue}']${optionExtraAttrSelector}`);
    }

    async waitCloseForFirstTime(){
        await this.pageExt.waitForSelector(selectors.OPTIONS_CLOSED_FOR_FIRST_TIME);
    }

    async waitClose(){
        await this.pageExt.waitForSelector(selectors.OPTIONS_CLOSED_ALREADY_OPENED);
    }
}

module.exports = OptionSelector;