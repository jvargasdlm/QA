const PageOtus = require('./PageOtus');
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

    async addOnlineActivity(){
        const mySelectors = selectors.bottomMenuButtons;
        await this.clickWithWait(mySelectors.ADD);
        await this.waitForSelector(mySelectors.WAIT_VISIBLE_ACTION);
        await this.clickWithWait(mySelectors.ATIVIDADE_ONLINE);
        await this.waitLoad();
    }

    async selectActivityCheckbox(activityCheckBoxIndex){
        const index = activityCheckBoxIndex + 2; // add 'Todos' and 'Nome' checkboxes
        await (this.getCheckbox()).clickAfterFindInList(index);
    }

    async clickOnReportButtonWithLoadState(){
        await this.reportButton.click();
        await this.waitForSelectorHidden('#'+this.reportButton.id);
        const nextState = reportButtonStateIds.GENERATE;
        let element = await this.waitForSelector('#'+nextState);
        //console.log(`element '#${nextState}' was found?`, element!==undefined);//.
        if(!element){
            throw `New state of dynamic element should be '${nextState}', but this state was not found.`;
        }
        await this.reportButton.setId(nextState);
    }

    async clickOnReportButtonWithGenerateState(){
        await this.reportButton.click();
        // will open new tab with print page
    }

}

module.exports = ActivitiesPage;