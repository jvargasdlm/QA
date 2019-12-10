const PageElement = require('./PageElement');

const selectors = {
    CHECK_ON_ATTRIBUTE: 'aria-checked',
    turnOnOffAttributes:{
        true: [
            { ATTRIBUTE: 'aria-checked', VALUE: 'true'},
            { ATTRIBUTE: 'class', VALUE: 'md-primary ng-valid md-default-theme ng-dirty ng-valid-parse ng-touched md-checked ng-not-empty'}
            ],
        false: [
            { ATTRIBUTE: 'aria-checked', VALUE: 'false'},
            { ATTRIBUTE: 'class', VALUE: 'md-primary ng-valid md-default-theme ng-dirty ng-valid-parse ng-touched ng-empty'}
        ]
    }
};

class Switch extends PageElement {

    constructor(pageExt){
        super(pageExt, "md-switch");
        this.isOn = false;
    }

    async _initMyOwnAttributes(){
        const checked = await this.getAttribute(selectors.CHECK_ON_ATTRIBUTE);
        this.isOn = (checked === 'true');
    }

    async change(){
        const isOnBefore = this.isOn;
        await this.elementHandle.click();
        await this._initMyOwnAttributes();
        if(this.isOn === isOnBefore) { // force change

            this.elementHandle = await this.pageExt.page.$('#'+this.id);
            await this.elementHandle.click();
            await this._initMyOwnAttributes();

            if(this.isOn === isOnBefore) { // force change setting attribute values
                const attributesArr = selectors.turnOnOffAttributes[(Boolean(!isOnBefore)).toString()];
                await this.pageExt.page.evaluate((id, attributesArr) => {
                    const element = document.getElementById(id);
                    for (let pair of attributesArr) {
                        element.setAttribute(pair.ATTRIBUTE, pair.VALUE);
                    }
                }, this.id, attributesArr);
                this.isOn = !(this.isOn);
            }
        }
        await this.pageExt.waitForMilliseconds(500);
    }
}

module.exports = Switch;