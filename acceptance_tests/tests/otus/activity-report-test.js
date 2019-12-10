const lib = require('../../code/otus/lib');

let browser, suiteArray=[], errorLogger;        // for all tests
let pageOtus, selectors;                        // only for otus tests
let activitiesPage, activityAdditionPage, reportButtonStateIds;

beforeAll(async () => {
    [browser, pageOtus, errorLogger, selectors] = await lib.doBeforeAll(suiteArray);
    await openParticipantActivitiesAndCreateTestActivities();
});

beforeEach(async () => {
    console.log('RUNNING TEST\n', errorLogger.currSpecName);
});

afterEach(async () => {
    errorLogger.advanceToNextSpec();
    await activitiesPage.refreshAndWaitLoad();
});

afterAll(async () => {
    await deleteAllActivitiesCreatedForTests();
    await errorLogger.exportTestResultLog();
    await browser.close();
});

// *****************************************************************
// Specific modules for this suite test
const ActivitiesPage          = require('../../code/otus/classes/activities/ActivitiesPage');
const ActivityAdditionPage    = require('../../code/otus/classes/activities/ActivityAdditionPage');
const ActivityAdditionItemPaper = require('../../code/otus/classes/activities/ActivityAdditionItemPaper');
const ActivityQuestionAnswer  = require('../../code/otus/classes/activities/ActivityQuestionAnswer');
const ActivityReportPage      = require('../../code/otus/classes/activities/ActivityReportPage');
const ExamReportPage          = require('../../code/otus/classes/ExamReportPage');// used as model

// Constants
const recruitmentNumberOrName = '5001007';
const acronymsArr = ['ACTA'];//, 'ANTC'];
const answerDataTypes = ActivityQuestionAnswer.dataTypes;

// *****************************************************************
// Auxiliar functions

async function openParticipantActivitiesAndCreateTestActivities(){
    await pageOtus.openParticipantFromHomePage(recruitmentNumberOrName);
    await pageOtus.openParticipantActivitiesMenu();
    activitiesPage = new ActivitiesPage(pageOtus.page);
    reportButtonStateIds = activitiesPage.reportButton.allStateIds;
    await activitiesPage.pressAddActivityButton();

    activityAdditionPage = new ActivityAdditionPage(pageOtus.page);
    await activityAdditionPage.init();

    // create activities of paper type
    for(let acronym of acronymsArr){
        await activityAdditionPage.addActivity(acronym, ActivityAdditionItemPaper);
    }
}

async function deleteAllActivitiesCreatedForTests(){
    for(let acronym of acronymsArr){
        await activitiesPage.deleteActivity(acronym);
    }
}

async function extractDataFromReportPage(){
    let targets = await browser.targets();
    let lastTarget = targets[targets.length-1];
    let newPage = await lastTarget.page();
    const reportPage = new ActivityReportPage(newPage);

    //.
    const reportPageIsReady = false;
    if(!reportPageIsReady){
        await reportPage._replaceContent(['Tem diabetes', 'Está com o pé na cova']);
    }
    //.

    const dataObj = await reportPage.extractInfo();
    await reportPage.closeAsNewTab();
    await activitiesPage.waitLoad();
    return dataObj;
}

async function dialogGenerateButtonIsDisabled(buttonId){
    let disabledAttrValue = await activitiesPage.page.evaluate((buttonId) => {
        let element = document.body.querySelector('#'+buttonId);
        return element.getAttribute('disabled');
    }, buttonId);
    return (disabledAttrValue === 'disabled');
}

async function generateReportAndGetData(acronym, activityCheckboxIndex=0){
    await activitiesPage.searchAndSelectActivity(acronym, activityCheckboxIndex);
    await activitiesPage.initReportButton();
    //await activitiesPage.clickOnReportButtonAndUpdateId(reportButtonStateIds.GENERATE); // load state
    await activitiesPage.clickOnReportButton();
    //return await extractDataFromReportPage();
}

function assertSentences(acronym, foundSentences, mustHaveSentences, canNotHaveSentences){
    let fail = false;
    let failMessages = [];

    for(let sentence of mustHaveSentences){
        try{
            expect(foundSentences.includes(sentence)).toBeTrue();
        }
        catch (e) {
            fail = true;
            failMessages.push(`The report ${acronym} should have the sentence '${sentence}'`);
        }
    }

    for(let sentence of canNotHaveSentences){
        try{
            expect(foundSentences.includes(sentence)).toBeFalse();
        }
        catch (e) {
            fail = true;
            failMessages.push(`The report ${acronym} should NOT have the sentence '${sentence}'`);
        }
    }

    try {
        expect(fail).toBeFalse();
    }
    catch (e) {
        errorLogger.addFailMessagesFromCurrSpec(failMessages);
    }
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

    xdescribe('Temp Test', () => {

        xtest('Open exam report page', async() => {
            await pageOtus.goToParticipantHomePage();
            await pageOtus.clickAfterFindInList("button[ng-click='report.expandAndCollapse()']", 0);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.generateReport(report)']");
            // extract report info
            const targets = await browser.targets();
            let lastTarget = targets[targets.length-1];
            let newPage = await lastTarget.page();
            const reportPage = new ExamReportPage(newPage);
            const dataObj = await reportPage.extractInfo();
            await reportPage.close();
            console.log(JSON.stringify(dataObj, null, 4));
        });

    }),

    xdescribe('Activities Report Generation - Scenario #3: Not exactly selecting 1 activity', () => {

        async function checkReportButtonIsHidden(firstActivityCheckboxIndex, secondActivityCheckboxIndex){
            await activitiesPage.selectActivityItem(firstActivityCheckboxIndex);
            await activitiesPage.init();
            await activitiesPage.selectActivityItem(secondActivityCheckboxIndex);
            const isHidden = await activitiesPage.reportButton.isHidden();
            try {
                expect(isHidden).toBeTrue();
            }
            catch (e) {
                errorLogger.addFailMessageFromCurrSpec(`Report button should be hidden, but does not.`);
            }
        }

        test('3.1 Select 0 activities', async() => {
            await checkReportButtonIsHidden(0, 0); // select and unselect
        });

        test('3.2 Select 2 activities', async() => {
            await checkReportButtonIsHidden(0, 1);
        });

    }),

    describe('Activities Report Generation - Scenario #1: A set of variables meets the previously defined values', () => {

        async function createAndFillActivityGenerateReportAndGetData(acronym, answersArr, mustSatisfyConditions, canNotSatisfyConditions, activityCheckboxIndex=0){
            await activitiesPage.selectActivityAndClickOnFillButton(acronym, answersArr);
            const reportDataObj = await generateReportAndGetData(acronym, activityCheckboxIndex);
            //assertSentences(acronym, reportDataObj.items, mustSatisfyConditions, canNotSatisfyConditions);
        }

        xtest('1. Set of variables ONLY from the activity', async() => {

        });

        test('Test ACTA', async() => {
            const acronym = 'ACTA';
            const answersArr = [
                new ActivityQuestionAnswer(answerDataTypes.text, '1'),
                new ActivityQuestionAnswer(answerDataTypes.date, '24/12/2019'),
                new ActivityQuestionAnswer(answerDataTypes.singleOption, 'PUNHO'),
                new ActivityQuestionAnswer(answerDataTypes.date, '02/11/2019'),
                new ActivityQuestionAnswer(answerDataTypes.time, '19:05'),
                new ActivityQuestionAnswer(answerDataTypes.date, '15/11/2019'),
                new ActivityQuestionAnswer(answerDataTypes.time, '20:00')
            ];
            const mustSatisfyConditions = ['Tem diabetes', 'Tireóide ok'];
            const canNotSatisfyConditions = ['Vai morrer', 'Está com o pé na cova'];
            await createAndFillActivityGenerateReportAndGetData(acronym, answersArr, mustSatisfyConditions, canNotSatisfyConditions);
        });

    }),

    xdescribe('Activities Report Generation - Scenario #1.5: A set of variables PARTIALLY meets previously set values', () => {

        test('1.1 Set of variables ONLY from the activity', async() => {

        });

        xtest('1.2 Set of variables ONLY from other activities', async() => {

        });

        xtest('1.3 Set of variables from the activity AND other activities', async() => {

        });

    }),

    xdescribe('Activities Report Generation - Scenario #2: A set of variables DOES NOT meet previously set values', () => {

        async function clickReportButtonAndWaitDialogForClose(activityCheckboxIndex){
            await activitiesPage.selectActivityItem(activityCheckboxIndex);
            await activitiesPage.init();
            await activitiesPage.clickOnReportButtonAndUpdateId(reportButtonStateIds.PENDING_INFO); // load state
            await activitiesPage.clickOnReportButton(); // pending state
            // open dialog
            let dialog = activitiesPage.getNewDialog();
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
