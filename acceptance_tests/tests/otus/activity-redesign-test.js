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

// Constants
const recruitmentNumberOrName = '5001007';
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

    describe('Temp Test', () => {

        test('Temp test', async() => {

        });

    }),

    xdescribe('Scenario #2.1 - Activity selection', () => {

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
            await activitiesPage.selectActivityCheckbox(0);
            await activitiesPage.selectActivityCheckbox(0);
            await ActivityButtonsAreHidden();
        });

        test('2.1b Select 2 activities', async() => {
            await activitiesPage.selectActivityCheckbox(0);
            await activitiesPage.selectActivityCheckbox(1);
            await ActivityButtonsAreHidden();
            await activitiesPage.refreshAndWaitLoad();
        });

        test('2.1c Select 1 activitiy', async() => {
            await activitiesPage.selectActivityCheckbox(1);
            await ActivityButtonsAreHidden(false, 'Activity buttons should be visible, but do not.');
            await activitiesPage.refreshAndWaitLoad();
        });
    }),

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
            await activitiesPage.fillActivity(acronym, answersArr);
        });

    }),

    xdescribe('Scenario #2.5 - View activity', () => {

        test('2.5 test', async() => {
            // use the same activity filled at 2.3 to compare answers
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
