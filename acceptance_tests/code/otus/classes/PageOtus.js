const PageExtended = require('../../classes/PageExtended');
const PageElement = require('../../classes/PageElement');

// ***********************************************

const MAIN_PAGE = 'http://localhost:3000/otus/app';
const HOME_PAGE = MAIN_PAGE + '/#/dashboard';

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
        MENU_ARE_VISIBLE: "otus-dashboard-sidenav[style='overflow: hidden;']",
        LOGOUT_BUTTON: "button[aria-label='Logout']",
        HOME_BUTTON: "button[ng-click='$ctrl.home()']",
        ATIVIDADES_BUTTON: "button[ng-click='$ctrl.loadParticipantActivities()']",
        LABORATORIO_BUTTON: "button[ng-click='$ctrl.$ctrl.loadLaboratory()']",
        IMPORTAR_ATIVIDADES_BUTTON: "button[ng-click='$ctrl.importActivity()']"
    },
    searchParticipant: {
        BUSCA_NOME_NUMERO: "#participantSearchAutoCompleteId", // main page - search participant
        AUTO_COMPLETE_SUGGESTIONS: 'md-virtual-repeat-container',
        AUTO_COMPLETE_ITEM: 'li'
    }
};

// ***********************************************

class PageOtus extends PageExtended {

    constructor(page){
        super(page);
        this.typeCode = this.typeCodes.OTUS;
    }

    getSelectors(){
        return selectors;
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
            throw `Page load took longer than ${this.WAIT_FOR_SELECTOR_TIMEOUT} ms (url: ${this.page.url()})`;
        }
    }

    async login(email, password){
        await this.gotoUrl(MAIN_PAGE); // need?
        const buttonSelector = selectors.login.SUBMIT_BUTTON;
        await this.waitForSelector(buttonSelector);
        await this.page.type(selectors.login.EMAIL_INPUT, email);
        await this.page.type(selectors.login.PASSWORD_INPUT, password);
        await this.page.click(buttonSelector);
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
        await this.typeWithWait(selectors.searchParticipant.BUSCA_NOME_NUMERO, recruitmentNumberOrName);
        let pageElement = new PageElement(this);
        let tempIdArr = await pageElement.findChildren(selectors.searchParticipant.AUTO_COMPLETE_SUGGESTIONS, selectors.searchParticipant.AUTO_COMPLETE_ITEM);
        await this.clickWithWait(`[id='${tempIdArr[0]}']`);
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