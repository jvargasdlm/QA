/*
Ao inves de enviar selector para waitForSelector, enviar o PageEelement, que contém toda a informação da pagina e do elemento em si (tipo) para o log !
 */

class PageElement {
    
    constructor(pageExt, tagName, elementHandle=undefined){
        this.pageExt = pageExt;
        this.tagName = tagName;
        this.elementHandle = elementHandle;
        this.id = undefined;
        this.selector = undefined;
    }

    async getAttribute(attributeName){
        let objectHandle = await this.elementHandle.getProperty(attributeName);
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

    async findChildren(parentSelector, childTagName){
        return await this.pageExt.findChildren(parentSelector, childTagName);
    }

    async findChildrenButton(parentSelector){
        return await this.pageExt.findChildren(parentSelector, 'button');
    }

}

module.exports = PageElement;