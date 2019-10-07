/*
Ao inves de enviar selector para waitForSelector, enviar o PageEelement, que contém toda a informação da pagina e do elemento em si (tipo) para o log !
 */

// ***********************************************
// Private Functions

async function getAttribute(elementHandle, attributeName){
    //console.log(`PageElement.getAttribute: element = \n`, elementHandle._remoteObject);//.
    let objectHandle = await elementHandle.getProperty(attributeName);
    let remoteObject = objectHandle._remoteObject; //_remoteObject: { type: 'string', value: 'QSP2' },
    return remoteObject.value;
}

// ***********************************************

class PageElement {
    
    constructor(pageExt, tagName, elementHandle=undefined){
        this.pageExt = pageExt;
        this.tagName = tagName;
        this.elementHandle = elementHandle;
        this.id = undefined;
        this.selector = undefined;
    }

    static async getAttribute(elementHandle, attributeName){
        return await getAttribute(elementHandle, attributeName);
    }

    async getAttribute(attributeName){
        return await getAttribute(this.elementHandle, attributeName);
    }

    async isHidden(){
        return PageElement.isHidden(this.pageExt.page, `[id=${this.id}]`);
    }

    async isHiddenUsingSelector(selector){
        return PageElement.isHidden(this.pageExt.page, selector);
    }

    extractIdFromElemHandle(){
        const description = this.elementHandle._remoteObject.description; // <directive>#<id>.<attributes>
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

    async getInnerText(selector){
        await this.pageExt.waitForSelector(selector);
        try {
            return await this.pageExt.page.evaluate((selector) => {
                let element = document.querySelector(selector);
                return element.innerText;
            }, selector);
        }
        catch (e) {
            console.log('getInnerText: selector =', selector);
            await this.pageExt.hasElementSelector(selector);
        }
    }

    async findChildren(parentSelector, childTagName){
        //this.pageExt.enableConsoleLog();
        return await PageElement.findChildren(this.pageExt.page, parentSelector, childTagName);
    }

    async findChildrenButton(selector){
        //this.pageExt.enableConsoleLog();
        return await PageElement.findChildren(this.pageExt.page, selector, 'button');
    }

    // ------------------------------------------------------------
    // Static

    static async isHidden(page, selector){
        return await page.evaluate((selector) => {
            const node = document.body.querySelector(selector);
            return node.getAttribute('aria-hidden');
        }, selector);
    }

    static async findChildren(page, parentSelector, childTagName){
        return await page.evaluate((parentSelector, childTagName_) => {
            let parentNode = document.body.querySelector(parentSelector);
            let tempIdArray = [];
            const childTagName = childTagName_;

            function pushId(currentNode) {
                const isNodeEmpty = (Object.entries(currentNode).length === 0);
                if (!isNodeEmpty && currentNode.tagName.toLowerCase() === childTagName) {
                    let id = currentNode.getAttribute('id');
                    if(!id){
                        //let elemText = currentNode.querySelector('span');
                        id = currentNode.innerText.replace('\n', ' ');
                        currentNode.setAttribute('id', id);
                    }
                    tempIdArray.push(id);
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

        }, parentSelector, childTagName);
    }
}

module.exports = PageElement;