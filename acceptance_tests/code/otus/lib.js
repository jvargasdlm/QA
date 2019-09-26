const ParentLib = require('../ParentLib');
const PageOtus  = require('./classes/PageOtus');

// *****************************************************************
// Constants and variables

let logged = false;

// *****************************************************************

class OtusLib {

    static async doBeforeAll(suiteArray) {
        let [browser, page] = await ParentLib.doBeforeAll(suiteArray);
        let pageOtus = new PageOtus(page);
        if (!logged) {
            const loginData = await ParentLib.readLoginDataFromFile("OTUS");
            await pageOtus.login(loginData.email, loginData.password);
            logged = true;
        }
        return [browser, pageOtus, pageOtus.errorLogger, pageOtus.getSelectors()];
    }

}

module.exports = OtusLib;