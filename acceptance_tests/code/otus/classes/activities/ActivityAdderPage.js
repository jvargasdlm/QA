const PageOtus = require('../PageOtus');
const ActivityItem = require('./ActivityItem');

const enums = {
    type:{
        ON_LINE: false,
        PAPER: true
    },
    quantity: {
        UNIT: false,
        LIST: true
    },
    category:{
        NORMAL: {
            index: 0, value: "NORMAL"
        },
        QUALITY_CONTROLL: {
            index: 1, value: "CONTROLE DE QUALIDADE"
        },
        REPETITION: {
            index: 2, value: "REPETICAO"
        }
    }
};

const selectors = {
    switches: {
        type: "[aria-label='ActivityType']",
        quantity: "[aria-label='ActivitySelection']"
    },
    buttons:{
        ADD: "button[ng-click='$ctrl.addPreviewActivity($ctrl.selectedItem)']",
        SAVE: "md-icon[aria-label='save']", //<<
        CANCEL: "md-icon[aria-label='cancel']" //<<
    },
    activityCard :{
        TAG: "md-grid-tile",
        DELETE_BUTTON: ""
    },
    CATEGORY_SELECTOR: "md-select", // "[aria-label='Categoria: NORMAL']" //<<
    AUTO_COMPLETE_SEARCH_ID: "autoCompleteActivity"
};


class ActivityAdderPage extends PageOtus {

    constructor(page){
        super(page);
        this.typeSwitch = this.getNewSwitch();
        this.quantitySwitch = this.getNewSwitch();
        this.categorySelector = this.getNewOptionSelector();
        this.autoCompleteSearch = this.getNewAutoCompleteSearch();
        this.addButton = this.getNewButton();
        this.saveButton = this.getNewButton();
        this.cancelButton = this.getNewButton();
    }

    async init(){
        //this.enableConsoleLog();
        // temp
        await this.typeSwitch.initBySelectorAndSetTempId(selectors.switches.type, "typeSwitch");
        await this.quantitySwitch.initBySelectorAndSetTempId(selectors.switches.quantity, "quantitySwitch");
        await this.categorySelector.initBySelectorAndSetTempId(selectors.CATEGORY_SELECTOR, "categorySelector");

        await this.autoCompleteSearch.initByTagAndSetTempId(selectors.AUTO_COMPLETE_SEARCH_ID, 1);

        await this.addButton.initBySelectorAndSetTempId(selectors.buttons.ADD, "addButton");
        await this.saveButton.initBySelectorAndSetTempId(selectors.buttons.SAVE, "saveButton");
        await this.cancelButton.initBySelectorAndSetTempId(selectors.buttons.CANCEL, "cancelButton");
    }

    static get categoryEnum(){
        return enums.category;
    }

    async switchTypeToOnline(){
        console.log("to on-line");
        if(this.typeSwitch.isOn !== enums.type.ON_LINE){
            await this.typeSwitch.change();
        }
    }

    async switchTypeToPaper(){
        console.log("to paper");
        if(this.typeSwitch.isOn !== enums.type.PAPER){
            await this.typeSwitch.change();
        }
    }

    async switchQuantityToUnit(){
        if(this.quantitySwitch.isOn !== enums.quantity.UNIT){
            await this.quantitySwitch.change();
        }
    }

    async switchQuantityToList(){
        if(this.quantitySwitch.isOn !== enums.quantity.LIST){
            await this.quantitySwitch.change();
        }
    }

    async selectCategory(categoryEnumValue=enums.category.NORMAL){
        await this.categorySelector.selectOptionByIndex_temp(categoryEnumValue.index); // todo
    }

    async searchActivity(nameOrAcronym){
        await this.autoCompleteSearch.typeAndClickOnFirstOfList(nameOrAcronym);
        //await this.autoCompleteSearch.clear();
    }

    async addActivity(nameOrAcronym){
        await this.autoCompleteSearch.typeAndClickOnFirstOfList(nameOrAcronym);
        await this.addButton.click();
        await this.waitForMilliseconds(500); // wait activity card appear
        await this.autoCompleteSearch.clear();
        await this.page.mouse.click(0,0);
    }

    async deleteActivityFromTemporaryList(index){
        const cardElem = (await this.page.$$(selectors.activityCard.TAG))[index];
        const deleteActivityButton = this.getNewButton(this);
        deleteActivityButton.elementHandle = (await cardElem.$$(deleteActivityButton.tagName))[1]; //<<
        await deleteActivityButton.click();
    }

    async saveChanges(){
        await this.saveButton.click();
    }

    async cancelChanges(){
        await this.cancelButton.click();
    }
}

module.exports = ActivityAdderPage;