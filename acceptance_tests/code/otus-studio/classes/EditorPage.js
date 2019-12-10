const PageOtusStudio = require('./PageOtusStudio');
const Toolbar        = require('./Toolbar');
const EditionTabPage = require('./EditionTabPage');

const enumIndexes = {
    EDITION: 0,
    NAVIGATION: 1,
    RESOURCE: 2,
    PREVIEW: 3
};

const selectors = {
    TAB: 'md-tab-item',
    TAB_ANIMATION_ATTRIBUTE: 'data-ng-animate'
};

// ************************************************************

class EditorPage extends PageOtusStudio {

    constructor(page){
        super(page);
        this.toolbar = new Toolbar(this);
        this.tabs = [];
        this.activeTab = -1;
        this.activeTabPage = null;
    }

    async init() { // open at edition tab
        // set tabs array
        await this.waitForSelector(selectors.TAB);
        this.tabs = await this.page.$$(selectors.TAB);
        this.activeTab = enumIndexes.EDITION;

        this.activeTabPage = new EditionTabPage(this);
        await this.activeTabPage.init();
    }

    async clickOnEdition(){
        await _clickOnTab(this, enumIndexes.EDITION);
    }

    async clickOnNavigation(){
        await _clickOnTab(this, enumIndexes.NAVIGATION);
    }

    async clickOnResource(){
        await (this.tabs[enumIndexes.RESOURCE]).click();
    }

    async clickOnPreview(){
        await (this.tabs[enumIndexes.PREVIEW]).click();
    }

    // Navigation Tab
    async takeScreenshotOfNavigationTab(path){
        await this.clickOnNavigation();
        await this.pageExt.waitForSelector('canvas');
        await this.pageExt.page.screenshot(path);
    }
}

// ************************************************************
// Private Functions

async function _clickOnTab(editorPage, tabIndex, newActivePageTab) {
    if(editorPage.activeTab === tabIndex){
        console.log('click on active tab!');
        return;
    }
    await (editorPage.tabs[tabIndex]).click();
    await editorPage.waitForMilliseconds(5000);
    await newActivePageTab.init();
    editorPage.activeTabPage = newActivePageTab;
}

module.exports = EditorPage;