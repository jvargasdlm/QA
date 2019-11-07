const ParentLib = require('../ParentLib');
const PageOtusDomain  = require('./classes/PageOtusDomain');

// *****************************************************************
// Constants and variables

let _logged = false;

// *****************************************************************

class OtusDomainLib {

    static async doBeforeAll(suiteArray) {
        let [browser, pageOtusDomain] = await ParentLib.doBeforeAll(PageOtusDomain, suiteArray);
        if (!_logged) {
            await ParentLib.login(pageOtusDomain, process.env.OTUS_DOMAIN_URL);
            _logged = true;
        }
        return [browser, pageOtusDomain, pageOtusDomain.errorLogger, PageOtusDomain.getSelectors()];
    }

}

module.exports = OtusDomainLib;