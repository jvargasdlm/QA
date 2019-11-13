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


    describe('Scenario #2.1 - Activity selection', () => {

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

        xtest('2.1a Select 0 activities', async() => {
            await activitiesPage.selectActivityItem(0);
            await activitiesPage.selectActivityItem(0);
            await checkVisibilityOfActivityButtons([]);
        });

        xtest('2.1b Select 2 activities', async() => {
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
/*
    xdescribe('Scenario #2.2: Add new activity', () => {

        test('2.2 test', async() => {
            await activitiesPage.addOnlineActivity(acronym);
            try {
                await activitiesPage.searchAndSelectActivity(acronym); //add log already
                expect(true).toBeTrue();
            }
            catch (e) {
                expect(false).toBeTrue();
            }
        });

    }),

    xdescribe('Scenario #2.3: Fill activity', () => {

        test('2.3 test', async() => {
            const acronym = 'CSJ';
            const answersArr = [];
            for (let i = 1; i <= 6 ; i++) {
                answersArr.push(new ActivityQuestionAnswer(ActivityQuestionAnswer.dataTypes.singleOption, 'Sim'))
            }
            answersArr.push(new ActivityQuestionAnswer(ActivityQuestionAnswer.dataTypes.time, '18:54'));
            answersArr.push(new ActivityQuestionAnswer(ActivityQuestionAnswer.dataTypes.time, '18:55'));
            answersArr.push(new ActivityQuestionAnswer(ActivityQuestionAnswer.dataTypes.multipleOption, 'Formação de hematoma'));

            await activitiesPage.selectActivityAndClickOnFillButton(acronym, 1);
            const previewPage = new PreviewPage(activitiesPage.page);
            await previewPage.fillActivityQuestions(answersArr);
        });

    }),

    describe('Scenario #2.5 - View activity', () => {

        test('2.5 test', async() => {
            // use the same activity filled at 2.3 to compare answers
            const acronym = 'CSJ';
            const answers = await activitiesPage.readFinalizedActivity(acronym);
            console.log(answers);
        });

    }),

    xdescribe('Scenario #2.6 - Delete activity', () => {

        test('2.6 test', async() => {
            // use the same activity filled at 2.3 to clean data
            await activitiesPage.deleteActivity(acronym);
        });

    }),

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
