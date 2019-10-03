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
const ActivitiesPage          = require('../../code/otus/classes/ActivitiesPage');
const ActivityQuestionAnswer  = require('../../code/otus/classes/ActivityQuestionAnswer');
const ActivityReportPage      = require('../../code/otus/classes/ActivityReportPage');
const ExamReportPage          = require('../../code/otus/classes/ExamReportPage');//.

// *****************************************************************
// Auxiliar functions

async function openParticipantActivities(recruitmentNumberOrName){
    await pageOtus.openParticipantFromHomePage(recruitmentNumberOrName);
    await pageOtus.openParticipantActivitiesMenu();
    activitiesPage = new ActivitiesPage(pageOtus.page);
    reportButtonStateIds = activitiesPage.reportButton.allStateIds;
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
    console.log(JSON.stringify(dataObj, null, 4));//.
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

function assertSentences(acronym, foundSentences, mustHaveSentences, canNotHaveSentences){
    let fail = false;

    for(let sentence of mustHaveSentences){
        try{
            expect(foundSentences.includes(sentence)).toBeTrue();
        }
        catch (e) {
            fail = true;
            console.log(`The report ${acronym} should have the sentence '${sentence}'`);
        }
    }

    for(let sentence of canNotHaveSentences){
        try{
            expect(foundSentences.includes(sentence)).toBeFalse();
        }
        catch (e) {
            fail = true;
            console.log(`The report ${acronym} should NOT have the sentence '${sentence}'`);
        }
    }

    expect(fail).toBeFalse();
}

//.
async function createAndFillACTA(create=false){
    const types = ActivityQuestionAnswer.dataTypes;
    const answersArr = [
        new ActivityQuestionAnswer(types.text, '1'),
        new ActivityQuestionAnswer(types.date, '24/12/2019'),
        new ActivityQuestionAnswer(types.singleOption, 'PUNHO'),
        new ActivityQuestionAnswer(types.date, '02/11/2019'),
        new ActivityQuestionAnswer(types.time, '19:05'),
        new ActivityQuestionAnswer(types.date, '15/11/2019'),
        new ActivityQuestionAnswer(types.time, '20:00')
    ];
    if(create){
        await activitiesPage.addOnLineActivityAndFill('ACTA', answersArr);
    }
    else{
        await activitiesPage.fillActivity('ACTA', answersArr);
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
            console.log(JSON.stringify(dataObj, null, 4));//.
        });

        xtest('Add and fill activity ELEA', async() => {
            const types = ActivityQuestionAnswer.dataTypes;
            const answersArr = [
                new ActivityQuestionAnswer(types.singleOption, 'Hospital'),
                // Q1.1
                new ActivityQuestionAnswer(types.number, '2270544'),
                new ActivityQuestionAnswer(types.text, 'HOSPITAL SAO VICENTE DE PAULO'),
                new ActivityQuestionAnswer(types.singleOption, 'Localizado e acesso autorizado'),

                new ActivityQuestionAnswer(types.singleOption, 'Não se aplica nesta investigação'), //1.2
                new ActivityQuestionAnswer(types.singleOption, 'Não'), //1.3
                new ActivityQuestionAnswer(types.singleOption, 'Não'), //1.4
                new ActivityQuestionAnswer(types.singleOption, 'Não. Inferior a 24h e NÃO é procedimento cardiovascular de interesse.'), //1.5
                new ActivityQuestionAnswer(types.singleOption, 'Não'), //1.6
                new ActivityQuestionAnswer(types.singleOption, 'Sim'), //12
                new ActivityQuestionAnswer(types.singleOption, 'Não') //13
            ];
            await activitiesPage.addOnLineActivityAndFill('ELEA', answersArr);
            //await activitiesPage.fillActivity('ELEA', answersArr);
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

    describe('Activities Report Generation - Scenario #1: A set of variables meets the previously defined values', () => {

        async function generateReportAndGetData(acronym, activityCheckboxIndex=0){
            await activitiesPage.searchAndSelectActivity(acronym, activityCheckboxIndex);
            await activitiesPage.initReportButton();
            await activitiesPage.clickOnReportButtonAndUpdateId(reportButtonStateIds.GENERATE); // load state
            await activitiesPage.clickOnReportButton();
            return await extractDataFromReportPage();
        }

        async function readFinalizedActivityAndGenerateReportToCompareData(acronym, activityCheckboxIndex=0){
            const answers = await activitiesPage.readFinalizedActivity(acronym, activityCheckboxIndex);
            console.log(JSON.stringify(answers, null, 4));//.
            await activitiesPage.goBack();
            await activitiesPage.waitLoad();
            const reportDataObj = await generateReportAndGetData(acronym, activityCheckboxIndex);
            return [answers, reportDataObj];
        }

        xtest('1. Set of variables ONLY from the activity', async() => {
            await generateReportAndGetData(2);
        });

        xtest('Temp test CSJ', async() => {
            await readFinalizedActivityAndGenerateReportToCompareData('CSJ');
        });

        test('Temp test ACTA', async() => {
            //await createAndFillACTA();
            const acronym = 'ACTA';
            const [answers, reportDataObj] = await readFinalizedActivityAndGenerateReportToCompareData(acronym);
            assertSentences(acronym, reportDataObj.items,
                ['Tem diabetes', 'Tireóide ok'],
                ['Vai morrer', 'Está com o pé na cova']);
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
