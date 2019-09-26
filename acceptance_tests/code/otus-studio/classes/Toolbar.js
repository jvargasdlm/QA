const PageElement = require('../../classes/PageElement');
const utils = require('../../utils');

class Toolbar extends PageElement {

    constructor(editorPage){
        super(editorPage);
    }

    async clickSaveButton() {
        await this.pageExt.clickWithWait('button[aria-label="Salvar"]');
    }

    async clickExportButton() {
        await this.pageExt.clickWithWait('button[aria-label="Exportar"]');
        await utils.wait.forJsonDownload();
    }

    async clickOnMenuQuestionButton() {
        await this.pageExt.clickWithWait('button[ng-click="mainContainer.showQuestionsMenu()"]'); // open palette questions
    }

}

module.exports = Toolbar;
