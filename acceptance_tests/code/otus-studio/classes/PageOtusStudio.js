const PageExtended = require('../../classes/PageExtended');

// ***********************************************

const jsonFields = {
    groupList: 'surveyItemGroupList'
};

class PageOtusStudio extends PageExtended {

    constructor(page){
        super(page);
        this.typeCode = this.typeCodes.OTUS_STUDIO;
    }

    async clickOnMainMenuButton(){
        const selector = `button[ng-click='dashboardMenu.open()']`;
        await this.clickOnElementOfList(selector, 1);
    }

    getJsonFields(){
        return jsonFields;
    }

}

module.exports = PageOtusStudio;