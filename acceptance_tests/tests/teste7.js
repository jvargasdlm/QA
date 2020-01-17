const lib = require ('../code/otus/lib');

let browser, pageOtus, selectors;
let suiteArray = [], errorLogger;
const PageElement = require('../code/classes/PageElement');


beforeAll(async () => {
    [browser, pageOtus, errorLogger, selectors] = await lib.doBeforeAll(suiteArray);
});

beforeEach(async () => {
    console.log('RUNNING TEST\n', errorLogger.currSpecName);
});

afterEach(async () => {
    errorLogger.advanceToNextSpec();
});

afterAll(async () => {
    await errorLogger.exportTestResultLog();
    await browser.close();

});



const ActivityQuestionAnswer = require('../code/otus/classes/activities/ActivityQuestionAnswer');
const PreviewPage = require('../code/otus/classes/PreviewPage');
const Button = require('../code/classes/Button');
const InputField = require('../code/classes/InputField');


suiteArray = [


    describe('Test Suite A', () => {

        xtest('Test expect PASS', async () => {
            let x = 1;
            expect(x).toBe(1);
        });

        xtest('Test expect FAIL', async () => {
            let x = 1;
            expect(x).toBe(0);
        });


        test('Test 1', async () => {
            await pageOtus.waitForMilliseconds(2000);
            await pageOtus.clickWithWait("button[ng-if='attrs.showParticipantsButton']"); //exibe os todos
            await pageOtus.waitLoad();
            var button = await pageOtus.page.$$("button[aria-label='Ver participante']"); //seleciona todos participante
            await button[0].click();/*escolhe o primeiro participante*/
            await pageOtus.waitForMilliseconds(3000);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.launchSidenav()']"); //seleciona otus projeto
            await pageOtus.waitForMilliseconds(3000);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.loadParticipantActivities()']");//seleciona atividades
            await pageOtus.waitForMilliseconds(3000);
            var mdGrideTiler = await pageOtus.page.$$("md-grid-tile-header[ng-style='activity.actions.colorGrid']"); //seleciona tadas as atividades
            await mdGrideTiler[1].click();/*escolhe a segunda atividade*/
            await pageOtus.waitForMilliseconds(3000);
            await pageOtus.clickWithWait("button[aria-label='Gerenciador de Pendência']");
            await pageOtus.waitForMilliseconds(3000);
            await pageOtus.clickWithWait("button[ng-click='vm.deleteUserActivityPendency()']");
            await pageOtus.waitForMilliseconds(3000);


        });

    })

];

