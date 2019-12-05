const PageElement = require('./PageElement');

class InputField extends PageElement {

    constructor(pageExt){
        super(pageExt, 'input');
        this.content = '';
    }

    async initFromList(selector, index){
        this.elementHandle = (await this.pageExt.page.$$(selector))[index];
    }

    async _initMyOwnAttributes(){
        this.content = '';
    }

    async type(text){
        await this.elementHandle.type(text);
        this.content = text;
    }

    async cleanText(){
        await this.pageExt.page.evaluate(function(selector) {
            document.querySelector(selector).value = ''
        }, this.selector);
    }

}

module.exports = InputField;