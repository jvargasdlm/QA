/*
Ao inves de enviar selector para waitForSelector, enviar o PageEelement,
que contém toda a informação da pagina e do elemento em si (tipo) para o log !
 */

class PageElement {
    
    constructor(pageExt, tag){
        this.pageExt = pageExt;
        this.tagName = tag;
        this.id = undefined;
        this.elementHandle = undefined;
    }

    get wasInitialized(){
        return (this.elementHandle !== undefined);
    }

    async initById(id){
        this.id = id;
        this.elementHandle = await this.pageExt.waitForSelector(`[id='${id}']`);
        await this._initMyOwnAttributes();
    }

    async initByTag(index=0){
        await this.pageExt.waitForSelector(this.tagName);
        this.elementHandle = (await this.pageExt.page.$$(this.tagName))[index];
        await this._initMyOwnAttributes();
    }

    async initByTagAndSetTempId(tempId, index=0){
        try {
            await this.initBySelectorAndSetTempId(this.tagName, tempId, index);
        }
        catch (e) {
            throw `ERROR at init pageElement by tag '${this.tagName} (page has tag? ${await this.pageExt.hasElement(this.tagName)})'\n${e}`;
        }
    }

    async initByAttributeSelectorAndSetTempId(attributesSelector, tempId, index=0){
        await this.initBySelectorAndSetTempId(this.tagName + attributesSelector, tempId, index);
    }

    async initBySelectorAndSetTempId(selector, tempId, index=0){
        await this.pageExt.waitForSelector(selector);
        try {
            await this.setTempId(selector,tempId, index);
            await this.initById(tempId);
        }
        catch (e) {
            throw `ERROR at init pageElement by selector '${selector} with index=${index} and tempId '${tempId}` +
                `(page has selector? ${await this.pageExt.hasElement(selector)})'\n${e}`;
        }
    }

    async initByParentElement(parentElementHandle, childAttributeSelector, index=0){
        this.elementHandle = (await parentElementHandle.$$(this.tagName+childAttributeSelector))[index];
        await this._initMyOwnAttributes();
    }

    async setTempId(selector, tempId, index=0){
        await this.pageExt.page.evaluate((selector, tempId, index) => {
            const element = (document.body.querySelectorAll(selector))[index];
            element.setAttribute("id", tempId);
        }, selector, tempId, index);
        this.id = tempId;
    }

    // Implemented by children classes
    async _initMyOwnAttributes(){

    }

    /********************************************************
     * Getters
     */

    async getAttribute(attributeName){
        try {
            return await this.pageExt.page.evaluate((id, attributeName) => {
                return document.getElementById(id).getAttribute(attributeName);
            }, this.id, attributeName);
        }
        catch (e) {
            if(!this.id){
                console.log("Can't getAttribute because id is", this.id);
            }
            throw e;
        }
    }

    async getIdFromDOM(){
        return await this.getAttribute("id");
    }

    async getInnerText(){
        return await this.pageExt.page.evaluate((id) => {
            return document.getElementById(id).innerText;
        }, this.id);
    }

    extractIdFromElemHandle(){
        const description = this.elementHandle._remoteObject.description;
        let startIndex = description.indexOf('#');
        let endIndex = description.indexOf('.');
        return description.slice(startIndex+1, endIndex);
    }

    async isHidden(){
        return this.isHiddenUsingSelector(`[id=${this.id}]`);
    }

    async isHiddenUsingSelector(selector){
        return await this.pageExt.page.evaluate((_selector) => {
            const node = document.body.querySelector(_selector);
            return node.getAttribute('aria-hidden');
        }, selector);
    }

    /********************************************************
     * Clicks
     */

    async click(){
        await this.elementHandle.click();
    }

    async clickAfterFindInList(index){
        await this.pageExt.clickAfterFindInList(this.tagName, index);
    }

    /********************************************************
     * Set id in chidren
     */

    async findChildrenToSetTempIds(childTagName, tempIdArr){
        const id = await this.getIdFromDOM();
        const parentSelector = (id? `[id='${id}']` : this.tagName);
        return await this.pageExt.findChildrenToSetTempIds(parentSelector, childTagName, tempIdArr);
    }

    async findChildrenButtonToSetTempIds(parentSelector, tempIdArr){
        return this.findChildrenToSetTempIds("button", tempIdArr);
    }

}

module.exports = PageElement;