const PageElement = require('./PageElement');

class InputField extends PageElement {

    constructor(pageExt){
        super(pageExt, 'input');
    }

    async init(selector){
        this.selector = selector;
        this.elementHandle = await this.pageExt.page.$(selector);
    }

    async initFromList(selector, index){
        this.elementHandle = (await this.pageExt.page.$$(selector))[index];
    }

    async type(text){
        await this.pageExt.typeWithWait(this.selector, text);
    }

    async cleanText(){
        await this.pageExt.page.evaluate(function(selector) {
            document.querySelector(selector).value = ''
        }, this.selector);
    }

    async getTextContent(){

    }

}

module.exports = InputField;