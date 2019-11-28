const PageExtended = require('../../classes/PageExtended');
const PageElement = require('../../classes/PageElement');
const {Sidenav, sideEnum} = require('../../classes/Sidenav');

// ***********************************************

const HOME_PAGE = process.env.OTUS_URL + '/#/dashboard';

let selectors = {
    //LOADING_PAGE: "div[class='pg-loading-screen pg-loading pg-loaded']",
    LOADING_PAGE: "div[class='pg-loading-screen pg-loading']",
    MAIN_MENU_BUTTON: "button[ng-click='$ctrl.launchSidenav()']",
    login:{
        EMAIL_INPUT: 'input[name=userEmail]',
        PASSWORD_INPUT: 'input[name=userPassword]',
        SUBMIT_BUTTON: 'button[type=submit]'
    },
    button: {
        // toolbar
        COPIAR_TOKEN: "button[ng-click='$ctrl.copyToClipboard()']",
        RELATORIO_ERROS: "button[aria-label='Relatar Bug']",
        //
        VER_PARTICIPANTE: "button[ng-click='$ctrl.iconButtonClick(column.specialField.iconButton, row)']",
    },
    homePage:{
        EXIBIR_TODOS_BUTTON: "button[ng-if='attrs.showParticipantsButton']",
        // laboratorio
        TRANSPORTE_AMOSTRA: "button[ng-click='$ctrl.sampleTransportDashboard()']",
        LOTES_EXAMES: "button[ng-click='$ctrl.examsDashboard()']",
        ENVIO_EXAMES: "button[ng-click='$ctrl.sendingExam()']",
        // monitoramento
        ATIVIDADES_CENTRO: "button[ng-click='$ctrl.startMonitoring()']",
        FLAGS_ATIVIDADES: "button[ng-click='$ctrl.activateActivityFlagsReport()']",
        FLAGS_LABORARORIO: "button[ng-click='$ctrl.laboratoryActivityFlagsReport()']",
        CONTROLE_LABORATORIAL: "button[ng-click='$ctrl.laboratoryMonitoring()']"
    },
    sidenav:{
        MENU_ARE_VISIBLE: "otus-dashboard-sidenav > div[style='overflow: hidden;']",
        LOGOUT_BUTTON: "button[aria-label='Logout']",
        HOME_BUTTON: "button[ng-click='$ctrl.home()']",
        ATIVIDADES_BUTTON: "button[ng-click='$ctrl.loadParticipantActivities()']",
        LABORATORIO_BUTTON: "button[ng-click='$ctrl.$ctrl.loadLaboratory()']",
        IMPORTAR_ATIVIDADES_BUTTON: "button[ng-click='$ctrl.importActivity()']"
    },
    searchParticipant: {
        BUSCA_NOME_NUMERO: "participantSearchAutoCompleteId" // main page - search participant
    }
};

// ***********************************************

class PageOtus extends PageExtended {

    constructor(page){
        super(page);
        this.typeCode = this.typeCodes.OTUS;
        //this.leftSidenav = new Sidenav(this);
    }

    static getSelectors(){
        return selectors;
    }

    async initLeftSidenav(){
        await this.leftSidenav.init();
    }

    async waitLoad(){
        try {
            await this.waitForSelector(selectors.LOADING_PAGE); // appear
        }
        catch (e) {
            return; // not appear... ok!
        }

        try {
            await this.waitForSelectorHidden(selectors.LOADING_PAGE); // disappear
            await this.waitForMilliseconds(500); // really disappear, because next page already load at background
        }
        catch (e) {
            const timeout = parseInt(process.env.WAIT_FOR_SELECTOR_TIMEOUT, 10);
            throw `Page load took longer than ${timeout} ms (url: ${this.page.url()})`;
        }
    }

    async refreshAndWaitLoad(){
        await super.refresh();
        await this.waitLoad();
        await this.init();
    }

    async gotoUrlAndWaitLoad(url){
        await super.gotoUrl(url);
        await this.waitLoad();
    }

    async goBackAndWaitLoad(){
        await super.goBack();
        await this.waitLoad();
    }

    async goToHomePage(){
        await this.gotoUrl(HOME_PAGE);
    }

    async goToHomePageAndWaitLoad(){
        await this.gotoUrl(HOME_PAGE);
        await this.waitLoad();
    }

    async clickOnMainMenuButton(){
        await this.clickWithWait(selectors.MAIN_MENU_BUTTON);
        await this.waitForSelector(selectors.sidenav.MENU_ARE_VISIBLE);
    }

    // ---------------------------------------------------------------
    // Open participant

    async openParticipantFromHomePage(recruitmentNumberOrName){
        const autoCompleteSearch = this.getNewAutoCompleteSearch();

        await autoCompleteSearch.initBySelectorAndSetTempId(autoCompleteSearch.tagName, selectors.searchParticipant.BUSCA_NOME_NUMERO);
        await autoCompleteSearch.typeAndClickOnFirstOfList(recruitmentNumberOrName);
        await this.waitLoad();
    }

    async goToParticipantHomePage(){
        await this.clickOnMainMenuButton();
        const button = (await this.page.$$(selectors.sidenav.HOME_BUTTON))[1];
        await button.click();
        await this.waitLoad();
    }

    async openParticipantActivitiesMenu(){
        await this.clickOnMainMenuButton();
        await this.clickWithWait(selectors.sidenav.ATIVIDADES_BUTTON);
        await this.waitLoad();
    }

    async openParticipantLaboratoryMenu(){

    }

}

module.exports = PageOtus;