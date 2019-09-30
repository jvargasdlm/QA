const utils         = require('../utils');
const fileHandler   = require('../handlers/FileHandler');
const ErrorLogger   = require('./ErrorLogger');
// Page elements
const PageElement    = require('./PageElement');
const Calendar       = require('./Calendar');
const Checkbox       = require('./Checkbox');
const Dialog         = require('./Dialog');
const DialogWarning  = require('./DialogWarning');
const OptionSelector = require('./OptionSelector');

// ***********************************************
// Constants
require('custom-env').env('staging');
const WAIT_FOR_SELECTOR_TIMEOUT = parseInt(process.env.WAIT_FOR_SELECTOR_TIMEOUT, 10);
const LOG_NAVIGATION_ACTIONS    = (process.env.LOG_NAVIGATION_ACTIONS === 'true');

const typeCodes ={
    OTUS: 0,
    OTUS_STUDIO: 1,
    OTUS_DOMAIN: 2
};

// ***********************************************

let errorLogger = new ErrorLogger();

class PageExtended {
    
    constructor(page){
        this.page = page;
        this.typeCode = -1;
    }

    // ----------------------------------------------------------
    // Getters

    get IamAOtusPage(){
        return (this.typeCode === typeCodes.OTUS);
    }

    get errorLogger(){
        return errorLogger;
    }

    get waitLib(){
        return utils.wait;
    }

    get typeCodes(){
        return typeCodes;
    }

    getCalendar(){
        return new Calendar(this);
    }

    getDialog(){
        return new Dialog(this);
    }

    getDialogWarning(){
        return new DialogWarning(this);
    }

    getCheckbox(){
        return new Checkbox(this);
    }

    getOptionSelector(){
        return new OptionSelector(this);
    }

    // ----------------------------------------------------------
    // page main functions

    async close(){
        await this.page.close();
    }

    async setDownloadPath(){
        const path = process.cwd() + process.env.DOWNLOADS_LOCAL_DIR_PATH;
        await this.page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path});
    }

    async gotoUrl(url){
        await this.page.goto(url);
    }

    async goBack(){
        await this.page.goBack();
    }

    async refresh(){
        const timeout = parseInt(process.env.LOAD_PAGE_TIMEOUT, 10);
        await this.page.reload({timeout: timeout});
    }

    async screenshot(filename){
        const path = process.cwd() + process.env.SCREENSHOT_LOCAL_DIR_PATH + '/' + filename;
        await this.page.screenshot({ path: path, fullPage: true });
        if(LOG_NAVIGATION_ACTIONS){
            console.log('Screenshot taked and saved at', filename);//.
        }
    }

    // wait for selector functions ----------------------------------------------

    async waitForSelector(selector){
        try {
            return await this.page.waitForSelector(selector, {timeout: WAIT_FOR_SELECTOR_TIMEOUT});
        }
        catch (e) {
            await this.hasElementSelector(selector);
            throw e;
        }
    }

    async waitForSelectorHidden(selector){
        //await this.pageHasElementSelector(selector);//.
        return await this.page.waitForSelector(selector, {hidden: true, timeout: WAIT_FOR_SELECTOR_TIMEOUT});
    }

    async waitForMilliseconds(milliseconds){
        await utils.wait.forMilliseconds(milliseconds);
    }

    // type --------------------------------------------------------------

    async typeWithWait(selector, text){
        try {
            let element = await this.page.waitForSelector(selector, {timeout: WAIT_FOR_SELECTOR_TIMEOUT});
            await element.type(text);
            if(LOG_NAVIGATION_ACTIONS) {
                console.log('type on ' + selector);//.
            }
        }
        catch (e) {
            if(LOG_NAVIGATION_ACTIONS) {
                console.log('ERROR at type on ' + selector);//.
                await this.hasElementSelector(selector);//.
            }
            throw e;
        }
    }

    // click -----------------------------------------------------------

    async clickWithWait(selector){
        try {
            let element = await this.page.waitForSelector(selector, {timeout: WAIT_FOR_SELECTOR_TIMEOUT});
            await element.click();
            if(LOG_NAVIGATION_ACTIONS) {
                console.log('clicked on ' + selector);//.
            }
        }
        catch (e) {
            if(LOG_NAVIGATION_ACTIONS) {
                console.log('ERROR at click on ' + selector);//.
                await this.hasElementSelector(selector);//.
            }
            throw e;
        }
    };

    async clickOnButtonByAttribute(uniqueAttrName, uniqueAttrValue){
        await this.clickWithWait(`button[${uniqueAttrName}='${uniqueAttrValue}']`);
    }

    // -------------------------------------------------------------------------------------

    async findChildren(parentSelector, childrenTag){
        await PageElement.findChildren(this.page, parentSelector, childrenTag);
    }

    // -------------------------------------------------------------------------------------
    // find in list

    async getElementFromListByInnerText(selector, requiredInnerText){
        await this.waitForSelector(selector);
        let elemList = await this.page.$$(selector);
        //console.log('getElementFromListByAttribute', selector, ': num elems =', elemList.length);//.
        let i=0;
        while(i < elemList.length){
            let text = elemList[i].innerText;
            console.log(i, 'text =', text);//.
            if(text === requiredInnerText){
                return elemList[i];
            }
            i++;
        }
    };

    async getElementFromList(selector, index){
        await this.waitForSelector(selector);
        let elemList = await this.page.$$(selector);
        //console.log(`getElementFromList (${elemList.length}): selector = ${selector}, element = \n`, elemList[index]._remoteObject);//.
        return elemList[index];
    }

    async getInnerTextFromList(selector, index){
        //console.log('PageExtended.getInnerTextFromList 1: selector =', selector);//.
        //await this.waitForSelector(selector);
        //console.log('PageExtended.getInnerTextFromList 2: selector ok');//.
        try {
            let result =  await this.page.evaluate((selector, index) => {
                let arr = Array.from(document.querySelectorAll(selector));
                return arr[index].innerText;
            }, selector, index);
            console.log('PageExtended.getInnerTextFromList: result =', result);//.
            return result;
        }
        catch (e) {
            console.log('getInnerText: selector =', selector);
            await this.hasElementSelector(selector);
        }
    }

    async getElementFromListByAttribute(selector, index){
        await this.waitForSelector(selector);
        let elemList = await (this.page).$$(selector);
        let element = elemList[index];
        if(!element){
            throw `element '${selector}' index=${index} not found (list contains ${elemList.length} elements)`;
        }
        return element;
    };

    async getLastElementOfList(selector){
        await this.waitForSelector(selector);
        let elemList = await this.page.$$(selector);
        let element =  elemList[elemList.length-1];
        if(!element){
            throw `last element of list '${selector}' not found (list contains ${elemList.length} elements)`;
        }
        return element;
    };

    async clickOnElementOfList(selector, index){
        const element = await this.getElementFromListByAttribute(selector, index);
        await element.click();
    };

    async clickOnLastElementOfList(selector){
        const element = await this.getLastElementOfList(selector);
        await element.click();
    }

    async clickAfterFindInList(selector, index){
        const element = await this.getElementFromList(selector, index);
        await element.click();
    }

    //
    async waitForHiddenAttributeValue(selector, boolValue){
        await this.waitForSelector(selector + `[aria-hidden='${boolValue}']`);
    }

    async waitForExpandedAttributeValue(selector, boolValue){
        await this.waitForSelector(selector + `[aria-expanded='${boolValue}']`);
    }

    async setHiddenAttributeValue(selector, boolValue){
        return await this.page.$eval(selector, (element, boolValue) => {
            if(element.getAttribute('aria-hidden')){
                element.setAttribute('aria-hidden', boolValue.toString());
            }
            return element.outerHTML;
        }, boolValue);
    }

    // Debug ------------------------------------------------------------------------

    enableConsoleLog(){
        this.page.on('console', consoleObj => console.log(consoleObj.text()));
    }

    async hasElementSelector(selector, index=-1){
        const elemList = await this.page.$$(selector);
        let has = (elemList.length > 0);
        let log = `page has element ${selector}? ${has} (${elemList.length})`;
        if(index >= 0){
            const iHtml = await this.page.evaluate(el => el.outerHTML, elemList[index]);
            log += '\n' + iHtml;
        }
        console.log(log);
    }

    async hasElement(directive, uniqueAttributeName, uniqueAttributeValue){
        let selector = `${directive}[${uniqueAttributeName}='${uniqueAttributeValue}']`;
        await this.hasElementSelector(selector);
    }

    async saveHTML(filenameNoExtension){
        let path = './downloads/'+filenameNoExtension+'.html';
        let content = await this.page.evaluate(() => {
            return document.body.innerHTML;
        });
        fileHandler.write(path, content);
    }

}

module.exports = PageExtended;