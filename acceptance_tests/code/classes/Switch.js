const PageElement = require('./PageElement');

class Switch extends PageElement {

    constructor(pageExt){
        super(pageExt, "md-switch");
        this.isOn = false;
    }

    async init(selector){
        await this.setElementHandle(selector);
        const checked = await this.getAttribute('aria-checked');
        this.isOn = (checked === 'true');
    }

    async change(){
        await this.elementHandle.click();
        this.isOn = !(this.isOn);
    }
}

module.exports = Switch;