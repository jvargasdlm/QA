const {DialogParent, selectors} = require('./DialogParent');
/*
// for Otus Studio (at Otus, reverse)
const actionButtonIndexAtOtusStudio = {
    CANCEL: 0,
    SAVE: 1
};
*/
const NUM_DEFAULT_ACTION_BUTTONS = 2; // entries of actionButtonIndex
const CANCEL_BUTTON_LABELS = ["CANCEL", "CANCELAR", "VOLTAR"];

// ***********************************************

class Dialog extends DialogParent {

    constructor(pageExt){
        super(pageExt);
        this.okButtonId = '';
        this.cancelButtonId = '';
        this.customizeActionButtonIds = []; // [<...>, CANCELAR, SALVAR]

        this.actionButtonIds = [];
        this.okButtonIndex = -1;
        this.cancelButtonId = -1;
    }

    getNumActionButtons(){
        return this.actionButtonIds.length;
    }

    async waitForOpen() {
        this.actionButtonIds = await super.waitForOpenAndSetIds();
        let numButtons = this.actionButtonIds.length;
        //console.log(allActionButtonIds);//.

        this.okButtonIndex = numButtons-2; this.cancelButtonIndex = numButtons-1;
        const lastId = this.actionButtonIds[numButtons-1];
        if(!CANCEL_BUTTON_LABELS.some(label => lastId.includes(label))){
            this.cancelButtonIndex = numButtons-2;
            this.okButtonIndex = numButtons-1;
        }
    }

    async clickOnOkButton(){
        const id = this.actionButtonIds[this.okButtonIndex];
        await this.pageExt.clickWithWait(`[id='${id}']`);
        try {
            await this.waitForClose();
        }
        catch (e) {
            //await this.pageExt.clickWithWait(`[id='${this.cancelButtonId}']`);
            //throw "Could not save changes. Check console messages.";
        }
    }

    async clickOnCancelButton(){
        const id = this.actionButtonIds[this.cancelButtonIndex];
        await this.pageExt.clickWithWait(`[id='${id}']`);
        await this.waitForClose();
    }

    async clickOnCustomizedActionButton(buttonLabel) {
        await this.waitForOpen();
        await this.pageExt.clickWithWait(`[id='${buttonLabel}']`);
        await this.waitForClose();
    }

    async clickOnCustomizedActionButtonByIndex(index) {
        await this.pageExt.clickWithWait(`[id='${this.customizeActionButtonIds[index]}']`);
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

    async waitForOpenAndClickOnOkButton(){
        await this.waitForOpen();
        await this.clickOnOkButton();
    }

    async waitForOpenAndClickOnCancelButton(){
        await this.waitForOpen();
        await this.clickOnCancelButton();
    }
}

module.exports = Dialog;