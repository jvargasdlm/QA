const PageElement = require('./PageElement');

class Checkbox extends PageElement {

    constructor(pageExt){
        super(pageExt, 'md-checkbox');
    }

    async clickByLabel(optionLabel){
        await this.pageExt.clickWithWait(`${this.tagName}[aria-label='${optionLabel}']`);
    }

    async isChecked(){
        return ((await this.getAttribute("aria-checked")) === 'true');
    }

}

module.exports = Checkbox;