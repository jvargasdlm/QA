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
    await activitiesPage.refreshAndWaitLoad();
    //await pageOtus.waitForMilliseconds(5000);//.
});

afterAll(async () => {
    await errorLogger.exportTestResultLog();
    await browser.close();
});

// *****************************************************************
// Specific modules for this suite test
const ActivitiesPage          = require('../../code/otus/classes/activities/ActivitiesPage');
const ActivityQuestionAnswer  = require('../../code/otus/classes/activities/ActivityQuestionAnswer');
const ActivityViewPage        = require('../../code/otus/classes/activities/ActivityViewPage');
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

    xdescribe('Scenario #2.1 - Activity selection', () => {

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
        }

        test('2.1a Select 0 activities', async() => {
            await activitiesPage.selectActivityItem(0);
            await activitiesPage.selectActivityItem(0);
            await checkVisibilityOfActivityButtons([]);
        });

        test('2.1b Select 2 activities', async() => {
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

    xdescribe('Scenario #2.5 - View activity', () => {

        test('2.5 test', async() => {
            const acronym = 'CSJ';
            await activitiesPage.viewFinalizedActivity(acronym);
            const activityViewPage = new ActivityViewPage(activitiesPage.page);
            const answers = await activityViewPage.extractAnswers();
            await activityViewPage.goBackAndWaitLoad();
            expect(Object.values(answers).length).not.toBe(0);
        });

    }),

    xdescribe('Scenario #2.2: Fill and View activity', () => {

        function checkAnswer(readedAnswer, expectedAnswer, questionNumber){
            const expectedAnswerIsMultiple = (expectedAnswer.type === ActivityQuestionAnswer.dataTypes.multipleOption);
            try{
                expect(readedAnswer.isMultiple).toBe(expectedAnswerIsMultiple);
            }
            catch (e) {
                errorLogger.addFailMessageFromCurrSpec(`Answer types for question ${questionNumber} don\'t match: 
                    readAnswer isMultiple = ${readedAnswer.isMultiple}, expected = ${expectedAnswer.type}`);
            }

            try{
                expect(readedAnswer.value).toBe(expectedAnswer.value);
            }
            catch (e) {
                errorLogger.addFailMessageFromCurrSpec(`Answer values for question ${questionNumber} don\'t match: 
                    readAnswer =  ${readedAnswer.value}, expected = ${expectedAnswer.value}`);
            }
        }

        test('2.2 Test', async() => {
            const acronym = 'CSJ';
            const answersArr = [];
            for (let i = 1; i <= 6 ; i++) {
                answersArr.push(new ActivityQuestionAnswer(ActivityQuestionAnswer.dataTypes.singleOption, 'Sim'))
            }
            answersArr.push(new ActivityQuestionAnswer(ActivityQuestionAnswer.dataTypes.time, '18:54'));
            answersArr.push(new ActivityQuestionAnswer(ActivityQuestionAnswer.dataTypes.time, '18:55'));
            answersArr.push(new ActivityQuestionAnswer(ActivityQuestionAnswer.dataTypes.multipleOption, 'Veia de difícil acesso'));

            // Fill
            await activitiesPage.selectActivityAndClickOnFillButton(acronym, 0);
            const previewPage = new PreviewPage(activitiesPage.page);
            await previewPage.fillActivityQuestions(answersArr);

            // View
            await activitiesPage.init();
            await activitiesPage.viewFinalizedActivity(acronym);
            const activityViewPage = new ActivityViewPage(activitiesPage.page);
            const readedAnswer = Object.values(await activityViewPage.extractAnswers());
            await activityViewPage.goBackAndWaitLoad();

            try{
                expect(readedAnswer.length).toBe(answersArr.length);
            }
            catch (e) {
                errorLogger.addFailMessageFromCurrSpec(`Answers quantity don\'t match: 
                    readedAnswers =  ${readedAnswer.length}, expectedAnswers = ${answersArr.length}`);
            }

            for (let i = 0; i < answersArr.length ; i++) {
                const expectedAnswer = answersArr[i];
                const readAnswer = readedAnswer[i];
                checkAnswer(readAnswer, expectedAnswer, i+1);
            }
        });

    }),

    xdescribe('Scenario #2.6 - Delete activity', () => {

        test('2.6 test', async() => {
            const acronym = 'CSJ';
            const index = 1;
            let activitiesDataBefore = await activitiesPage.extractAllActivitiesData();
            // console.log(activitiesDataBefore.map(obj => obj.category));

            activitiesDataBefore = activitiesDataBefore.slice(0, index)
                .concat(activitiesDataBefore.slice(index+1, activitiesDataBefore.length));
            // console.log(activitiesDataBefore.map(obj => obj.category));

            await activitiesPage.deleteActivity(acronym, index);

            const activitiesDataAfter = await activitiesPage.extractAllActivitiesData();

            // console.log(activitiesDataAfter.map(obj => obj.category));

            expect(activitiesDataAfter.length).toBe(activitiesDataBefore.length);

            for (let i = 0; i < activitiesDataAfter.length; i++) {
                expect(activitiesDataAfter[i]).toBe(activitiesDataBefore[i]);
            }
        });

    }),

    xdescribe('Scenario #2.7 - Details right sidenav', () => {

        test('2.7 test', async() => {
            const acronym = 'CSJ';
            await activitiesPage.openDetails(acronym);
            const content = await activitiesPage.page.evaluate((id) => {
                const elem = document.body.querySelector('#'+id);
                return elem.innerText;
            }, activitiesPage.detailsSidenav.id);
            expect(content.includes(acronym)).toBeTrue();
        });

    }),

    xdescribe('Scenario #2.8 - Search Filter and Select All', () => {

        test('2.8a Search Filter', async() => {
            const acronym = 'CSJ';
            const numActivitiesBefore = await activitiesPage.countActivities();
            await activitiesPage.searchAndSelectActivity(acronym);
            const activitiesDataAfter = await activitiesPage.extractAllActivitiesData();
            const numActivitiesAfter = activitiesDataAfter.length;

            let failMessage = `Filtered activities quantity (${numActivitiesAfter}) should be < activities total (${numActivitiesBefore}), but is not.`;
            try{
                expect(numActivitiesAfter).toBeLessThan(numActivitiesBefore);

                failMessage = "There is at least one filtered activity whose acronym is not wanted.";

                for (let i = 0; i < activitiesDataAfter.length; i++) {
                    expect(activitiesDataAfter[i].acronym).toBe(acronym);
                }
            }
            catch (e) {
                errorLogger.addFailMessageFromCurrSpec(failMessage);
            }
        });

        test('2.8b Select All', async() => {
            const numActivities = await activitiesPage.countActivities();
            await activitiesPage.allActivitiesCheckbox.click();

            let notSelectedAcronyms = [];
            for (let i = 0; i < numActivities; i++) {
                let activityItem = await activitiesPage.getActivityItemInstance(i);
                let isSelected = await activityItem.isSelected();
                if(!isSelected){
                    await activityItem.extractData();
                    notSelectedAcronyms.push({acronym: activityItem.acronym, index: i});
                    console.log({acronym: activityItem.acronym, index: i});//.
                }
            }

            try{
                expect(notSelectedAcronyms.length).toBe(0);
            }
            catch (e) {
                errorLogger.addFailMessageFromCurrSpec("Select all activities checkbox doesn't select all. " +
                    "Unselected activities: ", notSelectedAcronyms);
            }
        });

    }),

    xdescribe('Scenario #2.9 - View by blocks', () => {

        test('2.9 Select specific block', async() => {
            const groupName = 'Grupo 1';
            const groupAcronyms = ['CSJ'];
            // await activitiesPage.selectAllBlocks();
            // await activitiesPage.waitForMilliseconds(5000);
            //
            // await activitiesPage.selectAllBlocks();
            // await activitiesPage.waitForMilliseconds(500);

            const numActivitiesBefore = await activitiesPage.countActivities();

            await activitiesPage.blockSelector.selectOption(groupName);

            const activitiesDataAfter = await activitiesPage.extractAllActivitiesData();
            const numActivitiesAfter = activitiesDataAfter.length;

            let failMessage = `Filtered activities quantity (${numActivitiesAfter}) should be < activities total (${numActivitiesBefore}), but is not.`;
            try{
                expect(numActivitiesAfter).toBeLessThan(numActivitiesBefore);

                failMessage = "There is at least one filtered activity whose acronym is not wanted.";

                for (let i = 0; i < activitiesDataAfter.length; i++) {
                    expect(groupAcronyms.includes(activitiesDataAfter[i].acronym)).toBeTrue();
                }
            }
            catch (e) {
                errorLogger.addFailMessageFromCurrSpec(failMessage);
            }
        });

        test('2.9b Select All', async() => {
            // await activitiesPage.selectAllBlocks();
        });

    })

]; // end suiteArray
