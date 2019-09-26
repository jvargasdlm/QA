const PageElement = require('./PageElement');

class Checkbox extends PageElement {

    constructor(pageExt){
        super(pageExt, 'md-checkbox');
    }

    async clickByLabel(optionLabel){
        await this.pageExt.clickWithWait(`${this.tagName}[aria-label='${optionLabel}']`);
    }

}

module.exports = Checkbox;