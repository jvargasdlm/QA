require('custom-env').env('staging');

const utils         = require('../utils');
const FileHandler   = require('../handlers/FileHandler');
const ErrorLogger   = require('./ErrorLogger');
// Page elements
const AutoCompleteSearch = require('./AutoCompleteSearch');
const Button         = require('./Button');
const Calendar       = require('./Calendar');
const Checkbox       = require('./Checkbox');
const Dialog         = require('./Dialog');
const DialogWarning  = require('./DialogWarning');
const InputField     = require('./InputField');
const OptionSelector = require('./OptionSelector');
const Menu           = require('./Menu');
const Switch         = require('./Switch');

// ***********************************************
// Constants
require('custom-env').env('staging');
const WAIT_FOR_SELECTOR_TIMEOUT = parseInt(process.env.WAIT_FOR_SELECTOR_TIMEOUT, 10);
const LOG_NAVIGATION_ACTIONS    = (process.env.LOG_NAVIGATION_ACTIONS === 'true');
const IS_HIDE_XS = (process.env.WINDOW_WIDTH >= 600);
const typeCodes ={
    OTUS: 0,
    OTUS_STUDIO: 1,
    OTUS_DOMAIN: 2
};

// ***********************************************

let _errorLogger = new ErrorLogger();

class PageExtended {
    
    constructor(page){
        this.page = page;
        this.typeCode = -1;
    }

    // --------------------------------------------------------
    // env variable dependencies

    get isBigScreenHideXs(){
        return IS_HIDE_XS;
    }

    // ----------------------------------------------------------
    // Getters

    get amIAOtusPage(){
        return (this.typeCode === typeCodes.OTUS);
    }

    get typeCodeName(){
        return Object.keys(typeCodes)[this.typeCode];
    }

    get errorLogger(){
        return _errorLogger;
    }

    get waitLib(){
        return utils.wait;
    }

    get typeCodes(){
        return typeCodes;
    }

    /***************************************************
     * Get new page element instance
     */

    getNewAutoCompleteSearch(){
        return new AutoCompleteSearch(this);
    }

    getNewButton(){
        return new Button(this);
    }

    getNewCalendar(){
        return new Calendar(this);
    }

    getNewDialog(){
        return new Dialog(this);
    }

    getNewDialogWarning(){
        return new DialogWarning(this);
    }

    getNewCheckbox(){
        return new Checkbox(this);
    }

    getNewInputField(){
        return new InputField(this);
    }

    getNewMenu(){
        return new Menu(this);
    }

    getNewOptionSelector(){
        return new OptionSelector(this);
    }

    getNewSwitch(){
        return new Switch(this);
    }

    /* ********************************************************************
     * Page main functions
     */

    async close(){
        await this.page.close();
    }

    async closeAsNewTab(){
        await this.page.goto('about:blank');
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

    /* ********************************************************************
     * Wait functions
     */
    async waitForSelector(selector, timeout=WAIT_FOR_SELECTOR_TIMEOUT){
        try {
            return await this.page.waitForSelector(selector, {timeout: timeout});
        }
        catch (e) {
            await this.hasElementSelector(selector);//.
            throw e;
        }
    }

    async waitForSelectorVisible(selector){
        //await this.pageHasElementSelector(selector);//.
        return await this.page.waitForSelector(selector, {hidden: false, timeout: WAIT_FOR_SELECTOR_TIMEOUT});
    }

    async waitForSelectorHidden(selector){
        //await this.pageHasElementSelector(selector);//.
        return await this.page.waitForSelector(selector, {hidden: true, timeout: WAIT_FOR_SELECTOR_TIMEOUT});
    }

    async waitForHiddenAttributeValue(selector, boolValue){
        await this.waitForSelector(selector + `[aria-hidden='${boolValue}']`);
    }

    async waitForExpandedAttributeValue(selector, boolValue){
        await this.waitForSelector(selector + `[aria-expanded='${boolValue}']`);
    }

    async waitForMilliseconds(milliseconds){
        await utils.wait.forMilliseconds(milliseconds);
    }

    /* ********************************************************************
     * Type text
     */

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

    async clearInput(selector){
        await this.page.evaluate(function(selector) {
            document.querySelector(selector).value = ''
        }, selector);
    }

    /* ********************************************************************
     * Clicks
     */

    async clickWithWait(selector){
        try {
            let element = await this.page.waitForSelector(selector, {timeout: WAIT_FOR_SELECTOR_TIMEOUT});
            await element.click();
            if(LOG_NAVIGATION_ACTIONS) {
                console.log('clicked on ' + selector);//.
            }
        }
        catch (e) {
            //if(LOG_NAVIGATION_ACTIONS) {
                console.log('ERROR at click on ' + selector);//.
                await this.hasElementSelector(selector);//.
            //}
            throw e;
        }
    };

    async clickOnButtonByAttribute(uniqueAttrName, uniqueAttrValue){
        await this.clickWithWait(`button[${uniqueAttrName}='${uniqueAttrValue}']`);
    }

    /* ********************************************************************
     * Query selector
     */

    async findChildrenToSetTempIdsFromInnerText(parentSelector, childrenTag){
        //this.enableConsoleLog();//.
        return await this.page.evaluate((_parentSelector, _childrenTag) => {
            let parentNode = document.body.querySelector(_parentSelector);
            let tempIdArray = [];

            function pushId(currentNode) {
                const isNodeEmpty = (Object.entries(currentNode).length === 0);
                if (!isNodeEmpty && currentNode.tagName.toLowerCase() === _childrenTag) {
                    let id = currentNode.getAttribute('id');
                    if(!id){
                        id = currentNode.innerText.replace('\n', '');
                        //console.log(currentNode.outerHTML, `\nset id: innerText = *${id}*`);//.
                        id += `_${tempIdArray.length}`;
                        currentNode.setAttribute('id', id);
                    }
                    tempIdArray.push(id);

                    //console.log(typeof currentNode, "after set id: id =", currentNode.getAttribute("id"));//.
                }
            }

            function walkTheDOM(node, func) {
                func(node);
                node = node.firstChild;
                while (node) {
                    walkTheDOM(node, func);
                    node = node.nextSibling;
                }
            }

            walkTheDOM(parentNode, pushId);
            return tempIdArray;

        }, parentSelector, childrenTag);
    }

    async findChildrenButtonToSetTempIdsFromInnerText(parentSelector){
        return await this.findChildrenToSetTempIdsFromInnerText(parentSelector, "button");
    }

    async findChildrenToSetTempIds(parentSelector, childrenTag, tempIdArr){
        return await this.page.evaluate((_parentSelector, _childrenTag, _tempIdArr) => {
            const parentNode = document.body.querySelector(_parentSelector);
            let i = 0;

            function pushId(currentNode) {
                const isNodeEmpty = (Object.entries(currentNode).length === 0);
                if (!isNodeEmpty && currentNode.tagName.toLowerCase() === _childrenTag) {
                    currentNode.setAttribute('id', _tempIdArr[i++]);
                }
            }

            function walkTheDOM(node, func) {
                func(node);
                node = node.firstChild;
                while (node) {
                    walkTheDOM(node, func);
                    node = node.nextSibling;
                }
            }

            walkTheDOM(parentNode, pushId);

        }, parentSelector, childrenTag, tempIdArr);
    }

    async findChildrenButtonToSetTempIds(parentSelector, tempIdArr){
        return await this.findChildrenToSetTempIds(parentSelector, "button", tempIdArr);
    }

    async getInnerText(selector){
        await this.waitForSelector(selector);
        try {
            return await this.page.evaluate((selector) => {
                let element = document.querySelector(selector);
                return element.innerText;
            }, selector);
        }
        catch (e) {
            console.log('getInnerText: selector =', selector);
            await this.hasElementSelector(selector);
        }
    }

    /* ********************************************************************
     * Find in list
     */

    async getElementFromList(selector, index){
        await this.waitForSelector(selector);
        let elemList = await this.page.$$(selector);
        //console.log(`getElementFromList (${elemList.length}): selector = ${selector}, element = \n`, elemList[index]._remoteObject);//.
        return elemList[index];
    }

    async _getElementFromListByAttribute(selector, index){
        await this.waitForSelector(selector);
        let elemList = await (this.page).$$(selector);
        let element = elemList[index];
        if(!element){
            throw `element '${selector}' index=${index} not found (list contains ${elemList.length} elements)`;
        }
        return element;
    }

    async _getLastElementOfList(selector){
        await this.waitForSelector(selector);
        let elemList = await this.page.$$(selector);
        let element =  elemList[elemList.length-1];
        if(!element){
            throw `last element of list '${selector}' not found (list contains ${elemList.length} elements)`;
        }
        return element;
    }

    async clickOnElementOfList(selector, index){
        const element = await this._getElementFromListByAttribute(selector, index);
        await element.click();
    }

    async clickOnLastElementOfList(selector){
        const element = await this._getLastElementOfList(selector);
        await element.click();
    }

    async clickAfterFindInList(selector, index){
        const element = await this.getElementFromList(selector, index);
        await element.click();
    }

    async setHiddenAttributeValue(selector, boolValue){
        return await this.page.$eval(selector, (element, boolValue) => {
            if(element.getAttribute('aria-hidden')){
                element.setAttribute('aria-hidden', boolValue.toString());
            }
            return element.outerHTML;
        }, boolValue);
    }

    /* ********************************************************************
     * Debug
     */

    enableConsoleLog(){
        this.page.on('console', consoleObj => console.log(consoleObj.text()));
    }

    async hasElementSelector(selector, index=-1){
        try {
            const elemList = await this.page.$$(selector);
            let has = (elemList.length > 0);
            let log = `page has element ${selector}? ${has} (${elemList.length})`;
            if (index >= 0) {
                const iHtml = await this.page.evaluate(el => el.outerHTML, elemList[index]);
                log += '\n' + iHtml;
            }
            console.log(log);
        }
        catch (e) {
            console.log(e);
        }
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
        FileHandler.write(path, content);
    }

    async saveText(filenameNoExtension){
        let path = './downloads/'+filenameNoExtension+'.txt';
        let content = await this.page.evaluate(() => {
            return document.body.innerText;
        });
        FileHandler.write(path, content);
    }

}

module.exports = PageExtended;
