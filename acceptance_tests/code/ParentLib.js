const BrowserHandler = require('./handlers/BrowserHandler');
const FileHandler    = require('./handlers/FileHandler');

// *****************************************************************

require('custom-env').env('staging');
const TIMEOUT_PER_TEST = parseInt(process.env.TIMEOUT_PER_TEST, 10);

const selectors = {
    login:{
        EMAIL_INPUT: 'input[name=userEmail]',
        PASSWORD_INPUT: 'input[name=userPassword]',
        //SUBMIT_BUTTON: 'button[type=submit]',
        VALOR_APLICAR: 'input[name=valorAplicar]',
        VALOR_INVESTIR: 'input[name=valorInvestir]',
        TEMPO: 'input[name=tempo]',
        SUBMIT_BUTTON: 'button[type=submit]'
        //SIMULAR: 'button[type=submit]'
    }
};

class ParentLib {
    
    static async readLoginDataFromFile(platformNameToUpper){
        const path = process.cwd() + process.env.LOGIN_DATA_FILE_LOCAL_PATH;
        return FileHandler.readJsonAttribute(path, platformNameToUpper);
    }

    static async doBeforeAll(OtusPageClass, suiteArray) {
        jest.setTimeout(TIMEOUT_PER_TEST);
        let browser = await BrowserHandler.createBrowser();
        let page = (await browser.pages())[0];
        let pageExt = new OtusPageClass(page);
        await pageExt.setDownloadPath();
        pageExt.errorLogger.resetAndSetSpecArray(suiteArray);
        return [browser, pageExt];
    }

    static async login(pageExt, mainPageUrl){
        const loginData = await ParentLib.readLoginDataFromFile(pageExt.typeCodeName);
        await pageExt.gotoUrl(mainPageUrl);
        const buttonSelector = selectors.login.SUBMIT_BUTTON;
//        await pageExt.waitForSelector(buttonSelector);
        await pageExt.page.type(selectors.login.VALOR_APLICAR);
//        await pageExt.page.type(selectors.login.VALOR_INVESTIR, loginData.password);
        await pageExt.page.type(selectors.login.VALOR_INVESTIR);
        await pageExt.page.type(selectors.login.TEMPO);
        await pageExt.page.click(buttonSelector);
    }

    /* Call after doBeforeAll method */
    static setTestTimeoutMilliseconds(milliseconds){
        jest.setTimeout(milliseconds);
    }

    static setTestTimeoutSeconds(seconds){
        jest.setTimeout(seconds * 1000);
    }

}

module.exports = ParentLib;