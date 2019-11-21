const PageOtus = require('../PageOtus');
const ActivityAdditionItemPaper     = require('./ActivityAdditionItemPaper');

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
        ADD: "button[aria-label='Adicionar']", // "button[ng-click='$ctrl.addActivityDtos($ctrl.selectedItem)']",
        SAVE: "button[aria-label='Salvar']", //<<
        CANCEL: "button[aria-label='Cancelar']" //<<
    },
    activityCard :{
        TAG: "md-grid-tile",
        DELETE_BUTTON: ""
    },
    CATEGORY_SELECTOR: "md-select", // "[aria-label='Categoria: NORMAL']" //<<
    AUTO_COMPLETE_SEARCH_ID: "autocomplete_selectSurvey"
};

class ActivityAdditionPage extends PageOtus {

    constructor(page){
        super(page);
        this.typeSwitch = this.getNewSwitch();
        this.quantitySwitch = this.getNewSwitch();
        this.categorySelector = this.getNewOptionSelector();
        this.autoCompleteSearch = this.getNewAutoCompleteSearch();
        this.addButton = this.getNewButton();
        this.saveButton = this.getNewButton();
        this.cancelButton = this.getNewButton();
        this.activityAddItems = [];
    }

    async init(){
        await this.typeSwitch.initBySelectorAndSetTempId(selectors.switches.type, "typeSwitch");
        await this.quantitySwitch.initBySelectorAndSetTempId(selectors.switches.quantity, "quantitySwitch");
        await this.categorySelector.initBySelectorAndSetTempId(selectors.CATEGORY_SELECTOR, "categorySelector");

        await this.autoCompleteSearch.initById(selectors.AUTO_COMPLETE_SEARCH_ID, 1, 1);

        await this.addButton.initBySelectorAndSetTempId(selectors.buttons.ADD, "addButton");
        await this.saveButton.initBySelectorAndSetTempId(selectors.buttons.SAVE, "saveButton");
        await this.cancelButton.initBySelectorAndSetTempId(selectors.buttons.CANCEL, "cancelButton");
    }

    static get enums(){
        return enums;
    }

    getItem(index){
        return this.activityAddItems[index];
    }

    async switchTypeTo(typeEnumValue){
        if(this.typeSwitch.isOn !== typeEnumValue){
            await this.typeSwitch.change();
        }
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

    async switchQuantityTo(quantityEnumValue){
        if(this.quantitySwitch.isOn !== quantityEnumValue){
            await this.quantitySwitch.change();
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

    async addActivity(nameOrAcronym, ActivityAdditionItemClass){
        await this.autoCompleteSearch.typeAndClickOnFirstOfList(nameOrAcronym);
        await this.addButton.click();
        await this.waitForMilliseconds(500); // wait activity card appear
        await this.autoCompleteSearch.clear();
        await this.page.mouse.click(0,0);

        const activityAddItem = new ActivityAdditionItemClass(this);
        let nextPaperActivityIndex = this.activityAddItems.filter(item => item instanceof ActivityAdditionItemPaper).length;
        await activityAddItem.init(this.activityAddItems.length, nextPaperActivityIndex);
        this.activityAddItems.push(activityAddItem);
        return activityAddItem;
    }

    async fillExternalIdForActivity(index, externalId){
        const activityAddItem = this.activityAddItems[index];
        await activityAddItem.insertExternalId(externalId);
    }

    async fillPaperTypeActivity(index, realizationDate, inspectorName){
        const activityAddItem = this.activityAddItems[index];
        await activityAddItem.insertPaperExclusiveData(realizationDate, inspectorName);
    }

    async deleteActivityFromTemporaryList(index){
        const activityAddItemToDelete = this.activityAddItems[index];
        await activityAddItemToDelete.closeButton.click();
        await this.waitForMilliseconds(500); // wait for update list

        await this.forceDeleteElementFromHTML('#'+activityAddItemToDelete.id);//.

        const numActivityAddItems = await this.countElementsBySelector(activityAddItemToDelete.tagName);
        const stillHasActivityToDelete = await this.hasElement('#'+activityAddItemToDelete.id);

        if(numActivityAddItems === this.activityAddItems.length || stillHasActivityToDelete){
            throw `Deleting activity index=${index} doesn't work. The element is still on the page.`;
        }

        const numItems = this.activityAddItems.length;
        this.activityAddItems = this.activityAddItems.slice(0, index).concat(this.activityAddItems.slice(index+1, numItems));
        for (let i = index; i < numItems-1; i++) {
            await this.activityAddItems[i].init(i);
        }
    }

    async saveChanges(){
        await this.saveButton.click();
        await (this.getNewDialog()).waitForOpenAndClickOnOkButton();
        await this.waitLoad();
    }

    async cancelChanges(){
        await this.cancelButton.click();
        await this.waitForMilliseconds(500); // wait for page clear list
        await this.init();
    }
}

module.exports = ActivityAdditionPage;