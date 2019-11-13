const lib = require('../../code/otus/lib');

let browser, suiteArray=[], errorLogger;        // for all tests
let pageOtus, selectors;                        // only for otus tests
let activitiesPage;

beforeAll(async () => {
    [browser, pageOtus, errorLogger, selectors] = await lib.doBeforeAll(suiteArray);
    await openParticipantActivities();
});

beforeEach(async () => {
    console.log('RUNNING TEST\n', errorLogger.currSpecName);
});

afterEach(async () => {
    errorLogger.advanceToNextSpec();
    //await activitiesPage.refreshAndWaitLoad();
    await pageOtus.waitForMilliseconds(5000);//.
});

afterAll(async () => {
    await errorLogger.exportTestResultLog();
    await browser.close();
});

// *****************************************************************
// Specific modules for this suite test
const ActivitiesPage          = require('../../code/otus/classes/activities/ActivitiesPage');
const ActivityQuestionAnswer  = require('../../code/otus/classes/activities/ActivityQuestionAnswer');
const ActivityViewPage        = require('../../code/otus/classes/activities/ActivityViewPage');
const PreviewPage             = require('../../code/otus/classes/PreviewPage');

// Constants
const recruitmentNumberOrName = '5001007';// '2000735';
const acronym = 'FG';
const answersArr = [
    new ActivityQuestionAnswer(ActivityQuestionAnswer.dataTypes.number, '0')
];

// *****************************************************************
// Auxiliar functions

async function openParticipantActivities(){
    await pageOtus.openParticipantFromHomePage(recruitmentNumberOrName);
    await pageOtus.openParticipantActivitiesMenu();
    activitiesPage = new ActivitiesPage(pageOtus.page);
    await activitiesPage.init();
}

// *****************************************************************
// Tests

suiteArray = [

    xdescribe('Temp Test', () => {

        test('Temp test', async() => {
            const activityItem = await activitiesPage.selectActivityItem(1);
            console.log(await activityItem.extractInfo());

            await activitiesPage.clickOnActionButton(activitiesPage.getActionButtonTempIds.VIEW);
        });

        xtest('Clicks test', async() => {
            await activitiesPage.sortActivitiesByOptionIndex(1);
            await activitiesPage.selectAllBlocks();
            await activitiesPage.waitForMilliseconds(5000);
        });

        xtest('Count action buttons', async() => {
            await activitiesPage.selectActivityItem(1);

            const topMenuButtons = {
                ALTERAR_AFERIDOR: "button[aria-label='Alterar Aferidor']",
                GERAR_RELATORIO: "button[aria-label='Carregar Relatório']",
                PREENCHER_ATIVIDADE: "button[aria-label='Preencher Atividade']",
                VISUALIZAR_ATIVIDADE: "button[aria-label='Visualizar Atividade']",
                EXCLUIR: "button[aria-label='Excluir']",
                DETALHES: "button[aria-label='Detalhes']"
            };

            for(let selector of Object.values(topMenuButtons)){
                await activitiesPage.hasElementSelector(selector);
                await activitiesPage.hasElementSelector(selector+"[hide-xs]");
                await activitiesPage.hasElementSelector(selector+"[hide-gt-xs]");
            }

            await activitiesPage.selectActivityItem(1);
        });

    }),

    xdescribe('Scenario #2.1 - Activity selection', () => {

        async function checkVisibilityOfActivityButtons(buttonsThatShouldBeVisibleArr){
            await activitiesPage.waitForMilliseconds(500);

            let hiddenButtonsArr = null;
            try {
                const visibleButtonsArr = await activitiesPage.page.evaluate((buttonIds) => {
                    let arr = [];
                    for(let id of buttonIds){
                        const element = document.querySelector(`[id='${id}']`);
                        if (element.getAttribute("aria-hidden") === "false" ||
                            element.getAttribute("ng-disable") === "true"){
                            arr.push(id);
                        }
                    }
                    return arr;
                }, buttonsThatShouldBeVisibleArr);

                const hiddenButtonsArr = buttonsThatShouldBeVisibleArr.filter(id => !visibleButtonsArr.includes(id));

                expect(hiddenButtonsArr.length).toBe(0);
            }
            catch (e) {
                if(!hiddenButtonsArr){
                    throw e;
                }
                errorLogger.addFailMessageFromCurrSpec('Some activity buttons should be visible, but do not. '
                    + 'Hidden buttons: ' + hiddenButtonsArr.join(", "));
            }
            finally {
                await activitiesPage.refreshAndWaitLoad();
                await activitiesPage.init();
            }
        }

        test('2.1a Select 0 activities', async() => {
            await activitiesPage.selectActivityItem(0);
            await activitiesPage.selectActivityItem(0);
            await checkVisibilityOfActivityButtons([]);
        });

        test('2.1b Select 2 activities', async() => {
            await activitiesPage.selectActivityItem(0);
            await activitiesPage.selectActivityItem(1);
            const deleteButtonId = activitiesPage.getActionButtonsInfo.DELETE.tempId;
            await checkVisibilityOfActivityButtons([deleteButtonId]);
        });

        test('2.1c1 Select 1 activity of ON-LINE type', async() => {
            await activitiesPage.selectActivityItem(0);
            await activitiesPage.initReportButton();
            const inspectorButtonId = activitiesPage.getActionButtonsInfo.CHANGE_INSPECTOR.tempId;
            const buttonsThatShouldBeVisibleArr = activitiesPage.getNotDynamicActionButtonTempIds.filter(id => id !== inspectorButtonId);
            await checkVisibilityOfActivityButtons(buttonsThatShouldBeVisibleArr);
        });

        test('2.1c2 Select 1 activity of PAPER type', async() => {
            await activitiesPage.selectActivityItem(1);
            await activitiesPage.initReportButton();
            const buttonsThatShouldBeVisibleArr = activitiesPage.getNotDynamicActionButtonTempIds;
            await checkVisibilityOfActivityButtons(buttonsThatShouldBeVisibleArr);
        });
    }),

    xdescribe('Scenario #2.5 - View activity', () => {

        test('2.5 test', async() => {
            const acronym = 'CSJ';
            await activitiesPage.viewFinalizedActivity(acronym);
            const activityViewPage = new ActivityViewPage(activitiesPage.page);
            const answers = await activityViewPage.extractAnswers();
            await activityViewPage.goBackAndWaitLoad();
            expect(Object.values(answers).length).not.toBe(0);
        });

    }),

    xdescribe('Scenario #2.2: Fill and View activity', () => {

        function checkAnswer(readedAnswer, expectedAnswer, questionNumber){
            const expectedAnswerIsMultiple = (expectedAnswer.type === ActivityQuestionAnswer.dataTypes.multipleOption);
            try{
                expect(readedAnswer.isMultiple).toBe(expectedAnswerIsMultiple);
            }
            catch (e) {
                errorLogger.addFailMessageFromCurrSpec(`Answer types for question ${questionNumber} don\'t match: 
                    readAnswer isMultiple = ${readedAnswer.isMultiple}, expected = ${expectedAnswer.type}`);
            }

            try{
                expect(readedAnswer.value).toBe(expectedAnswer.value);
            }
            catch (e) {
                errorLogger.addFailMessageFromCurrSpec(`Answer values for question ${questionNumber} don\'t match: 
                    readAnswer =  ${readedAnswer.value}, expected = ${expectedAnswer.value}`);
            }
        }

        test('2.3 test', async() => {
            const acronym = 'CSJ';
            const answersArr = [];
            for (let i = 1; i <= 6 ; i++) {
                answersArr.push(new ActivityQuestionAnswer(ActivityQuestionAnswer.dataTypes.singleOption, 'Sim'))
            }
            answersArr.push(new ActivityQuestionAnswer(ActivityQuestionAnswer.dataTypes.time, '18:54'));
            answersArr.push(new ActivityQuestionAnswer(ActivityQuestionAnswer.dataTypes.time, '18:55'));
            answersArr.push(new ActivityQuestionAnswer(ActivityQuestionAnswer.dataTypes.multipleOption, 'Veia de difícil acesso'));

            // Fill
            await activitiesPage.selectActivityAndClickOnFillButton(acronym, 0);
            const previewPage = new PreviewPage(activitiesPage.page);
            await previewPage.fillActivityQuestions(answersArr);

            // View
            await activitiesPage.init();
            await activitiesPage.viewFinalizedActivity(acronym);
            const activityViewPage = new ActivityViewPage(activitiesPage.page);
            const readedAnswer = Object.values(await activityViewPage.extractAnswers());
            await activityViewPage.goBackAndWaitLoad();

            try{
                expect(readedAnswer.length).toBe(answersArr.length);
            }
            catch (e) {
                errorLogger.addFailMessageFromCurrSpec(`Answers quantity don\'t match: 
                    readedAnswers =  ${readedAnswer.length}, expectedAnswers = ${answersArr.length}`);
            }

            for (let i = 0; i < answersArr.length ; i++) {
                const expectedAnswer = answersArr[i];
                const readAnswer = readedAnswer[i];
                checkAnswer(readAnswer, expectedAnswer, i+1);
            }
        });

    }),

    describe('Scenario #2.6 - Delete activity', () => {

        test('2.6 test', async() => {
            const acronym = 'CSJ';
            const index = 2;
            let activitiesDataBefore = await activitiesPage.extractAllActivitiesData();
            // console.log(activitiesDataBefore.map(obj => obj.category));

            activitiesDataBefore = activitiesDataBefore.slice(0, index)
                .concat(activitiesDataBefore.slice(index+1, activitiesDataBefore.length));
            // console.log(activitiesDataBefore.map(obj => obj.category));

            await activitiesPage.deleteActivity(acronym, index);
            await activitiesPage.refreshAndWaitLoad(); // to clear search filter

            const activitiesDataAfter = await activitiesPage.extractAllActivitiesData();

            // console.log(activitiesDataAfter.map(obj => obj.category));

            expect(activitiesDataAfter.length).toBe(activitiesDataBefore.length);

            for (let i = 0; i < activitiesDataAfter.length; i++) {
                expect(activitiesDataAfter[i]).toBe(activitiesDataBefore[i]);
            }
        });

    }),
/*
    xdescribe('Scenario #2.4: Load report', () => {

        xtest('2.4a Load report of activity with block issues', async() => {

        });

        xtest('2.4b Load report of activity with issues that not block', async() => {

        });

        xtest('2.4c Load report of activity with no issues', async() => {

        });
    }),

    xdescribe('Scenario #2.7 - Details right sidenav', () => {

        test('2.7 test', async() => {

        });

    }),

    xdescribe('Scenario #2.8 - Search with filter', () => {

        test('2.8 test', async() => {

        });

    }),

    xdescribe('Scenario #2.9 - View by blocks', () => {

        test('2.9 test', async() => {

        });

    })
*/
]; // end suiteArray
