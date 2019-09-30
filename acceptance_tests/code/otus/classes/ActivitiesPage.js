const PageOtus = require('./PageOtus');
const PreviewPage = require('./PreviewPage');
const DynamicElement = require('../../classes/DynamicElement');

// ***********************************************

const selectors = {
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
        DETALHES: "button[aria-label='Detalhes']"
    },
    bottomMenuButtons: {
        //MANAGER_COMMANDER: "otus-activity-manager-commander",
        ADD: "md-fab-trigger[aria-label='Adicionar atividade']",
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

    async addOnlineActivity(acronym){
        const mySelectors = selectors.bottomMenuButtons;
        await this.clickWithWait(mySelectors.ADD);
        await this.waitForSelector(mySelectors.WAIT_VISIBLE_ACTION);
        await this.clickWithWait(mySelectors.ATIVIDADE_ONLINE);
        await this.waitLoad();
        // select activity
        await this.typeWithWait("input[ng-model='$ctrl.filter']", acronym);
        await this.selectActivityCheckbox(0);
        await this.clickWithWait("button[aria-label='Adicionar']");
        await this.waitLoad();
        // select default category
        await this.clickWithWait("button[aria-label='Adicionar']");
        await this.waitLoad();
    }

    async selectActivityCheckbox(activityCheckBoxIndex){
        const index = activityCheckBoxIndex + 2; // add 'Todos' and 'Nome' checkboxes
        await (this.getCheckbox()).clickAfterFindInList(index);
    }

    async fillActivity(activityCheckBoxIndex, answersArr){
        await this.selectActivityCheckbox(activityCheckBoxIndex);
        await this.clickWithWait(selectors.topMenuButtons.PREENCHER_ATIVIDADE);
        const previewPage = new PreviewPage(this.page);
        await previewPage.fillActivityQuestions(answersArr);
    }

    async addOnLineActivityAndFill(acronym, answersArr){
        await this.addOnlineActivity(acronym);
        const nextIndex = await this.countActivities() - 1;
        console.log('nextIndex = ', nextIndex);
        await this.fillActivity(nextIndex, answersArr);
    }

    // -----------------------------------------------------
    // Report button

    async clickOnReportButton(){
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