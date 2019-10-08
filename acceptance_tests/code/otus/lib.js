const ParentLib = require('../ParentLib');
const PageOtus  = require('./classes/PageOtus');

// *****************************************************************
// Constants and variables

let _logged = false;

// *****************************************************************

class OtusLib {

    static async doBeforeAll(suiteArray) {
        let [browser, page] = await ParentLib.doBeforeAll(suiteArray);
        let pageOtus = new PageOtus(page);
        if (!_logged) {
            const loginData = await ParentLib.readLoginDataFromFile("OTUS");
            await pageOtus.login(loginData.email, loginData.password);
            _logged = true;
        }
        return [browser, pageOtus, pageOtus.errorLogger, pageOtus.getSelectors()];
    }

}

module.exports = OtusLib;