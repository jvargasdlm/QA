const PageExtended = require('../../classes/PageExtended');
const PageElement = require('../../classes/PageElement');
const {Sidenav, sideEnum} = require('../../classes/Sidenav');

// ***********************************************

const HOME_PAGE = process.env.OTUS_URL + '/#/dashboard';

let selectors = {

};

// ***********************************************

class PageOtusDomain extends PageExtended {

    constructor(page){
        super(page);
        this.typeCode = this.typeCodes.OTUS_DOMAIN;
        this.leftSidenav = new Sidenav(this);
    }

    static getSelectors(){
        return selectors;
    }

    getHomePage() {
        return process.env.OTUS_DOMAIN_URL;
    }

    async initLeftSidenav(){
        await this.leftSidenav.init();
    }

    async goToHomePage(){
        await this.gotoUrl(HOME_PAGE);
    }


}

module.exports = PageOtusDomain;