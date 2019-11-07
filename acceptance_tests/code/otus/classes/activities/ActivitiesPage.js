const PageOtus = require('./PageOtus');
const PreviewPage = require('./PreviewPage');
const ActivityViewPage = require('./ActivityViewPage');
const DynamicElement = require('../../classes/DynamicElement');

// ***********************************************

const selectors = {
    SEARCH_FILTER_INPUT: "input[ng-model='$ctrl.filter']",
    topMenuButtons: {
        //TOOLBAR_MANAGER: 'otus-activity-manager-toolbar',
        reportButtons:{
            LOADING: "",
            VIEW: "",
        },
        GERAR_RELATORIO: "button[]",//<<
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
        WAIT_VISIBLE_ACTION: "md-fab-actions[aria-hidden='false']",
        ATIVIDADE_ONLINE: "button[aria-label='Atividade online']",
        ATIVIDADE_EM_PAPEL: "button[aria-label='Atividade em papel']"
    }
};

const reportButtonStateIds = {
    LOAD: "loadReport",
    GENERATE: "generateReport",
    PENDING_INFO: 'pendingInformation'
};

// ***********************************************

class ActivitiesPage extends PageOtus {

    constructor(page){
        super(page);
        this.reportButton = new DynamicElement(this, reportButtonStateIds, reportButtonStateIds.LOAD);

        this.activityCards = []; //<<
    }

    async initReportButton(){
        await this.reportButton.setId(this.reportButton.id);
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
        return (await this.page.$$('md-checkbox')).length - 2;
    }

    async searchAndSelectActivity(acronym, activityCheckboxIndex=0){
        await this.typeWithWait(selectors.SEARCH_FILTER_INPUT, acronym);
        await this.waitForMilliseconds(500); // wait for update list
        await this.selectActivityCheckbox(activityCheckboxIndex, true);
    }

    async selectActivityCheckbox(activityCheckBoxIndex, useFilter=false){
        try{
            let index = activityCheckBoxIndex + 2; // shift 'Todos' and 'Nome' checkboxes
            if(useFilter){
                index++; // shift Filter checkbox
            }
            await (this.getNewCheckbox()).clickAfterFindInList(index);
        }
        catch (e) {
            this.errorLogger.addFailMessageFromCurrSpec(`Activity checkbox with index=${activityCheckBoxIndex} was not found.`);
        }
    }

    async addOnlineActivity(acronym){
        const mySelectors = selectors.bottomMenuButtons;
        await this.clickWithWait(mySelectors.ADD);
        await this.setHiddenAttributeValue(selectors.bottomMenuButtons.ACTION_BUTTONS, false); // force
        await this.waitForMilliseconds(500); // without this wait, action buttons don't open
        await this.waitForSelector(mySelectors.WAIT_VISIBLE_ACTION);
        await this.clickWithWait(mySelectors.ATIVIDADE_ONLINE);
        await this.waitLoad();
        // select activity
        await this.searchAndSelectActivity(acronym);
        await this.clickWithWait(selectors.topMenuButtons.ADD_ACTIVITY);
        await this.waitLoad();
        // select default category
        await this.clickWithWait(selectors.topMenuButtons.ADD_ACTIVITY);
        await this.waitLoad();
    }

    async addOnLineActivityAndFill(acronym, answersArr){
        await this.addOnlineActivity(acronym);
        await this.fillActivity(acronym, answersArr);
    }

    async deleteActivity(acronym, activityCheckboxIndex=0){
        await this.searchAndSelectActivity(acronym, activityCheckboxIndex);
        await this.clickWithWait(selectors.topMenuButtons.EXCLUIR);
        await (this.getNewDialog()).waitForOpenAndClickOnOkButton();
        await this.refreshAndWaitLoad();
    }

    async fillActivity(acronym, answersArr, activityCheckboxIndex=0){
        await this.searchAndSelectActivity(acronym, activityCheckboxIndex);
        await this.clickWithWait(selectors.topMenuButtons.PREENCHER_ATIVIDADE);
        const previewPage = new PreviewPage(this.page);
        await previewPage.fillActivityQuestions(answersArr);
    }

    async readFinalizedActivity(acronym, activityCheckboxIndex=0){
        await this.searchAndSelectActivity(acronym, activityCheckboxIndex);
        await this.clickWithWait(selectors.topMenuButtons.VISUALIZAR_ATIVIDADE);
        await this.waitForMilliseconds(500);
        let answers = await (new ActivityViewPage(this.page)).extractAnswers();
        await this.goBackAndWaitLoad();
        return answers;
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
            const realState = Object.entries(reportButtonStateIds).filter( (state) => (state !== currState && state !== expectedNextState));
            await this.reportButton.setId(realState);
            throw `New state of dynamic element should be '${expectedNextState}', but this state was not found.`;
        }
        await this.reportButton.setId(expectedNextState);
    }

}

module.exports = ActivitiesPage;