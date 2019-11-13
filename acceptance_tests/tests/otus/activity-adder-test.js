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
/*
    //<< clicar no botao +
    await pageOtus.gotoUrl("http://localhost:3000/#/participant-dashboard/activity-adder");
    await pageOtus.waitLoad();
    //.

    activitiyAdderPage = new ActivityAdderPage(pageOtus.page);
    await activitiyAdderPage.init();

 */
}

// *****************************************************************
// Tests

/*
add 1 por 1, de tipos diferentes
add lista do mesmo tipo
excluir do array => verificar se a lista de atividades nao tem a excluída
salvar => vai para tela de atividades
cancelar => reset todos os controladores para os valores default
 */

suiteArray = [

    describe('Temp Tests', () => {

        test('Select switches', async() => {
            await activitiyAdderPage.switchTypeToPaper();
            await activitiyAdderPage.waitForMilliseconds(2000);
            await activitiyAdderPage.switchTypeToOnline();
            await activitiyAdderPage.waitForMilliseconds(2000);

            await activitiyAdderPage.switchQuantityToUnit();
            await activitiyAdderPage.waitForMilliseconds(2000);
            await activitiyAdderPage.switchQuantityToList();
            await activitiyAdderPage.waitForMilliseconds(2000);
        });

        xtest('Select categories', async() => {
            await activitiyAdderPage.selectCategory(categoryEnum.QUALITY_CONTROLL);
            await activitiyAdderPage.waitForMilliseconds(3000);
        });

        xtest('Search and choose activity', async() => {
            await activitiyAdderPage.waitForMilliseconds(3000);
            await activitiyAdderPage.searchActivity("MARAVILHA");
            await activitiyAdderPage.waitForMilliseconds(3000);
        });

        xtest('Add activities', async() => {

            const acronyms = ["CS", "RETCLQ", "DSN"];

            for(let acronym of acronyms){
                await activitiyAdderPage.addActivity(acronym);
            }

            await activitiyAdderPage.waitForMilliseconds(2000);
            //await activitiyAdderPage.deleteActivityFromTemporaryList(1);
            //await activitiyAdderPage.saveChanges();
            await activitiyAdderPage.waitForMilliseconds(2000);
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
