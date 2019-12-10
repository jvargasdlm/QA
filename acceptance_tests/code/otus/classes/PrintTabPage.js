const PageExtended = require('../../classes/PageExtended');
const KeyboardHandler = require('../../handlers/KeyboardHandler');

const buttonIndexes = {
    CANCEL: 0,
    SAVE: 1
};

class PrintTabPage extends PageExtended {

    constructor(page) {
        super(page);
        this.typeCode = this.typeCodes.OTUS; // for while
    }

    async savePdf(filenameNoExtension){
        const targets = this.page.browser().targets();

        const printTarget = targets[targets.length-1];
        printTarget._targetInfo.type = 'page';
        this.page = await printTarget.page();

        const button = await this.page.waitForFunction(() => {

            let elem = document.querySelector('print-preview-app');
            const root1 = elem.shadowRoot;

            elem = root1.querySelector('print-preview-sidebar');
            const root2 = elem.shadowRoot;

            elem = root2.querySelector('print-preview-header');
            const root3 = elem.shadowRoot;

            const buttons = root3.querySelectorAll('paper-button');
            return buttons[1];

        }, {timeout: 5000});

        await button.click();

        const path = process.cwd() + process.env.DOWNLOADS_LOCAL_DIR_PATH + '/' + filenameNoExtension;
        await KeyboardHandler.sendTextAfterWait(path);
        await KeyboardHandler.sendEnterKey();
        await this.waitLib.forDownload();
    }

}

module.exports = PrintTabPage;