const PageOtus          = require('../PageOtus');
const PreviewPage       = require('../PreviewPage');

const DynamicElement    = require('../../../classes/DynamicElement');
const ActivityItem      = require('./ActivityItem');
const {SpeedDial,
    directionEnum} = require('../../../classes/SpeedDial');

// ***********************************************

const selectors = {
    SEARCH_FILTER_INPUT: "input[ng-model='$ctrl.filter']",
    activityActions: {
        parentElement: {
            XS: "md-bottom-sheet",
            GT_XS: "md-fab-speed-dial"
        },
        TRIGGER_BUTTON_XS_ID: "actionTriggerButton",
        buttons: {
            FILL: {
                selector: "button[aria-label='Preencher Atividade']",
                tempId: "fillActivityButton"
            },
            VIEW: {
                selector: "button[aria-label='Visualizar Atividade']",
                tempId: "viewActivityButton"
            },
            CHANGE_INSPECTOR: {
                selector: "button[aria-label='Alterar Aferidor']",
                tempId: "changeInspectorButton"
            },
            DELETE: {
                selector: "button[aria-label='Excluir']",
                tempId: "deleteActivityButton"
            },
            DETAILS: {
                selector: "button[aria-label='Detalhes']",
                tempId: "detailsButton"
            },
            REPORT: {
                parentSelector: "otus-activity-report",
                selector: "button[aria-label='Carregar Relatório']",
                tempId: "loadReportButton",
                stateIds: {
                    LOAD: "loadReport",
                    GENERATE: "generateReport",
                    PENDING_INFO: 'pendingInformation'
                },
            }
        }
    },
    bottomMenuButtons: {
        //MANAGER_COMMANDER: "otus-activity-manager-commander",
        ADD: "md-fab-trigger[aria-label='Adicionar atividade']",
        ACTION_BUTTONS: "md-fab-actions",
    },
    sortMenu:{
        selector: "button[ng-click='$mdMenu.open()']",
        tempId: "sortMenuButton",
        itemIds: {
            INSERTION: '$index',
            NAME: 'name',
            ACRONYM: 'acronym',
            EXTERNAL_ID: 'requiredExternalID',
            STATUS: 'status',
            REALIZATION_DATE: 'realizationDate',
            CATEGORY: 'category'
        }
    },
    reportButtonStateIds: {
        LOAD: "loadReport",
        GENERATE: "generateReport",
        PENDING_INFO: 'pendingInformation'
    }
};

const checkboxIndexes = {
    ALL_BLOCKS: { index: 0, tempId: "selectAllBlocksCheckbox" },
    ALL_ACTIVITIES: { index: 1, tempId: "selectAllActivitiesCheckbox" }
};

// ***********************************************

class ActivitiesPage extends PageOtus {

    constructor(page){
        super(page);
        this.allActivitiesCheckbox = this.getNewCheckbox();
        this.allBlocksCheckbox = this.getNewCheckbox();
        this.reportButton = new DynamicElement(this, selectors.reportButtonStateIds, selectors.reportButtonStateIds.LOAD);
        this.sortMenuButton = this.getNewButton();
        this.sortMenu = this.getNewMenu();
        this.actionButtons = undefined;
    }

    async init(){
        await this.allActivitiesCheckbox.initBySelectorAndSetTempId(this.allActivitiesCheckbox.tagName,
            checkboxIndexes.ALL_ACTIVITIES.tempId, checkboxIndexes.ALL_ACTIVITIES.index);

        await this.allBlocksCheckbox.initBySelectorAndSetTempId(this.allBlocksCheckbox.tagName,
            checkboxIndexes.ALL_BLOCKS.tempId, checkboxIndexes.ALL_BLOCKS.index);

        await this.sortMenuButton.initBySelectorAndSetTempId(selectors.sortMenu.selector, selectors.sortMenu.tempId);

        const buttonIds = Object.values(selectors.activityActions.buttons).map(obj => obj.tempId);
        if(this.isBigScreenHideXs){
            await this.findChildrenButtonToSetTempIds(selectors.activityActions.parentElement.XS, buttonIds);
        }
        else{
            this.actionButtons = new SpeedDial(this, directionEnum.down);
            await this.actionButtons.init(selectors.activityActions.TRIGGER_BUTTON_XS_ID, buttonIds);
        }
    }

    async initReportButton(){
        const grandparentSelector = (this.isBigScreenHideXs?
            selectors.activityActions.parentElement.XS :
            selectors.activityActions.TRIGGER_BUTTON_XS_ID);

        const parentSelector = selectors.activityActions.buttons.REPORT.parentSelector;
        const parentId = selectors.activityActions.buttons.REPORT.tempId;
        await this.findChildrenToSetTempIds(grandparentSelector, parentSelector, [parentId]);

        let parentElementHandle = await this.page.$('#'+parentId);
        await this.reportButton.init(parentElementHandle, '#'+this.reportButton.id);
    }

    // ---------------------------------------------------------------
    // Getters

    get getActionButtonsInfo(){
        return selectors.activityActions.buttons;
    }

    get getActionButtonTempIds(){
        //return Object.values(selectors.activityActions.buttons).map(obj => obj.tempId);
        return this.getNotDynamicActionButtonTempIds.concat(this.reportButton.id);
    }

    get getNotDynamicActionButtonTempIds(){
        const buttons = Object.values(selectors.activityActions.buttons);
        return buttons
            .filter((obj) => obj !== selectors.activityActions.buttons.REPORT)
            .map(obj => obj.tempId);
    }

    get getActivityActionButtonsParentTag(){
        return (this.isBigScreenHideXs?
            selectors.activityActions.parentElement.XS :
            selectors.activityActions.parentElement.GT_XS);
    }

    // ---------------------------------------------------------------

    async countActivities(){
        const tag = (new ActivityItem(this)).tagName;
        return (await this.page.$$(tag)).length;
    }

    async selectActivityItem(activityIndex){
        const activityItem = new ActivityItem(this);
        await activityItem.init(activityIndex);
        await activityItem.click();
        return activityItem;
    }

    async searchAndSelectActivity(acronym, activityIndex=0){
        await this.typeWithWait(selectors.SEARCH_FILTER_INPUT, acronym);
        await this.waitForMilliseconds(500); // wait for update list
        await this.selectActivityItem(activityIndex);
    }

    async pressAddActivityButton(){
        await this.clickWithWait(selectors.bottomMenuButtons.ADD);
    }

    async deleteActivity(acronym, activityIndex=0){
        await this.searchAndSelectActivity(acronym, activityIndex);
        await this.clickWithWait('#'+selectors.activityActions.buttons.DELETE.tempId);
        await (this.getNewDialog()).waitForOpenAndClickOnOkButton();
        await this.waitLoad();
        await this.init();
    }

    async selectActivityAndClickOnFillButton(acronym, activityIndex=0){
        await this.searchAndSelectActivity(acronym, activityIndex);
        await this.clickWithWait('#'+selectors.activityActions.buttons.FILL.tempId);
    }

    async selectAllActivities(){
        await this.allActivitiesCheckbox.click();
    }

    async selectAllBlocks(){
        await this.allBlocksCheckbox.click();
    }

    async extractDataFromActivityByIndex(activityIndex){
        const activityItem = new ActivityItem(this);
        await activityItem.init(activityIndex);
        return (await activityItem.extractInfo());
    }

    async extractAllActivitiesData(){
        let data = [];
        const numActivities = await this.countActivities();
        for (let i = 0; i < numActivities; i++) {
            let data_i = await this.extractDataFromActivityByIndex(i);
            data.push(data_i);
        }
        return data;
    }

    /*
     * Action buttons
     */

    async clickOnActionButton(buttonId){
        await this.clickWithWait(buttonId);
    }

    async viewFinalizedActivity(acronym, activityIndex=0){
        await this.searchAndSelectActivity(acronym, activityIndex);
        await this.clickWithWait('#'+selectors.activityActions.buttons.VIEW.tempId);
        await this.waitForMilliseconds(500);
    }

    /*******************************************************
     * Sort Menu
     */

    async sortActivitiesByOptionIndex(optionIndex){
        await this.sortMenuButton.click();
        await this.waitForMilliseconds(500); // wait options open
        if(!this.sortMenu.wasInitialized){
            await this.sortMenu.init();
        }
        await this.sortMenu.clickOnItem(optionIndex);
    }

    async sortActivitiesByOptionId(id){
        await this.sortMenuButton.click();
        await this.waitForMilliseconds(500); // wait options open
        if(!this.sortMenu.wasInitialized){
            await this.sortMenu.init();
        }
        await this.sortMenu.clickOnItemById(id);
    }

    // -----------------------------------------------------
    // Report button

    async clickOnReportButton(){
        await this.reportButton.click();
    }

    async clickOnReportButtonAndWaitToBeHidden(){
        await this.reportButton.click();
        await this.waitForSelectorHidden('#'+this.reportButton.id);
    }

    async clickOnReportButtonAndUpdateId(expectedNextState){
        const currState = this.reportButton.state;
        await this.clickOnReportButton();
        let element = await this.waitForSelector('#'+expectedNextState);
        //console.log(`element '#${nextState}' was found?`, element!==undefined);//.
        if(!element){
            const realState = Object.entries(selectors.reportButtonStateIds).filter( (state) => (state !== currState && state !== expectedNextState));
            await this.reportButton.init(realState);
            throw `New state of dynamic element should be '${expectedNextState}', but this state was not found.`;
        }
        await this.reportButton.init(expectedNextState);
    }

}

module.exports = ActivitiesPage;