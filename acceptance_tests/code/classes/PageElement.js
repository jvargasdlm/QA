/*
Ao inves de enviar selector para waitForSelector, enviar o PageEelement, que contém toda a informação da pagina e do elemento em si (tipo) para o log !
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
        await this.pageExt.waitForSelector(this.tagName);
        this.elementHandle = (await this.pageExt.page.$$(this.tagName))[index];
        try {
            await this.pageExt.page.evaluate((selector, tempId, index) => {
                const element = (document.body.querySelectorAll(selector))[index];
                element.setAttribute("id", tempId);
            }, this.tagName, tempId, index);

            await this._initMyOwnAttributes(index);
            this.id = tempId;
        }
        catch (e) {//.
            console.log(`ERROR at init pageElement by tag "${this.tagName}" with set id '${tempId}':`, e.message);
            await this.pageExt.hasElementWithLog(this.tagName);
            throw e;
        }
    }

    async initByAttributesSelector(attributesSelector, tempId, index=0){
        await this.initBySelectorAndSetTempId(this.tagName + attributesSelector, tempId, index);
    }

    async initBySelector(selector, index=0){
        try {
            await this.pageExt.waitForSelector(selector);
            this.elementHandle = (await this.pageExt.page.$$(selector))[index];
            await this._initMyOwnAttributes();
        }
        catch (e) {//.
            console.log(`ERROR at init pageElement by selector "${selector}":`, e.message);
            await this.pageExt.hasElementWithLog(selector);
            throw e;
        }
    }

    async initBySelectorAndSetTempId(selector, tempId, index=0){
        try {
            await this.pageExt.waitForSelector(selector);

            await this.pageExt.page.evaluate((selector, tempId, index) => {
                const element = (document.body.querySelectorAll(selector))[index];
                element.setAttribute("id", tempId);
            }, selector, tempId, index);

            await this.initById(tempId);
        }
        catch (e) {//.
            console.log(`ERROR at init pageElement by selector "${selector}" with index=${index} and tempId '${tempId}':`, e.message);
            await this.pageExt.hasElementWithLog(selector);
            throw e;
        }
    }

    // Implemented by children classes
    async _initMyOwnAttributes(){

    }

    async setTempId(selector, tempId, index=0){
        await this.pageExt.page.evaluate((selector, tempId, index) => {
            const element = (document.body.querySelectorAll(selector))[index];
            element.setAttribute("id", tempId);
        });
    }

    async getId(){
        return await this.getAttribute("id");
    }

    async getAttributeByDOM(selector, attributeName){
        return await this.pageExt.page.evaluate((selector, attributeName) => {
            return document.body.querySelector(selector).getAttribute(attributeName);
        }, selector, attributeName);
    }

    async getAttribute(attributeName){
        return PageElement.s_getAttribute(this.elementHandle, attributeName);
    }

    static async s_getAttribute(elementHandle, attributeName){
        let objectHandle = await elementHandle.getProperty(attributeName);
        let remoteObject = objectHandle._remoteObject; //_remoteObject: { type: 'string', value: 'QSP2' },
        return remoteObject.value;
    }

    extractIdFromElemHandle(){
        const description = this.elementHandle._remoteObject.description;
        let startIndex = description.indexOf('#');
        let endIndex = description.indexOf('.');
        return description.slice(startIndex+1, endIndex);
    }

    async isHidden(){
        return this.isHiddenUsingSelector(`[id=${this.getId()}]`);
    }

    async isHiddenUsingSelector(selector){
        return await this.pageExt.page.evaluate((_selector) => {
            const node = document.body.querySelector(_selector);
            return node.getAttribute('aria-hidden');
        }, selector);
    }

    // -------------------------------------------------------
    // Clicks

    async click(){
        await this.elementHandle.click();
    }

    async clickByAttribute(uniqueAttrName, uniqueAttrValue){
        await this.pageExt.clickWithWait(`${this.tagName}[${uniqueAttrName}='${uniqueAttrValue}']`);
    }

    async clickAfterFindInList(index){
        await this.pageExt.clickAfterFindInList(this.tagName, index);
    }

    // async findChildrenAndSetTempIdsFromInnerText(childTagName){
    //     const id = await this.getId();
    //     const parentSelector = (id? `[id='${id}']` : this.tagName);
    //     return await this.pageExt.findChildrenToSetTempIdsFromInnerText(parentSelector, childTagName);
    // }
    //
    // async findChildrenButtonAndSetTempIdsFromInnerText(){
    //     //return this.findChildrenAndSetTempIdsFromInnerText("button");
    // }

    async findChildrenToSetTempIds(childTagName, tempIdArr){
        const id = await this.getId();
        const parentSelector = (id? `[id='${id}']` : this.tagName);
        return await this.pageExt.findChildrenToSetTempIds(parentSelector, childTagName, tempIdArr);
    }

    async findChildrenButtonToSetTempIds(parentSelector, tempIdArr){
        return this.findChildrenToSetTempIds("button", tempIdArr);
    }

}

module.exports = PageElement;