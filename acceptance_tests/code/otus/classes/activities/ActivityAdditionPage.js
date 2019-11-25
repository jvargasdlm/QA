const PageOtus = require('../PageOtus');
const ActivityAdditionItemPaper     = require('./ActivityAdditionItemPaper');

const enums = {
    type:{
        ON_LINE: false,
        PAPER: true
    },
    quantity: {
        LIST: false,
        UNIT: true
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
        ADD: "button[aria-label='Adicionar']",
        SAVE: "button[aria-label='Salvar']",
        CANCEL: "button[aria-label='deletar']"
    },
    activityCard :{
        TAG: "md-grid-tile",
        DELETE_BUTTON: ""
    },
    CATEGORY_SELECTOR: "md-select[ng-model='$ctrl.configuration.category']",
    AUTO_COMPLETE_SEARCH_ID: "autocomplete_selectSurvey"
};

class ActivityAdditionPage extends PageOtus {

    constructor(page){
        super(page);
        this.typeSwitch = this.getNewSwitch();
        this.quantitySwitch = this.getNewSwitch();
        this.categorySelector = this.getNewOptionSelector();
        this.activityAutocomplete = this.getNewAutoCompleteSearch();
        this.blockSelector = this.getNewMultipleOptionSelector();
        this.addButton = this.getNewButton();
        this.saveButton = this.getNewButton();
        this.cancelButton = this.getNewButton();
        this.activityAddItems = [];
    }

    async init(){
        await this.typeSwitch.initBySelectorAndSetTempId(selectors.switches.type, "typeSwitch");
        await this.quantitySwitch.initBySelectorAndSetTempId(selectors.switches.quantity, "quantitySwitch");
        await this.categorySelector.initBySelectorAndSetTempId(selectors.CATEGORY_SELECTOR, "categorySelector");

        await this.blockSelector.initById(); //todo

        await this.addButton.initBySelectorAndSetTempId(selectors.buttons.ADD, "addButton");
        await this.saveButton.initBySelectorAndSetTempId(selectors.buttons.SAVE, "saveButton");
        await this.cancelButton.initBySelectorAndSetTempId(selectors.buttons.CANCEL, "cancelButton");
    }

    static get enums(){
        return enums;
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

    async switchQuantityToUnit(){
        if(this.quantitySwitch.isOn !== enums.quantity.UNIT){
            await this.quantitySwitch.change();
            await this.activityAutocomplete.initById(selectors.AUTO_COMPLETE_SEARCH_ID, 1, 1);
        }
    }

    async switchQuantityToList(){
        if(this.quantitySwitch.isOn !== enums.quantity.LIST){
            await this.quantitySwitch.change();
            //await this.blockSelector.initById(); // todo
        }
    }

    async selectCategory(categoryEnumValue=enums.category.NORMAL){
        await this.categorySelector.selectOptionByIndex_temp(categoryEnumValue.index); // todo
    }

    async searchActivity(nameOrAcronym){
        await this.activityAutocomplete.typeAndClickOnFirstOfList(nameOrAcronym);
        //await this.activityAutocomplete.clear();
    }

    async addActivity(nameOrAcronym, ActivityAdditionItemClass){
        await this.activityAutocomplete.typeAndClickOnFirstOfList(nameOrAcronym);
        await this.addButton.click();
        await this.waitForMilliseconds(500); // wait activity card appear
        await this.activityAutocomplete.clear();

        const activityAddItem = new ActivityAdditionItemClass(this);
        let nextPaperActivityIndex = (this.activityAddItems.filter(item => item instanceof ActivityAdditionItemPaper)).length;
        await activityAddItem.init(this.activityAddItems.length, nextPaperActivityIndex);
        this.activityAddItems.push(activityAddItem);
        return activityAddItem;
    }

    async addActivityBlock(blockName, ActivityAdditionItemClass){
        await this.blockSelector.typeAndClickOnFirstOfList(blockName);
        await this.addButton.click();
        await this.waitForMilliseconds(500); // wait activity cards appear
        await this.blockSelector.clear();

        let nextPaperActivityIndex = (this.activityAddItems.filter(item => item instanceof ActivityAdditionItemPaper)).length;
        const numActivities = (await this.page.$$((new ActivityAdditionItemClass(this)).tagName)).length;
        for (let i = 0; i < numActivities; i++) {
            let activityAddItem = new ActivityAdditionItemClass(this);
            await activityAddItem.init(this.activityAddItems.length, nextPaperActivityIndex++);
            this.activityAddItems.push(activityAddItem);
        }
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

        //await this.forceDeleteElementFromHTML('#'+activityAddItemToDelete.id);//.

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