const OptionSelector = require('./OptionSelector');

class MultipleOptionSelector extends OptionSelector {

    constructor(pageExt){
        super(pageExt);
    }

    async selectOptions(optionValuesArr){
        await this.elementHandle.click();
        for(let optionValue of optionValuesArr) {
            await this.pageExt.clickWithWait(`md-option[value='${optionValue}']`);
        }
        await this.pageExt.clickOut();
    }
}

module.exports = MultipleOptionSelector;