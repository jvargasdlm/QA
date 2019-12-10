const PageElement = require('./PageElement');

class InputField extends PageElement {

    constructor(pageExt){
        super(pageExt, 'input');
        this.content = '';
    }

    async _initMyOwnAttributes(){
        this.content = '';
    }

    async type(text){
        await this.elementHandle.type(text);
        this.content = text;
    }

    async clear(){
        await this.pageExt.page.evaluate(function(selector) {
            document.querySelector(selector).value = ''
        }, '#'+this.id);
        this.content = '';
    }

}

module.exports = InputField;