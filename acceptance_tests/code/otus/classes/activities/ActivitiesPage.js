const PageOtus          = require('../PageOtus');
const PreviewPage       = require('../PreviewPage');
const ActivityViewPage  = require('./ActivityViewPage');
const DynamicElement    = require('../../../classes/DynamicElement');
const ActivityItem      = require('./ActivityItem');
const {SpeedDial,
    directionEnum} = require('../../../classes/SpeedDial');

// ***********************************************

const selectors = {
    SEARCH_FILTER_INPUT: "input[ng-model='$ctrl.filter']",
    ACTION_TRIGGER_BUTTON_XS_ID: "actionTriggerButton",
    activityActions:{
        CHANGE_INSPECTOR: {
            selector: "button[aria-label='Alterar Aferidor']",
            tempId: "changeInspectorButton"
        },
        FILL: {
            selector: "button[aria-label='Preencher Atividade']",
            tempId: "fillActivityButton"
        },
        GENERATE_REPORT: {
            selector: "button[aria-label='Carregar Relatório']",
            tempId: "generateReportButton",
            sateIds: {
                LOAD: "loadReport",
                GENERATE: "generateReport",
                PENDING_INFO: 'pendingInformation'
            },
        },
        VIEW: {
            selector: "button[aria-label='Visualizar Atividade']",
            tempId: "viewActivityButton"
        },
        DELETE: {
            selector: "button[aria-label='Excluir']",
            tempId: "deleteActivityButton"
        },
        DETAILS: {
            selector: "button[aria-label='Detalhes']",
            tempId: "detailsButton"
        }
    },
    topMenuButtons: {
        //TOOLBAR_MANAGER: 'otus-activity-manager-toolbar',
        reportButtons:{
            LOADING: "",
            VIEW: "",
        },
        ALTERAR_AFERIDOR: "button[aria-label='Alterar Aferidor']",
        GERAR_RELATORIO: "button[aria-label='Carregar Relatório']",
        PREENCHER_ATIVIDADE: "button[aria-label='Preencher Atividade']",
        VISUALIZAR_ATIVIDADE: "button[aria-label='Visualizar Atividade']",
        EXCLUIR: "button[aria-label='Excluir']",
        DETALHES: "button[aria-label='Detalhes']",
        // while adding activity
        ADD_ACTIVITY: "button[aria-label='Adicionar']"
    },
    bottomMenuButtons: {
        //MANAGER_COMMANDER: "otus-activity-manager-commander",
        ADD: "md-fab-trigger[aria-label='Adicionar atividade']",
        ACTION_BUTTONS: "md-fab-actions",
    },
    sortMenu:{
        selector: "button[ng-click='$mdOpenMenu()']",
        id: "sortMenuButton",
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
    },
    /**
     * @return {string}
     */
    ACTIVITY_ITEM: function(index){
        return "activity"+index;
    },
    SORT_MENU_BUTTON: "button[ng-click='$mdOpenMenu()']",
    SORT_MENU_BUTTON_ID: "sortMenuButton",
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

        this.activityItems = []; //<<
        //this.addActivitySpeedDial = new SpeedDial(this, directionEnum.left);
    }

    async init(){
        await this.allActivitiesCheckbox.initBySelectorAndSetTempId(this.allActivitiesCheckbox.tagName,
            checkboxIndexes.ALL_ACTIVITIES.tempId, checkboxIndexes.ALL_ACTIVITIES.index);

        await this.allBlocksCheckbox.initBySelectorAndSetTempId(this.allBlocksCheckbox.tagName,
            checkboxIndexes.ALL_BLOCKS.tempId, checkboxIndexes.ALL_BLOCKS.index);

        //await this.leftSidenav.init();
        await this.sortMenuButton.initBySelectorAndSetTempId(selectors.SORT_MENU_BUTTON, selectors.SORT_MENU_BUTTON_ID);

        //await this.reportButton.setId(this.reportButton.id);

        if(this.isHideXs()){
            await this.page.evaluate(() => {

            });
        }
        else{
            this.actionButtons = new SpeedDial(this, directionEnum.down);
            const buttonIds = Object.values(selectors.activityActions).map(obj => obj.tempId);
            await this.actionButtons.init(selectors.ACTION_TRIGGER_BUTTON_XS_ID, buttonIds);
        }
    }

    async initReportButton(){
        await this.reportButton.init(this.reportButton.id);
    }

    // ---------------------------------------------------------------
    // Getters

    get selectors(){
        return selectors;
    }

    static getSelectors(){
        return selectors;
    }

    // ---------------------------------------------------------------

    async countActivities(){
        const tag = (new ActivityItem(this)).tagName;
        return (await this.page.$$(tag)).length;
    }

    async selectActivityItem(activityIndex){
        const activityItem = new ActivityItem(this);
        await activityItem.initById(selectors.ACTIVITY_ITEM(activityIndex));
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

    // async addOnlineActivity(acronym){
    //     try {
    //         //await this.addActivitySpeedDial.clickToOpenAndChooseAction(addActivityButtons.ON_LINE.index);
    //
    //         const mySelectors = selectors.bottomMenuButtons;
    //         await this.clickWithWait(mySelectors.ADD);
    //         await this.setHiddenAttributeValue(selectors.bottomMenuButtons.ACTION_BUTTONS, false); // force
    //         await this.waitForMilliseconds(500); // without this wait, action buttons don't open
    //         await this.waitForSelector(mySelectors.WAIT_VISIBLE_ACTION);
    //         await this.clickWithWait(mySelectors.ATIVIDADE_ONLINE);
    //         await this.waitLoad();
    //         // select activity
    //         await this.searchAndSelectActivity(acronym);
    //         await this.clickWithWait(selectors.topMenuButtons.ADD_ACTIVITY);
    //         await this.waitLoad();
    //         // select default category
    //         await this.clickWithWait(selectors.topMenuButtons.ADD_ACTIVITY);
    //         await this.waitLoad();
    //     }
    //     catch (e) {
    //         await this.saveHTML("activPage");
    //         console.log(e);
    //     }
    // }

    async deleteActivity(acronym, activityIndex=0){
        await this.searchAndSelectActivity(acronym, activityIndex);
        await this.clickWithWait(selectors.topMenuButtons.EXCLUIR);
        await (this.getNewDialog()).waitForOpenAndClickOnOkButton();
        await this.refreshAndWaitLoad();
    }

    // async selectActivityAndClickOnFillButton(acronym, answersArr, activityIndex=0){
    //     await this.searchAndSelectActivity(acronym, activityIndex);
    //     await this.clickWithWait(selectors.topMenuButtons.PREENCHER_ATIVIDADE);
    //     const previewPage = new PreviewPage(this.page);
    //     await previewPage.fillActivityQuestions(answersArr);
    // }

    async selectActivityAndClickOnFillButton(acronym, activityIndex=0){
        await this.searchAndSelectActivity(acronym, activityIndex);
        await this.clickWithWait(selectors.topMenuButtons.PREENCHER_ATIVIDADE);
    }

    async readFinalizedActivity(acronym, activityIndex=0){
        await this.searchAndSelectActivity(acronym, activityIndex);
        await this.clickWithWait(selectors.topMenuButtons.VISUALIZAR_ATIVIDADE);
        await this.waitForMilliseconds(500);
        let answers = await (new ActivityViewPage(this.page)).extractAnswers();
        await this.goBackAndWaitLoad();
        return answers;
    }

    async selectAllActivities(){
        await this.allActivitiesCheckbox.click();
    }

    async selectAllBlocks(){
        await this.allBlocksCheckbox.click();
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