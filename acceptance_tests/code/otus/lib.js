const ParentLib = require('../ParentLib');
const PageOtus  = require('./classes/PageOtus');

// *****************************************************************
// Constants and variables

const EMAIL_TEST = 'proflaviamat@gmail.com';
const PASSWORD = 'Teste123';

let logged = false;

// *****************************************************************

class OtusLib {

    static async doBeforeAll(suiteArray) {
        let [browser, page] = await ParentLib.doBeforeAll(suiteArray);
        let pageOtus = new PageOtus(page);
        if (!logged) {
            await pageOtus.login(EMAIL_TEST, PASSWORD);
            logged = true;
        }
        return [browser, pageOtus, pageOtus.errorLogger, pageOtus.getSelectors()];
    }

}

module.exports = OtusLib;