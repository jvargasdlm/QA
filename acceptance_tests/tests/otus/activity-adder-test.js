const lib = require('../../code/otus/lib');

let browser, suiteArray=[], errorLogger;        // for all tests
let pageOtus, selectors;                        // only for otus tests
let activitiyAdderPage;

beforeAll(async () => {
    [browser, pageOtus, errorLogger, selectors] = await lib.doBeforeAll(suiteArray);
    await openParticipantActivities();
});

beforeEach(async () => {
    console.log('RUNNING TEST\n', errorLogger.currSpecName);
});

afterEach(async () => {
    errorLogger.advanceToNextSpec();
    //await activitiyAdderPage.refreshAndWaitLoad();
    await pageOtus.waitForMilliseconds(5000);//.
});

afterAll(async () => {
    await errorLogger.exportTestResultLog();
    await browser.close();
});

// *****************************************************************
// Specific modules for this suite test
const ActivitiesPage          = require('../../code/otus/classes/activities/ActivitiesPage');
const ActivityAdderPage       = require('../../code/otus/classes/activities/ActivityAdderPage');

// Constants
const categoryEnum = ActivityAdderPage.categoryEnum;
const recruitmentNumberOrName = '5001007';

// *****************************************************************
// Auxiliar functions

async function openParticipantActivities(){
    await pageOtus.openParticipantFromHomePage(recruitmentNumberOrName);
    await pageOtus.openParticipantActivitiesMenu();

    //<< clicar no botao +
    await pageOtus.gotoUrl("http://localhost:3000/#/participant-dashboard/activity-adder");
    await pageOtus.waitLoad();
    //.

    activitiyAdderPage = new ActivityAdderPage(pageOtus.page);
    await activitiyAdderPage.init();
}

// *****************************************************************
// Tests

suiteArray = [

    describe('Temp Test', () => {

        xtest('Switch test', async() => {
            await pageOtus.gotoUrl("http://localhost:3000/#/participant-dashboard/activity-adder");

            const activityTypeSwitch = pageOtus.getNewSwitch();
            const activitySelectionSwitch = pageOtus.getNewSwitch();

            await activityTypeSwitch.init("[aria-label='ActivityType']");
            await activitySelectionSwitch.init("[aria-label='ActivitySelection']");

            console.log("activityTypeSwitch isOn?", activityTypeSwitch.isOn);
            console.log("activitySelectionSwitch isOn?", activitySelectionSwitch.isOn);

            await pageOtus.waitForMilliseconds(5000);

            await activityTypeSwitch.change();
            await activitySelectionSwitch.change();

            console.log("activityTypeSwitch isOn?", activityTypeSwitch.isOn);
            console.log("activitySelectionSwitch isOn?", activitySelectionSwitch.isOn);

            await pageOtus.waitForMilliseconds(5000);
        });

        test('Switch test 2', async() => {
            /*
            await activitiyAdderPage.switchTypeToOnline();
            await activitiyAdderPage.switchTypeToPaper();
            await pageOtus.waitForMilliseconds(3000);

            await activitiyAdderPage.selectCategory(categoryEnum.QUALITY_CONTROLL);
            await pageOtus.waitForMilliseconds(3000);
*/
            await pageOtus.waitForMilliseconds(3000);
            await activitiyAdderPage.searchActivity("MARAVILHA");
            await pageOtus.waitForMilliseconds(3000);
        });

    }),

    /*
    xdescribe('Scenario #2.2: Add new activity', () => {

        test('2.2 test', async() => {
            await activitiyAdderPage.addOnlineActivity(acronym);
            try {
                await activitiyAdderPage.searchAndSelectActivity(acronym); //add log already
                expect(true).toBeTrue();
            }
            catch (e) {
                expect(false).toBeTrue();
            }
        });

    }),
*/

]; // end suiteArray
