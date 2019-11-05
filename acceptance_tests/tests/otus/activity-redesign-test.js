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
const ActivitiesPage          = require('../../code/otus/classes/ActivitiesPage');
const ActivityQuestionAnswer  = require('../../code/otus/classes/ActivityQuestionAnswer');

// Constants
const recruitmentNumberOrName = '5001007';
const acronym = 'ACTA';
const answerDataTypes = ActivityQuestionAnswer.dataTypes;

// *****************************************************************
// Auxiliar functions

async function openParticipantActivities(){
    await pageOtus.openParticipantFromHomePage(recruitmentNumberOrName);
    await pageOtus.openParticipantActivitiesMenu();
    activitiesPage = new ActivitiesPage(pageOtus.page);
}

// *****************************************************************
// Tests

suiteArray = [

    xdescribe('Temp Test', () => {

        xtest('Temp test', async() => {

        });

    }),

    xdescribe('Scenario #2.1 - Activity selection', () => {

        async function checkReportButtonIsHidden(firstActivityCheckboxIndex, secondActivityCheckboxIndex){
            await activitiesPage.selectActivityCheckbox(firstActivityCheckboxIndex);
            await activitiesPage.init();
            await activitiesPage.selectActivityCheckbox(secondActivityCheckboxIndex);
            const isHidden = await activitiesPage.reportButton.isHidden();
            try {
                expect(isHidden).toBeTrue();
            }
            catch (e) {
                errorLogger.addFailMessageFromCurrSpec(`Report button should be hidden, but does not.`);
            }
        }

        test('2.1a Select 0 activities', async() => {
            await checkReportButtonIsHidden(0, 0); // select and unselect
        });

        test('2.1b Select 2 activities', async() => {
            await checkReportButtonIsHidden(0, 1);
        });

        test('2.1c Select 1 activitiy', async() => {
            await activitiesPage.selectActivityCheckbox(1);
            await activitiesPage.init();
            const isHidden = await activitiesPage.reportButton.isHidden();
            try {
                expect(isHidden).toBeFalse();
            }
            catch (e) {
                errorLogger.addFailMessageFromCurrSpec(`Report button should be visible, but does not.`);
            }
        });
    }),

    describe('Scenario #2.2: Add new activity', () => {

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

        xtest('2.3 test', async() => {

            await activitiesPage.fillActivity(acronym, answersArr);
        });

    }),

    xdescribe('Scenario #2.5 - View activity', () => {

        test('2.5 test', async() => {
            // use the same activity filled at 2.3 to compare answers
            const answers = await activitiesPage.readFinalizedActivity(acronym);
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

]; // end suiteArray
