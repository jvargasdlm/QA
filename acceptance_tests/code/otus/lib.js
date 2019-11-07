const ParentLib = require('../ParentLib');
const PageOtus  = require('./classes/PageOtus');

// *****************************************************************
// Constants and variables

let _logged = false;

// *****************************************************************

class OtusLib {

    static async doBeforeAll(suiteArray) {
        let [browser, pageOtus] = await ParentLib.doBeforeAll(PageOtus, suiteArray);
        if (!_logged) {
            await ParentLib.login(pageOtus, process.env.OTUS_URL);
            await pageOtus.waitLoad();
            _logged = true;
        }
        return [browser, pageOtus, pageOtus.errorLogger, PageOtus.getSelectors()];
    }

}

module.exports = OtusLib;