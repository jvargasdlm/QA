const PageOtus = require('./PageOtus');

// ***********************************************

const MAIN_PAGE = 'http://localhost:3000/otus/app';
const HOME_PAGE = MAIN_PAGE + '/#/dashboard';

let selectors = {
    button: {
        // laboratorio
        TRANSPORTE_AMOSTRA: "button[ng-click='$ctrl.sampleTransportDashboard()']",
        LOTES_EXAMES: "button[ng-click='$ctrl.examsDashboard()']",
        ENVIO_EXAMES: "button[ng-click='$ctrl.sendingExam()']",
        //   monitoramento
        ATIVIDADES_CENTRO: "button[ng-click='$ctrl.startMonitoring()']",
        FLAGS_ATIVIDADES: "button[ng-click='$ctrl.activateActivityFlagsReport()']",
        FLAGS_LABORARORIO: "button[ng-click='$ctrl.laboratoryActivityFlagsReport()']",
        CONTROLE_LABORATORIAL: "button[ng-click='$ctrl.laboratoryMonitoring()']",
    },
    inputField:{
        BUSCA_NOME_NUMERO: "#participantSearchAutoCompleteId"
    }
};

// ***********************************************

class OtusMainPage extends PageOtus {

    constructor(page){
        super(page);
    }

    async goToHomePage(){
        await this.gotoUrl(HOME_PAGE);
    }

    async goToHomePageAndWaitLoad(){
        await this.gotoUrl(HOME_PAGE);
        await this.waitLoad();
    }

    getSelectors(){
        return selectors;
    }

}

module.exports = OtusMainPage;