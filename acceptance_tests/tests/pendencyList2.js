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



const ActivityQuestionAnswer = require('../code/otus/classes/activities/ActivityQuestionAnswer')
const PreviewPage = require('../code/otus/classes/PreviewPage')

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
            var button = await pageOtus.page.$$("button[ng-click='$ctrl.loadActivityPlayer(item.activityInfo.recruitmentNumber, item.activityId)']"); //seleciona tadas as atividades
            await button[1].click();/*escolhe a segunda atividade*/
            await pageOtus.waitForMilliseconds(1000);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.play()']");//clica em iniciar
            await pageOtus.waitForMilliseconds(1000);
            await pageOtus.typeWithWait("textarea[placeholder='Digite o texto aqui']", "Não");
            await pageOtus.waitForMilliseconds(3000);
            var buttonAvancar = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            await buttonAvancar[1].click();//clica em avançar
            await pageOtus.waitForMilliseconds(3000);
            await pageOtus.clickWithWait("md-tab-item[tabindex='0']");
            await pageOtus.waitForMilliseconds(3000);















        });


    })

];