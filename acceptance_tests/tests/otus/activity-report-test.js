const lib = require('../../code/otus/lib');

let browser, suiteArray=[], errorLogger;        // for all tests
let pageOtus, selectors;                        // only for otus tests
let activitiesPage, reportButtonStateIds;

beforeAll(async () => {
    [browser, pageOtus, errorLogger, selectors] = await lib.doBeforeAll(suiteArray);
    await openParticipantActivities('5001007');
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
const ActivitiesPage                = require('../../code/otus/classes/ActivitiesPage');
const ActivityQuestionAnswer        = require('../../code/otus/classes/ActivityQuestionAnswer');
const {ReportPage, reportItemTypes} = require('../../code/otus/classes/ReportPage');

// *****************************************************************
// Auxiliar functions

async function openParticipantActivities(recruitmentNumber){
    await pageOtus.openParticipantFromHomePage(recruitmentNumber);
    await pageOtus.openParticipantActivitiesMenu();
    activitiesPage = new ActivitiesPage(pageOtus.page);
    reportButtonStateIds = activitiesPage.reportButton.allStateIds;
}

async function extractDataFromReportPage(){
    const targets = await browser.targets();
    let lastTarget = targets[targets.length-1];
    let newPage = await lastTarget.page();
    const reportPage = new ReportPage(newPage, reportItemTypes.activity);
    const dataObj = await reportPage.extractInfo();
    await reportPage.close();
    console.log(JSON.stringify(dataObj, null, 4));//.
    return dataObj;
}

async function dialogGenerateButtonIsDisabled(buttonId){
    let disabledAttrValue = await activitiesPage.page.evaluate((buttonId) => {
        let element = document.body.querySelector('#'+buttonId);
        return element.getAttribute('disabled');
    }, buttonId);
    return (disabledAttrValue === 'disabled');
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

/*
Existe pendência?
    1. nenhuma
    2. parcial
        2.1 da própria atividade
        2.2 de outra(s) atividade(s)
        2.3 ambos
    3. total
        3.1 da própria atividade
        3.2 de outra(s) atividade(s)
        3.3 ambos
*/

suiteArray = [

    describe('Temp Test', () => {

        test('Open another report page', async() => {
            await pageOtus.goToParticipantHomePage();
            await pageOtus.clickAfterFindInList("button[ng-click='report.expandAndCollapse()']", 0);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.generateReport(report)']");
            // extract report info
            const targets = await browser.targets();
            let lastTarget = targets[targets.length-1];
            let newPage = await lastTarget.page();
            const reportPage = new ReportPage(newPage, reportItemTypes.exam);
            const dataObj = await reportPage.extractInfo();
            await reportPage.close();
            console.log(JSON.stringify(dataObj, null, 4));//.
        });

        xtest('Add and fill activity', async() => {
            const types = ActivityQuestionAnswer.dataTypes;
            const answersArr = [
                new ActivityQuestionAnswer(types.text, '20'),
                new ActivityQuestionAnswer(types.date, '30/09/2019'),
                new ActivityQuestionAnswer(types.singleOption, 'PUNHO'),
                new ActivityQuestionAnswer(types.date, '02/11/2019'),
                new ActivityQuestionAnswer(types.time, '19:05'),
                new ActivityQuestionAnswer(types.date, '15/11/2019'),
                new ActivityQuestionAnswer(types.time, '20:00')
            ];
            await activitiesPage.addOnLineActivityAndFill('ACTA', answersArr);
            //await activitiesPage.fillActivity(1, answersArr);
        });

    }),

    xdescribe('Activities Report Generation - Scenario #3: Not exactly selecting 1 activity', () => {

        async function checkReportButtonIsHidden(firstActivityCheckboxIndex, secondActivityCheckboxIndex){
            await activitiesPage.selectActivityCheckbox(firstActivityCheckboxIndex);
            await activitiesPage.initReportButton();
            await activitiesPage.selectActivityCheckbox(secondActivityCheckboxIndex);
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

    xdescribe('Activities Report Generation - Scenario #1: A set of variables meets the previously defined values', () => {

        async function generateReportAndGetData(activityCheckboxIndex){
            await activitiesPage.selectActivityCheckbox(activityCheckboxIndex);
            await activitiesPage.initReportButton();
            await activitiesPage.clickOnReportButtonAndUpdateId(reportButtonStateIds.GENERATE); // load state
            await activitiesPage.clickOnReportButton();
            const dataObj = await extractDataFromReportPage();
        }

        test('1.1 Set of variables ONLY from the activity', async() => {
            await generateReportAndGetData(1);
        });

        xtest('1.2 Set of variables ONLY from other activities', async() => {

        });

        xtest('1.3 Set of variables from the activity AND other activities', async() => {

        });

    }),

    xdescribe('Activities Report Generation - Scenario #1.5: A set of variables PARTIALLY meets previously set values', () => {

        async function generateReportAndGetData(activityCheckboxIndex, activityData){
            await activitiesPage.selectActivityCheckbox(activityCheckboxIndex);
            await activitiesPage.initReportButton();
            await activitiesPage.clickOnReportButtonAndUpdateId(reportButtonStateIds.PENDING_INFO); // load state
            await activitiesPage.clickOnReportButton();
            // open dialog
            let dialog = activitiesPage.getDialog();
            await dialog.waitForOpen();
            const generateButtonIsDisable = await dialogGenerateButtonIsDisabled(dialog.okButtonId);
            await dialog.clickOnOkButton();
            expect(generateButtonIsDisable).toBeFalse();

            const dataObj = await extractDataFromReportPage();
            console.log(JSON.stringify(dataObj, null, 4));//.
            //.
        }

        test('1.1 Set of variables ONLY from the activity', async() => {
            await generateReportAndGetData(0);
        });

        xtest('1.2 Set of variables ONLY from other activities', async() => {

        });

        xtest('1.3 Set of variables from the activity AND other activities', async() => {

        });

    }),

    xdescribe('Activities Report Generation - Scenario #2: A set of variables DOES NOT meet previously set values', () => {

        async function clickReportButtonAndWaitDialogForClose(activityCheckboxIndex){
            await activitiesPage.selectActivityCheckbox(activityCheckboxIndex);
            await activitiesPage.initReportButton();
            await activitiesPage.clickOnReportButtonAndUpdateId(reportButtonStateIds.PENDING_INFO); // load state
            await activitiesPage.clickOnReportButton(); // pending state
            // open dialog
            let dialog = activitiesPage.getDialog();
            await dialog.waitForOpen();
            const generateButtonIsDisable = await dialogGenerateButtonIsDisabled(dialog.okButtonId);
            await dialog.clickOnCancelButton();
            expect(generateButtonIsDisable).toBeTrue();
        }

        test('2.1 Set of variables ONLY from the activity', async() => {
            await clickReportButtonAndWaitDialogForClose(0);
        });

        xtest('2.2 Set of variables ONLY from other activities', async() => {

        });

        xtest('2.3 Set of variables from the activity AND other activities', async() => {

        });

    }),

]; // end suiteArray
