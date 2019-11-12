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
            await activityItem.extractInfo();
            console.log(activityItem.data);

            // await activitiesPage.sortActivitiesByOptionIndex(1);
            // await activitiesPage.selectAllBlocks();
            // await activitiesPage.waitForMilliseconds(5000);

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
        });

    }),

/*
    describe('Scenario #2.1 - Activity selection', () => {

        async function ActivityButtonsAreHidden(expectedHidden=true, failMessage='Activity buttons should be hidden, but do not.'){
            await activitiesPage.waitForMilliseconds(500);

            // temp
            const isHidden = await activitiesPage.page.evaluate(() => {
                const buttonElem = document.querySelector("button[aria-label='Preencher Atividade']");
                return (buttonElem.getAttribute("aria-hidden") === "true");
            });

            try {
                expect(isHidden).toBe(expectedHidden);
            }
            catch (e) {
                errorLogger.addFailMessageFromCurrSpec(failMessage);
            }
        }

        test('2.1a Select 0 activities', async() => {
            await activitiesPage.selectActivityItem(0);
            await activitiesPage.selectActivityItem(0);
            await ActivityButtonsAreHidden();
        });

        test('2.1b Select 2 activities', async() => {
            await activitiesPage.selectActivityItem(0);
            await activitiesPage.selectActivityItem(1);
            await ActivityButtonsAreHidden();
            await activitiesPage.refreshAndWaitLoad();
        });

        test('2.1c Select 1 activitiy', async() => {
            await activitiesPage.selectActivityItem(1);
            await ActivityButtonsAreHidden(false, 'Activity buttons should be visible, but do not.');
            await activitiesPage.refreshAndWaitLoad();
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
