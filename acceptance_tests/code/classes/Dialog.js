const {DialogParent, selectors} = require('./DialogParent');
/*
// for Otus Studio (at Otus, reverse)
const actionButtonIndexAtOtusStudio = {
    CANCEL: 0,
    SAVE: 1
};
*/
const NUM_DEFAULT_ACTION_BUTTONS = 2; // entries of actionButtonIndex

// ***********************************************

class Dialog extends DialogParent {

    constructor(pageExt){
        super(pageExt);
        this.okButtonId = '';
        this.cancelButtonId = '';
        this.customizeActionButtonIds = []; // [<...>, CANCELAR, SALVAR]
    }

    async waitForOpen() {
        const allButtonIds = await super.waitForOpen();
        let numButtons = allButtonIds.length;
        //console.log(allButtonIds);//.

        let okButtonIndex = numButtons-2,
            cancelButtonIndex = numButtons-1;
        if(!this.pageExt.amIAOtusPage){
            cancelButtonIndex = numButtons-2;
            okButtonIndex = numButtons-1;
        }
        this.okButtonId = allButtonIds[okButtonIndex];
        this.cancelButtonId = allButtonIds[cancelButtonIndex];

        if(numButtons > NUM_DEFAULT_ACTION_BUTTONS){
            this.customizeActionButtonIds = allButtonIds.slice(0, numButtons-2);
        }
    }

    async clickOnOkButton(){
        await this.pageExt.clickWithWait(`[id='${this.okButtonId}']`);
        try {
            await this.waitForClose();
        }
        catch (e) {
            await this.pageExt.clickWithWait(`[id='${this.cancelButtonId}']`);
            throw "Could not save changes. Check console messages.";
        }
    }

    async clickOnCancelButton(){
        await this.pageExt.clickWithWait(`[id='${this.cancelButtonId}']`);
        await this.waitForClose();
    }

    async waitForOpenAndClickOnOkButton(){
        await this.waitForOpen();
        await this.clickOnOkButton();
    }

    async waitForOpenAndClickOnCancelButton(){
        await this.waitForOpen();
        await this.clickOnCancelButton();
    }

    async clickOnCustomizedActionButton(buttonLabel) {
        await this.waitForOpen();
        await this.pageExt.clickWithWait(`[id='${buttonLabel}']`);
        await this.waitForClose();
    }

    async clickOnCustomizedChildElement(selector){
        await this.waitForOpen();
        try {
            this.elementHandle = await this.pageExt.page.$(selectors.DIALOG);
            let element = await this.elementHandle.$(selector);
            element.click();
        }
        catch (e) {
            throw e; // for while
        }
        finally {
            await this.waitForClose();
        }
    }
}

module.exports = Dialog;