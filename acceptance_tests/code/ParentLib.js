const utils          = require('./utils');
const BrowserHandler = require('./handlers/BrowserHandler');
const PageExtended   = require('./classes/PageExtended');

// *****************************************************************

class ParentLib {

    static async doBeforeAll(suiteArray) {
        utils.timeout.setTestTimeout();
        let browser = await BrowserHandler.createBrowser();
        let page = (await browser.pages())[0];
        let pageExt = new PageExtended(page);
        await pageExt.setDownloadPath();
        pageExt.errorLogger.resetAndSetSpecArray(suiteArray);
        return [browser, page];
    }

}

module.exports = ParentLib;