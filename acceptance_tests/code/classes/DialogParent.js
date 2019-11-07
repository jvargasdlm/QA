const PageElement = require('./PageElement');

const selectors = {
    DIALOG: 'md-dialog',
    ACTIONS: 'md-dialog-actions'
};

let closeButtonId = undefined;

// ***********************************************

class DialogParent extends PageElement {

    constructor(pageExt){
        super(pageExt, selectors.DIALOG);
    }

    async waitForOpen() {
        await this.pageExt.waitForSelector(selectors.DIALOG);
        this.elementHandle = this.pageExt.page.$(selectors.DIALOG);
        if(!closeButtonId){
            const allButtons = await this.pageExt.findChildrenButtonToSetTempIdsFromInnerText(selectors.DIALOG);
            closeButtonId = allButtons[0];
        }
        return await this.pageExt.findChildrenButtonToSetTempIdsFromInnerText(selectors.ACTIONS);
    }

    async waitForClose(){
        try{
            await this.pageExt.waitForSelectorHidden(selectors.DIALOG);
        }
        catch (e) {
            this.pageExt.page.on('console', msg => {
                for (let i = 0; i < msg.args().length; ++i)
                    console.log(`${i}: ${msg.args()[i]}`);
            });
            throw e;
        }
    }
}

module.exports = {DialogParent, selectors};