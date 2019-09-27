const utils          = require('./utils');
const BrowserHandler = require('./handlers/BrowserHandler');
const FileHandler    = require('./handlers/FileHandler');
const PageExtended   = require('./classes/PageExtended');

// *****************************************************************

class ParentLib {
    
    static async readLoginDataFromFile(platformNameToUpper){
        const path = process.cwd() + process.env.LOGIN_DATA_FILE_LOCAL_PATH;
        return FileHandler.readJsonAttribute(path, platformNameToUpper);
    }

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