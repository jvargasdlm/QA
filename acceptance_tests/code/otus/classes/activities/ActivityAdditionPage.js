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
            index: 2, value: "REPETICAO"
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
            SINGLE_ITEM_ATTRIBUTES: "[aria-label='Adicionar']",
            BLOCK_ATTRIBUTES: "[aria-label='Adicionar Blocos']",
            TEMP_ID: "addButton"
        },
        save: {
            ATTRIBUTES: "[aria-label='Salvar']",
            TEMP_ID: "saveButton"
        },
        cancel: {
            ATTRIBUTES: "[aria-label='deletar']",
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

            await this.switchQuantityToList(); //. temp
            await this.blockSelector.initByAttributesSelector(selectors.blocks.ATTRIBUTES, selectors.blocks.TEMP_ID);
            await this.addButton.initByAttributesSelector(selectors.buttons.add.BLOCK_ATTRIBUTES, selectors.buttons.add.TEMP_ID);
        }
        catch (e) {
            console.log(e);
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
            await this.addButton.initByAttributesSelector(selectors.buttons.add.SINGLE_ITEM_ATTRIBUTES, selectors.buttons.add.TEMP_ID);
        }
    }

    async switchQuantityToList(){
        if(this.quantitySwitch.isOn !== enums.quantity.LIST){
            await this.quantitySwitch.change();
            await this.blockSelector.initByAttributesSelector(selectors.blocks.ATTRIBUTES, selectors.blocks.TEMP_ID);
            await this.addButton.initByAttributesSelector(selectors.buttons.add.BLOCK_ATTRIBUTES, selectors.buttons.add.TEMP_ID);
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
        //await this.activityAutocomplete.clear();

        const activityAddItem = new ActivityAdditionItemClass(this);
        let nextPaperActivityIndex = (this.activityAddItems.filter(item => item instanceof ActivityAdditionItemPaper)).length;
        await activityAddItem.init(this.activityAddItems.length, nextPaperActivityIndex);
        this.activityAddItems.push(activityAddItem);
        return activityAddItem;
    }

    async addActivityBlock(blockNames, ActivityAdditionItemClass){
        try {
            const numActivitiesBefore = await this.countActivities();
            await this.switchQuantityToList();
            await this.blockSelector.selectOptions(blockNames);
            await this.addButton.click();
            await this.waitForMilliseconds(500); // wait activity cards appear
            await this.clickOut();

            let nextPaperActivityIndex = (this.activityAddItems.filter(item => item instanceof ActivityAdditionItemPaper)).length;
            const numNewActivities = (await this.countActivities()) - numActivitiesBefore;
            for (let i = 0; i < numNewActivities; i++) {
                let activityAddItem = new ActivityAdditionItemClass(this);
                await activityAddItem.init(this.activityAddItems.length, nextPaperActivityIndex++);
                this.activityAddItems.push(activityAddItem);
            }
        }
        catch (e) {
            console.log(e);//.
            throw e;//.
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
        await (this.getNewDialog()).waitForOpenAndClickOnOkButton();
        await this.waitForMilliseconds(500); // wait for page clear list
        await this.init();
    }
}

module.exports = ActivityAdditionPage;