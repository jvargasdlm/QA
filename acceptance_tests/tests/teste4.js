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
            await pageOtus.clickWithWait("button[ng-if='attrs.showParticipantsButton']");
            await pageOtus.waitForMilliseconds(2000);
            await pageOtus.clickWithWait("button[class='md-button md-icon-button md-primary md-raised md-button md-default-theme md-ink-ripple']");
            await pageOtus.typeWithWait("input[ng-model='$ctrl.participant.name']", "asdf");
            await pageOtus.waitForMilliseconds(2000);
            await pageOtus.clickWithWait("md-select[ng-model='$ctrl.participant.sex']");
            await pageOtus.waitForMilliseconds(2000);
            await pageOtus.clickWithWait("md-option[value='M']");
            await pageOtus.waitForMilliseconds(2000);

            // async init(index=0);{
            //     await this.initByAttributeSelector("input[aria-label='Data de Nascimento']", index);
            // }

            // await pageOtus.clickWithWait("input[placeholder='Data de Nascimento']");
            // await pageOtus.waitForMilliseconds(2000);
            // await pageOtus.clickWithWait("md-menu[md-offset='8 10']");
            // await pageOtus.waitForMilliseconds(2000);
            // await pageOtus.clickWithWait("button[ng-click='picker.selectMonth(itemMonth)']");
            // await pageOtus.waitForMilliseconds(2000);
            // await pageOtus.clickWithWait("button[ng-click='picker.ok()']");
            // await pageOtus.waitForMilliseconds(2000);
            // await pageOtus.clickWithWait("md-select[ng-model='$ctrl.centerFilter']");
            // await pageOtus.waitForMilliseconds(8000);
            // await pageOtus.clickWithWait("md-option[value='RS']");
            // await pageOtus.waitForMilliseconds(2000);
            // await pageOtus.clickWithWait("button[ng-click='$ctrl.saveParticipant()']");
            // await pageOtus.waitForMilliseconds(2000);
            // await pageOtus.clickWithWait("button[ng-click='button.action({textInputFill:$ctrl.textInputFill, dropDownSelected:$ctrl.dropDownSelected})']")
            // await pageOtus.waitForMilliseconds(3000);
            // await pageOtus.clickWithWait("button[ng-click='dialog.hide()']");
            // await pageOtus.waitForMilliseconds(3000);
            // await pageOtus.clickWithWait("button[ng-click='$ctrl.listParticipants()']");
            // await pageOtus.waitForMilliseconds(3000);













        });

        test('Test 2', async (index=0) => {
            await this.initByAttributeSelector("input[aria-label='Data de Nascimento']", index);
        }
    })

];
