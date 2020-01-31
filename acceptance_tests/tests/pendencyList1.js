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

        test('Test expect FAIL', async () => {
            let x = 1;
            expect(x).toBe(0);
        });


        xtest('Test 1', async () => {
            await pageOtus.waitForMilliseconds(3000);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.loadActivityViewer(item.activityInfo.recruitmentNumber, item.activityId)']");
            await pageOtus.waitForMilliseconds(3000);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.exit()']");
            await pageOtus.waitForMilliseconds(3000);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.loadActivityPlayer(item.activityInfo.recruitmentNumber, item.activityId)']");
            await pageOtus.waitForMilliseconds(3000);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.stop()']");
            await pageOtus.waitForMilliseconds(3000);





        });

    })

];
