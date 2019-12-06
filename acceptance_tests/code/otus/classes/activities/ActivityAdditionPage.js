const PageOtus = require('../PageOtus');
const ActivityAdditionItemPaper = require('./ActivityAdditionItemPaper');

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
            index: 2, value: "REPETIÇÃO"
        }
    }
};

const selectors = {
    switches: {
        type: {
            ATTRIBUTES: "[aria-label='ActivityType']",
            TEMP_ID: "typeSwitch"
        },
        quantity: {
            ATTRIBUTES: "[aria-label='ActivitySelection']",
            TEMP_ID: "quantitySwitch"
        },
    },
    buttons:{
        add: {
            unit: {
                ATTRIBUTES: "[aria-label='Adicionar']",
                TEMP_ID: "addButton"
            },
            block: {
                ATTRIBUTES: "[aria-label='Adicionar Blocos']",
                TEMP_ID: "addBlockButton"
            }
        },
        save: {
            ATTRIBUTES: "[aria-label='Salvar']",
            TEMP_ID: "saveButton"
        },
        cancel: {
            ATTRIBUTES: "[aria-label='Cancelar']",
            TEMP_ID: "cancelButton"
        }
    },
    activityCard: {
        TAG: "md-grid-tile",
        DELETE_BUTTON: ""
    },
    AUTO_COMPLETE_SEARCH_ID: "autocomplete_selectSurvey",
    blocks: {
        ATTRIBUTES: "[ng-model='$ctrl.selectedGroups']",
        TEMP_ID: "blocksSelector"
    },
    category: {
        ATTRIBUTES: "[ng-model='$ctrl.configuration.category']",
        TEMP_ID: "categorySelector"
    }
};

class ActivityAdditionPage extends PageOtus {

    constructor(page){
        super(page);
        this.typeSwitch = this.getNewSwitch();
        this.quantitySwitch = this.getNewSwitch();
        this.categorySelector = this.getNewOptionSelector();
        this.addButton = this.getNewButton();
        this.addBlockButton = this.getNewButton();
        this.saveButton = this.getNewButton();
        this.cancelButton = this.getNewButton();
        this.activityAutocomplete = this.getNewAutoCompleteSearch();
        this.blockSelector = this.getNewMultipleOptionSelector();
        this.activityAddItems = [];
    }

    async init(){
        try{
            await this.typeSwitch.initByAttributesSelector(selectors.switches.type.ATTRIBUTES, selectors.switches.type.TEMP_ID);
            await this.quantitySwitch.initByAttributesSelector(selectors.switches.quantity.ATTRIBUTES, selectors.switches.quantity.TEMP_ID);
            await this.categorySelector.initByAttributesSelector(selectors.category.ATTRIBUTES, selectors.category.TEMP_ID);

            await this.saveButton.initByAttributesSelector(selectors.buttons.save.ATTRIBUTES, selectors.buttons.save.TEMP_ID);
            await this.cancelButton.initByAttributesSelector(selectors.buttons.cancel.ATTRIBUTES, selectors.buttons.cancel.TEMP_ID);

            await this.addButton.initByAttributesSelector(selectors.buttons.add.unit.ATTRIBUTES, selectors.buttons.add.unit.TEMP_ID);
            await this.addBlockButton.initByAttributesSelector(selectors.buttons.add.block.ATTRIBUTES, selectors.buttons.add.block.TEMP_ID);

            await this.blockSelector.initByAttributesSelector(selectors.blocks.ATTRIBUTES, selectors.blocks.TEMP_ID);
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    }

    static get enums(){
        return enums;
    }

    async countActivities(){
        const tag = (new ActivityAdditionItemPaper(this)).tagName; // paper and online have same tag
        return (await this.page.$$(tag)).length;
    }

    async switchTypeTo(typeEnumValue){
        if(this.typeSwitch.isOn !== typeEnumValue){
            await this.typeSwitch.change();
        }
    }

    async switchTypeToOnline(){
        if(this.typeSwitch.isOn !== enums.type.ON_LINE){
            await this.typeSwitch.change();
        }
    }

    async switchTypeToPaper(){
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
            await this.blockSelector.initByAttributesSelector(selectors.blocks.ATTRIBUTES, selectors.blocks.TEMP_ID);
        }
    }

    async selectCategory(categoryEnumValue=enums.category.NORMAL){
        await this.categorySelector.selectOptionByIndex(categoryEnumValue.index);
        await this.waitForMilliseconds(500); // wait options close safely
    }

    async searchActivity(nameOrAcronym){
        await this.activityAutocomplete.typeAndClickOnFirstOfList(nameOrAcronym);
        //await this.activityAutocomplete.clear();
    }

    async addActivity(nameOrAcronym, ActivityAdditionItemClass){
        await this.activityAutocomplete.typeAndClickOnFirstOfList(nameOrAcronym);
        await this.addButton.click();
        await this.waitForMilliseconds(500); // wait activity card appear
        //await this.activityAutocomplete.clear();

        const activityAddItem = new ActivityAdditionItemClass(this);
        this.activityAddItems = [activityAddItem].concat(this.activityAddItems);
        return activityAddItem;
    }

    async addActivityBlock(blockNames, ActivityAdditionItemClass){
        try {
            const numActivitiesBefore = await this.countActivities();
            await this.switchQuantityToList();
            await this.blockSelector.selectOptions(blockNames);
            await this.waitForMilliseconds(500); // wait add button set as enable
            await this.addBlockButton.click();
            await this.waitForMilliseconds(500); // wait activity cards appear
            await this.clickOut();

            const totalActivities = await this.countActivities();
            const numNewActivities = totalActivities - numActivitiesBefore;
            for (let i = 0; i < numNewActivities; i++) {
                let activityAddItem = new ActivityAdditionItemClass(this);
                this.activityAddItems.push(activityAddItem);
            }
        }
        catch (e) {
            console.log(e);
            await this.hasElementWithLog('#'+this.addButton.id);
            throw e;//.
        }
    }

    async initItems(){
        let paperActivityIndex = 0;
        for (let i = 0; i < this.activityAddItems.length; i++) {
            await this.activityAddItems[i].init(i, paperActivityIndex);
            paperActivityIndex += (this.activityAddItems[i] instanceof ActivityAdditionItemPaper? 1 : 0);
        }
    }

    async _updateItems(startIndex, nextPaperActivityIndex){
        for (let i = startIndex; i < this.activityAddItems.length; i++) {
            await this.activityAddItems[i].init(i, nextPaperActivityIndex++);
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
        await this.waitForMilliseconds(1000); // wait for update list

        const numActivityAddItems = await this.countActivities();
        if(numActivityAddItems === this.activityAddItems.length){
            throw `Deleting activity index=${index} doesn't work. The element is still on the page.`;
        }

        try {
            const numItems = this.activityAddItems.length;
            this.activityAddItems = this.activityAddItems.slice(0, index)
                .concat(this.activityAddItems.slice(index + 1, numItems));
            await this.initItems();
        }
        catch(e){
            console.log(e);
            throw e;
        }
    }

    async saveChanges(){
        await this.saveButton.click();
        await (this.getNewDialog()).waitForOpenAndClickOnOkButton();
        await this.waitLoad();
    }

    async cancelChanges(){
        await this.cancelButton.click();
        await (this.getNewDialog()).waitForOpenAndClickOnOkButton();
        await this.waitLoad();
    }
}

module.exports = ActivityAdditionPage;