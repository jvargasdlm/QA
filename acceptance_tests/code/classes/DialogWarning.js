const {DialogParent, selectors} = require('./DialogParent');

class DialogWarning extends DialogParent {

    constructor(pageExt){
        super(pageExt);
        this.okButtonId = '';
    }

    async waitForOpen(){
        const allButtonIds = await super.waitForOpen();
        let numButtons = allButtonIds.length;
        if(numButtons > 1){
            throw `DialogWarning must have only 1 button, but has ${numButtons}`;
        }
        this.okButtonId = allButtonIds[0];
    }

    async clickOnOkButton(){
        await this.waitForOpen();
        await this.pageExt.clickWithWait(`[id=${this.okButtonId}]`);
        await this.waitForClose();
    }
}

module.exports = DialogWarning;