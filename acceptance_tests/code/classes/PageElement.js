/*
Ao inves de enviar selector para waitForSelector, enviar o PageEelement, que contém toda a informação da pagina e do elemento em si (tipo) para o log !
 */

class PageElement {
    
    constructor(pageExt, tagName){
        this.pageExt = pageExt;
        this.tagName = tagName;
        this.elementHandle = undefined;
        this.id = undefined;
        this.selector = undefined;
    }

    async setElementHandle(selector){
        this.elementHandle = await this.pageExt.page.$(selector);
    }

    async getAttribute(attributeName){
        return PageElement.s_getAttribute(this.elementHandle, attributeName);
    }

    static async s_getAttribute(elementHandle, attributeName){
        let objectHandle = await elementHandle.getProperty(attributeName);
        let remoteObject = objectHandle._remoteObject; //_remoteObject: { type: 'string', value: 'QSP2' },
        return remoteObject.value;
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

    extractIdFromElemHandle(){
        const description = this.elementHandle._remoteObject.description;
        let startIndex = description.indexOf('#');
        let endIndex = description.indexOf('.');
        return description.slice(startIndex+1, endIndex);
    }

    async setId(id){
        this.id = id;
        this.elementHandle = await this.pageExt.waitForSelector('#'+id);
        //this.elementHandle = await this.pageExt.page.$('#'+id);
    }

    // -------------------------------------------------------
    // Clicks

    async click(){
        await this.elementHandle.click();
    }

    async clickById(id){
        await this.pageExt.clickWithWait(`${this.tagName}[id='${id}']`);
    }

    async clickByAttribute(uniqueAttrName, uniqueAttrValue){
        await this.pageExt.clickWithWait(`${this.tagName}[${uniqueAttrName}='${uniqueAttrValue}']`);
    }

    async clickAfterFindInList(index){
        await this.pageExt.clickAfterFindInList(this.tagName, index);
    }

    async findChildrenAndSetTempIdsFromInnerText(childTagName){
        const parentSelector = (this.id? `[id='${this.id}']` : this.tagName);
        return await this.pageExt.findChildrenToSetTempIdsFromInnerText(parentSelector, childTagName);
    }

    async findChildrenButtonAndSetTempIdsFromInnerText(){
        return this.findChildrenAndSetTempIdsFromInnerText("button");
    }

    async findChildrenToSetTempIds(childTagName, tempIdArr){
        const parentSelector = (this.id? `[id='${this.id}']` : this.tagName);
        return await this.pageExt.findChildrenToSetTempIds(parentSelector, childTagName, tempIdArr);
    }

    async findChildrenButtonToSetTempIds(parentSelector, tempIdArr){
        return this.findChildrenToSetTempIds("button", tempIdArr);
    }

}

module.exports = PageElement;