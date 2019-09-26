const PageOtusStudio = require('./PageOtusStudio');

class TabPage extends PageOtusStudio {

    constructor(editorPage) {
        super(editorPage.page);
        this.toolbar = editorPage.toolbar;
    }

}

module.exports = TabPage;