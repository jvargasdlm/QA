const lib = require('../../code/otus/lib');

let browser, suiteArray=[], errorLogger;        // for all tests
let pageOtus, selectors;                        // only for otus tests
let activitiesPage, reportButtonStateIds;
const useOtus607=true;//.

beforeAll(async () => {
    [browser, pageOtus, errorLogger, selectors] = await lib.doBeforeAll(suiteArray);

    browser.on('targetcreated', async(target) => {
        console.log(`Created target type (${target.type()}) url=(${target.url()})\n`);//, target._targetInfo);
    });

    if(!useOtus607) {//.
        await openParticipantActivities('5078934');
    }//.
});

beforeEach(async () => {
    console.log('RUNNING TEST\n', errorLogger.currSpecName);
});

afterEach(async () => {
    errorLogger.advanceToNextSpec();
    await pageOtus.waitForMilliseconds(5000);//.
});

afterAll(async () => {
    await errorLogger.exportTestResultLog();
    await browser.close();
});

// *****************************************************************
// Specific modules for this suite test
const ActivitiesPage = require('../../code/otus/classes/ActivitiesPage');
const PrintTabPage   = require('../../code/otus/classes/PrintTabPage');
const ReportPage     = require('../../code/otus/classes/ReportPage');

// *****************************************************************
// Auxiliar functions

async function openParticipantActivities(recruitmentNumber){
    await pageOtus.openParticipantFromHomePage(recruitmentNumber);
    await pageOtus.openParticipantActivitiesMenu();
    activitiesPage = new ActivitiesPage(pageOtus.page);
    reportButtonStateIds = activitiesPage.reportButton.allStateIds;
}

async function savePdfReport(pdfFilenameNoExtension){
    //await pageOtus.clickWithWait(openPrintWindowButtonSelector); //"button[ng-click='$ctrl.generateReport(report)']"
    await pageOtus.waitForMilliseconds(1000);
    const printTabPage = new PrintTabPage(pageOtus.page);
    await printTabPage.savePdf(pdfFilenameNoExtension);
    //await pageOtus.waitLoad();
}

async function extractDataFromReportPage(){
    const targets = await browser.targets();
    let lastTarget = targets[targets.length-1];
    let newPage = await lastTarget.page();
    const reportPage = new ReportPage(newPage);
    await reportPage.extractInfo();
    await reportPage.close();
}

// *****************************************************************
// Tests

/*
1) Dado que um usuário revisor
Quando quiser gerar um relatório para fechamento de atividade
E um conjunto de variáveis (da atividade ou de outras atividades) atendem aos valores definidos previamente
E a quantidade de atividades selecionadas (checkbox) é igual a 1
Então o sistema deve habilitar o botão para gerar o relatório
E exibir o relatório com dados próprios da atividade numa nova aba

2) Dado que um usuário revisor
Quando quiser gerar um relatório para fechamento de atividade
E um conjunto de variáveis (da atividade ou de outras atividades) não atendem aos valores definidos previamente
E a quantidade de atividades selecionadas (checkbox) é igual a 1
Então o sistema deve habilitar o botão para gerar o relatório
E exibir o relatório de pendências num quadro Dialog

3) Dado que um usuário revisor
Quando quiser gerar um relatório para fechamento de atividade
E a quantidade de atividades selecionadas (checkbox) é diferente a 1
Então o sistema não deve mostrar o botão para gerar o relatório
 */

suiteArray = [

    describe('Temp Test', () => {
        test('Open window print', async() => {
            await pageOtus.openParticipantFromHomePage('5078934');
            await pageOtus.clickAfterFindInList("button[ng-click='report.expandAndCollapse()']", 7);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.generateReport(report)']");
            await pageOtus.waitForMilliseconds(2000);
            await extractDataFromReportPage();
        });
    }),

    xdescribe('Activities Report Generation - Scenario #3: Not exactly selecting 1 activity', () => {

        async function checkReportButtonIsHidden(firstActivityCheckboxIndex, secondActivityCheckboxIndex){
            await activitiesPage.selectActivityCheckbox(firstActivityCheckboxIndex);
            await activitiesPage.selectActivityCheckbox(secondActivityCheckboxIndex);
            await activitiesPage.initReportButton();
            const isHidden = await activitiesPage.reportButton.isHidden();
            try {
                expect(isHidden).toBeTrue();
            }
            catch (e) {
                errorLogger.addWrongAssertionLogFromCurrSpec(`Report button should be hidden, but does not.`);
            }
        }

        test('3.1 Select 0 activities', async() => {
            await checkReportButtonIsHidden(0, 0); // select and unselect
        });

        test('3.2 Select 2 activities', async() => {
            await checkReportButtonIsHidden(0, 1);
        });

    }),

    xdescribe('Activities Report Generation - Scenario #1: A set of variables meet the previously defined values', () => {

        async function generateReportAndSavePdf(activityCheckboxIndex, pdfFilenameNoExtension){
            await activitiesPage.selectActivityCheckbox(activityCheckboxIndex);
            await activitiesPage.initReportButton();
            await activitiesPage.clickOnReportButtonWithLoadState();
            await activitiesPage.clickOnReportButtonWithGenerateState();
            await savePdfReport(pdfFilenameNoExtension);
        }

        test('1.1 Set of variables ONLY from the activity', async() => {
            await generateReportAndSavePdf(0, 'testCase_1-1');
        });

        xtest('1.2 Set of variables ONLY from other activities', async() => {

        });

        xtest('1.3 Set of variables from the activity AND other activities', async() => {

        });

    }),

    xdescribe('Activities Report Generation - Scenario #2: A set of variables DO NOT meet the previously defined values', () => {

        test('2.1 Set of variables ONLY from the activity', async() => {

        });

        test('2.2 Set of variables ONLY from other activities', async() => {

        });

        test('2.3 Set of variables from the activity AND other activities', async() => {

        });

    }),

]; // end suiteArray
