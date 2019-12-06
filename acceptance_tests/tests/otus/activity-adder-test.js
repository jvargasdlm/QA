const lib = require('../../code/otus/lib');

let browser, suiteArray=[], errorLogger;        // for all tests
let pageOtus, selectors;                        // only for otus tests
let activitiyAdderPage, activitiesPage;
let activitiesDataBefore = {};

beforeAll(async () => {
    [browser, pageOtus, errorLogger, selectors] = await lib.doBeforeAll(suiteArray);
    lib.setTestTimeoutSeconds(90);
    await openParticipantActivities();
});

beforeEach(async () => {
    console.log('RUNNING TEST\n', errorLogger.currSpecName);
    await getCurrActivityDataAndGoToAdderPage();
});

afterEach(async () => {
    errorLogger.advanceToNextSpec();
    await goToActivityPage();
});

afterAll(async () => {
    await errorLogger.exportTestResultLog();
    await browser.close();
});

// *****************************************************************
// Specific modules for this suite test
const ActivitiesPage                = require('../../code/otus/classes/activities/ActivitiesPage');
const ActivityAdditionPage          = require('../../code/otus/classes/activities/ActivityAdditionPage');
const ActivityAdditionItem          = require('../../code/otus/classes/activities/ActivityAdditionItem');
const ActivityAdditionItemPaper     = require('../../code/otus/classes/activities/ActivityAdditionItemPaper');

// Constants
const enums = ActivityAdditionPage.enums;
const withActivities = true;
const recruitmentNumber = (withActivities? '5001007' : '5001184');
let activityPageUrl = '';

// *****************************************************************
// Auxiliar functions

async function openParticipantActivities(){
    await pageOtus.openParticipantFromHomePage(recruitmentNumber);
    await pageOtus.openParticipantActivitiesMenu();
    activityPageUrl = pageOtus.page.url();
}

async function goToActivityPage(){
    await pageOtus.gotoUrlAndWaitLoad(activityPageUrl);
    await pageOtus.refreshAndWaitLoad();
}

async function getCurrActivityDataAndGoToAdderPage(){
    activitiesPage = new ActivitiesPage(pageOtus.page);
    await activitiesPage.init();
    activitiesDataBefore = await activitiesPage.extractAllActivitiesData();
    await activitiesPage.pressAddActivityButton();
    await activitiesPage.waitLoad();

    activitiyAdderPage = new ActivityAdditionPage(pageOtus.page);
    await activitiyAdderPage.init();
}

async function checkActivityItemsIsClear(){
    const numActivities = await activitiyAdderPage.countActivities();
    try {
        expect(numActivities).toBe(0);
    }
    catch (e) {
        errorLogger.addFailMessageFromCurrSpec(`Activity adder page should be 0 items as begin, but has ${numActivities}`);
    }
}

async function addActivitiesUnitary(activitiesDataToAdd){
    const classDict = {};
    classDict[enums.type.ON_LINE] = ActivityAdditionItem;
    classDict[enums.type.PAPER] = ActivityAdditionItemPaper;

    await activitiyAdderPage.switchQuantityToUnit();

    let i;
    try {
        for (i=0; i < activitiesDataToAdd.length; i++) {
            let data = activitiesDataToAdd[i];
            await activitiyAdderPage.switchTypeTo(data.type);
            await activitiyAdderPage.selectCategory(data.category);
            await activitiyAdderPage.addActivity(data.acronym, classDict[data.type]);
        }
        await activitiyAdderPage.initItems();
    }
    catch (e) {
        throw `Error at activity index=${i} addition: ${e}`;
    }
}

async function addActivitiesUnitaryAndFill(activitiesDataToAdd, notInsertPaperDataInIndexes=[], notInsertExternalIdInIndexes=[]){
    let i, index = 0;
    try {
        await addActivitiesUnitary(activitiesDataToAdd);

        for (i = activitiesDataToAdd.length-1; i >= 0 ; i--) {
            let data = activitiesDataToAdd[i];
            let activityItem = activitiyAdderPage.activityAddItems[index++];
            if (!notInsertPaperDataInIndexes.includes(i) && data.type === enums.type.PAPER) {
                await activityItem.insertPaperExclusiveData(data.realizationDate, data.inspectorName);
            }
            if (!notInsertExternalIdInIndexes.includes(i) && data.externalId) {
                await activityItem.insertExternalId(data.externalId);
            }
        }
    }
    catch (e) {
        throw `Error at activity index=${i} fill: ${e}`;
    }
}

async function checkAddition(addedActivitiesData){

    function dateToString(date){
        try{
            return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
        }
        catch (e) { // date is string
            if(!date){
                return '';
            }
            return date;
        }
    }

    function filterDataToCheck(activityData){
        return {
            acronym: activityData.acronym,
            type: activityData.type,
            category: activityData.category,
            realizationDate: dateToString(activityData.realizationDate)
        };
    }

    function filterAddedDataToCheck(activityData){
        return {
            acronym: activityData.acronym,
            type: (activityData.type === enums.type.ON_LINE ?
                ActivityAdditionItem.typeEnum.ON_LINE :
                ActivityAdditionItem.typeEnum.PAPER),
            category: (activityData.category instanceof Object? activityData.category.value.toUpperCase() : activityData.category),
            realizationDate: dateToString(activityData.realizationDate)
        };
    }

    function myIndexOf(array, obj) {
        let diffLog = [];
        for (let i = 0; i < array.length; i++) {
            const sameAcronym = (array[i].acronym === obj.acronym);
            const sameType = (array[i].type === obj.type);
            const sameCategory = (array[i].category.value === obj.category.value);
            const sameDate = (array[i].realizationDate === obj.realizationDate);
            if (sameAcronym && sameType && sameCategory && sameDate) {
                return i;
            }
            if (sameAcronym && sameDate && sameCategory && !sameType) {
                diffLog.push(`acronym? ${sameAcronym}, type? ${sameType}, category? ${sameCategory}, date? ${sameDate}`);
                console.log(`obj = ${JSON.stringify(obj,null, 4)}\narr[${i}] = ${JSON.stringify(array[i], null, 4)}`);
            }
        }
        if(diffLog.length > 0) {
            console.log(diffLog);
        }
        return -1;
    }

    let numActivitiesToDelete = 0;

    await pageOtus.waitForMilliseconds(500); // wait to load page
    const url = pageOtus.page.url();
    let failMessage = `I should be at activities page, but I'm at url = ${url}`;
    try{
        expect(url).toBe(activityPageUrl);
        await activitiesPage.init();

        failMessage = 'Other';
        let activitiesDataAfter = await activitiesPage.extractAllActivitiesData();
        activitiesDataAfter = activitiesDataAfter.map( data => filterDataToCheck(data));

        failMessage = `The amount of activities after addition (${activitiesDataAfter.length}) is NOT equal to` +
            `the amount of activities already in existence (${activitiesDataBefore.length}) plus the amount of activities added (${addedActivitiesData.length}).`;
        expect(activitiesDataAfter).toBeArrayOfSize(activitiesDataBefore.length + addedActivitiesData.length);

        failMessage = 'Other2';
        addedActivitiesData = addedActivitiesData.map(data => filterAddedDataToCheck(data));

        let conflictData = [];
        for(let data of addedActivitiesData){
            let index = myIndexOf(activitiesDataAfter, data);
            if(index >= 0){
                await activitiesPage.selectActivityItem(index);
                numActivitiesToDelete++;
            }
            else{
                conflictData.push(data);
            }
        }
        failMessage = `At least one of the added activities does NOT appear on the activity page with the same data:\n`
            + JSON.stringify(conflictData);
        expect(conflictData).toBeArrayOfSize(0);
    }
    catch (e) {
        if(failMessage.includes("Other")){
            failMessage = e.toString();
        }
        errorLogger.addFailMessageFromCurrSpec(failMessage);
    }
    finally {
        if(numActivitiesToDelete > 0) {
            await activitiesPage.deleteSelectedActivities();
        }
    }
}

async function addActivitiesUnitaryAndCheck(activitiesDataToAdd){
    await addActivitiesUnitaryAndFill(activitiesDataToAdd);
    await pageOtus.waitForMilliseconds(2500); // wait fill inputs complete
    await activitiyAdderPage.saveChanges();
    await checkAddition(activitiesDataToAdd);
}

async function clickOnSaveButtonAndCheckDialog(){
    await activitiyAdderPage.saveButton.click();
    const dialog = activitiyAdderPage.getNewDialog();
    await dialog.waitForOpen();
    const numActionButtons = dialog.getNumActionButtons();
    await dialog.clickOnCancelButton();
    try{
        expect(numActionButtons).toBe(1);
    }
    catch (e) {
        errorLogger.addFailMessageFromCurrSpec(`Dialog should be has only one action button (CANCEL), but has ${numActionButtons}`);
    }
}

// *****************************************************************
// Data for Tests

function getOnlineActivityDataToAddObj(acronym, category, externalId=null){
    return {
        acronym: acronym,
        type: enums.type.ON_LINE,
        category: category,
        externalId: externalId,
        realizationDate: ''
    }
}

function getPaperActivityDataToAddObj(acronym, category, date, inspectorName, externalId=null){
    return {
        acronym: acronym,
        type: enums.type.PAPER,
        category: category,
        externalId: externalId,
        realizationDate: date,
        inspectorName: inspectorName
    }
}

const activityData = {
    CSJ: {
        online: getOnlineActivityDataToAddObj("CSJ", enums.category.QUALITY_CONTROLL, recruitmentNumber+"001"),
        paper: getPaperActivityDataToAddObj("CSJ", enums.category.REPETITION,
            new Date(2018, 4, 19), "Diogo Ferreira", recruitmentNumber+"002")
    },
    ACTA: {
        online: getOnlineActivityDataToAddObj("ACTA", enums.category.NORMAL),
        paper: getPaperActivityDataToAddObj("ACTA", enums.category.QUALITY_CONTROLL,
            new Date(2018, 6, 3), "Diogo Ferreira")
    },
    RETC: {
        online: getOnlineActivityDataToAddObj("RETC", enums.category.REPETITION),
        paper: getPaperActivityDataToAddObj("RETC", enums.category.NORMAL,
            new Date(2018, 10, 20),"Diogo Ferreira")
    }
};

// *****************************************************************
// Tests

suiteArray = [

    describe('Scenario #2.2: Add 1 by 1', () => {

        test('2.2a Only one of paper type', async() => {
            const activitiesDataToAdd = [ activityData.CSJ.paper ];
            await addActivitiesUnitaryAndCheck(activitiesDataToAdd);
        });

        test('2.2b Only one of online type', async() => {
            const activitiesDataToAdd = [ activityData.ACTA.online ];
            await addActivitiesUnitaryAndCheck(activitiesDataToAdd);
        });

        test('2.2c More than one', async() => {
            const activitiesDataToAdd = [ activityData.ACTA.paper, activityData.ACTA.online ];
            await addActivitiesUnitaryAndCheck(activitiesDataToAdd);
        });

        test('2.2d One of each type/category', async() => {
            const activitiesDataToAdd = [
                activityData.CSJ.paper,
                activityData.CSJ.online,
                activityData.ACTA.paper,
                activityData.ACTA.online,
                activityData.RETC.online,
                activityData.RETC.paper
            ];
            await addActivitiesUnitaryAndCheck(activitiesDataToAdd);
        });

    }),

    describe('Scenario #2.3: Add activity blocks', () => {

        const blockName = 'Laboratório',
            blockName2 = 'Desfechos';
        const idExternalForCSJ = activityData.CSJ.paper.externalId;

        let itemTypeToPageTypeDict = {};
        itemTypeToPageTypeDict[ActivityAdditionItem.typeEnum.ON_LINE] = enums.type.ON_LINE;
        itemTypeToPageTypeDict[ActivityAdditionItem.typeEnum.PAPER] = enums.type.PAPER;

        test('2.3a Add only 1 block of PAPER type', async() => {
            let date = null;
            try {
                await checkActivityItemsIsClear();
                await activitiyAdderPage.switchTypeToPaper();
                await activitiyAdderPage.addActivityBlock([blockName], ActivityAdditionItemPaper);

                let activitiesDataToAdd = [], i = 0;
                for (let activityAddItem of activitiyAdderPage.activityAddItems) {
                    await activityAddItem.init(i, i);
                    date = new Date(2019, 3, 30);
                    date.setDate(date.getDate() + i++);
                    let data = await activityAddItem.extractData();
                    data.realizationDate = date;
                    data.type = itemTypeToPageTypeDict[data.type];
                    activitiesDataToAdd.push(data);
                    await activityAddItem.insertPaperExclusiveData(date, "Diogo Ferreira");
                    if(activityAddItem.requireExternalId){
                        await activityAddItem.insertExternalId(idExternalForCSJ);
                    }
                }

                await activitiyAdderPage.saveChanges();
                await checkAddition(activitiesDataToAdd);
            }
            catch (e) {//.
                console.log(`*${date}*\n${e}`);
                throw e;
            }
        });

        async function saveBlocksAdditionAndCheck(){
            await activitiyAdderPage.initItems();
            let activitiesDataToAdd = [];
            for(let activityAddItem of activitiyAdderPage.activityAddItems){
                const data = await activityAddItem.extractData();
                data.type = itemTypeToPageTypeDict[data.type];
                activitiesDataToAdd.push(data);
                if(activityAddItem.requireExternalId){
                    await activityAddItem.insertExternalId(idExternalForCSJ);
                }
            }
            await activitiyAdderPage.saveChanges();
            await checkAddition(activitiesDataToAdd);
        }

        test('2.3b Add only 1 block of ON-LINE type', async() => {
            await checkActivityItemsIsClear();
            await activitiyAdderPage.switchTypeToOnline();
            await activitiyAdderPage.addActivityBlock([blockName], ActivityAdditionItem);
            await saveBlocksAdditionAndCheck();
        });

        test('2.3c Add 2 blocks of same type', async() => {
            await checkActivityItemsIsClear();
            await activitiyAdderPage.switchTypeToOnline();
            await activitiyAdderPage.addActivityBlock([blockName, blockName2], ActivityAdditionItem);
            await saveBlocksAdditionAndCheck();
        });

        test('2.3d Add blocks AND unit activities', async() => {
            await checkActivityItemsIsClear();
            await activitiyAdderPage.switchTypeToOnline();

            await activitiyAdderPage.selectCategory(enums.category.REPETITION);
            await activitiyAdderPage.addActivityBlock([blockName], ActivityAdditionItem);

            await addActivitiesUnitaryAndFill([activityData.ACTA.online]);

            await activitiyAdderPage.selectCategory(enums.category.QUALITY_CONTROLL);
            await activitiyAdderPage.addActivityBlock([blockName2], ActivityAdditionItem);

            await saveBlocksAdditionAndCheck();
        });

    }),

    describe('Scenario #2.4: Delete one activity from temporary array', () => {

        const activitiesDataToAdd = [
            activityData.CSJ.paper,
            activityData.CSJ.online,
            activityData.ACTA.online,
            activityData.RETC.paper
        ];

        async function deleteItem(index){
            try {
                await checkActivityItemsIsClear();
                await addActivitiesUnitary(activitiesDataToAdd);
                await activitiyAdderPage.deleteActivityFromTemporaryList(index);
            }
            catch (e) {
                console.log(e);
                throw e;
            }
        }

        test('2.4a Delete one activity from BEGIN of temporary array', async() => {
            await deleteItem(0);
        });

        test('2.4b Delete one activity from MIDDLE of temporary array', async() => {
            await deleteItem(1);
        });

        test('2.4c Delete one activity from END of temporary array', async() => {
            await deleteItem(activitiesDataToAdd.length-1);
        });

    }),

    describe('Scenario #2.5: Cancel button reset all', () => {

        test('2.5 test', async() => {
            const activitiesDataToAdd = [
                activityData.CSJ.paper,
                activityData.CSJ.online,
                activityData.ACTA.paper,
                activityData.ACTA.online,
                activityData.RETC.online,
                activityData.RETC.paper
            ];
            await checkActivityItemsIsClear();
            await addActivitiesUnitary(activitiesDataToAdd);
            await activitiyAdderPage.cancelChanges();
        });
    }),

    describe('Scenario #2.6: All required fields have been filled', () => {

        async function fillActivitiesMissingSomething(activitiesDataToAdd, notInsertPaperDataInIndexes, notInsertExternalIdInIndexes){
            await checkActivityItemsIsClear();
            await addActivitiesUnitaryAndFill(activitiesDataToAdd, notInsertPaperDataInIndexes, notInsertExternalIdInIndexes);
        }

        /*
         * 2.6a Missing external ID in one online activity
         */
        const activitiesDataToAddForOnlineTarget = [
            activityData.CSJ.online, // online target
            activityData.ACTA.paper,
            activityData.RETC.online,
        ];

        test('2.6a-2 Missing external ID in one online activity (at first position)', async() => {
            const activitiesDataToAddReverse = activitiesDataToAddForOnlineTarget.reverse().slice();
            activitiesDataToAddForOnlineTarget.reverse();
            const n = activitiesDataToAddForOnlineTarget.length;
            await fillActivitiesMissingSomething(activitiesDataToAddReverse,[], [n-1]);
            await clickOnSaveButtonAndCheckDialog();
        });

        test('2.6a-1 Missing external ID in one online activity (at last position)', async() => {
            await fillActivitiesMissingSomething(activitiesDataToAddForOnlineTarget,[], [0]);
            await clickOnSaveButtonAndCheckDialog();
        });


        test('2.6a-3 Missing external ID in one online activity (at middle position)', async() => {
            const activitiesDataToAdd = [
                activityData.ACTA.paper,
                activityData.CSJ.online, // online target
                activityData.RETC.online,
            ];
            await fillActivitiesMissingSomething(activitiesDataToAdd,[], [1]);
            await clickOnSaveButtonAndCheckDialog();
        });

        /******************************************************
         * Paper activities
         */
        const activitiesDataToAdd = [
            activityData.CSJ.paper, // paper target
            activityData.ACTA.paper,
            activityData.RETC.online,
        ];
        const n = activitiesDataToAdd.length;

        const activitiesDataToAddMiddle = [
            activityData.RETC.online,
            activityData.CSJ.paper, // paper target
            activityData.ACTA.paper,
        ];
        const middleIndex = 1;

        function getReverseActivitiesDataToAdd(){
            const activitiesDataToAddReverse = activitiesDataToAdd.reverse().slice();
            activitiesDataToAdd.reverse();
            return activitiesDataToAddReverse;
        }

        /*
         * 2.6b Missing external ID in one paper activity
         */

        test('2.6b-1 Missing external ID in a paper activity (at first position)', async() => {
            await fillActivitiesMissingSomething(getReverseActivitiesDataToAdd(),[], [n-1]);
            await clickOnSaveButtonAndCheckDialog();
        });

        test('2.6b-2 Missing external ID in a paper activity (at last position)', async() => {
            await fillActivitiesMissingSomething(activitiesDataToAdd,[], [0]);
            await clickOnSaveButtonAndCheckDialog();
        });

        test('2.6b-3 Missing external ID in a paper activity (at middle position)', async() => {
            await fillActivitiesMissingSomething(activitiesDataToAddMiddle,[], [middleIndex]);
            await clickOnSaveButtonAndCheckDialog();
        });

        /*
         * 2.6d Missing inspector name in a paper activity
         */
        async function fillActivitiesMissingInspectorName(activitiesDataToAdd, indexForMissing){
            await fillActivitiesMissingSomething(activitiesDataToAdd, [indexForMissing], []);
            await clickOnSaveButtonAndCheckDialog();
        }

        test('2.6c-1 Missing inspector name in a paper activity (at first position)', async() => {
            await fillActivitiesMissingInspectorName(getReverseActivitiesDataToAdd(), n-1);
        });

        test('2.6c-2 Missing inspector name in a paper activity (at last position)', async() => {
            await fillActivitiesMissingInspectorName(activitiesDataToAdd, 0);
        });

        test('2.6c-3 Missing inspector name in a paper activity (at middle position)', async() => {
            await fillActivitiesMissingInspectorName(activitiesDataToAddMiddle, middleIndex);
        });
    }),

    describe('Scenario #2.7: Need click on autocomplete option to validate', () => {

        test('2.7 Try add paper activity WITHOUT click on autocomplete suggestion', async() => {
            const paperActivityData = activityData.ACTA.paper;
            await checkActivityItemsIsClear();
            await addActivitiesUnitary([paperActivityData]);
            // insert data
            const activityAddItem = activitiyAdderPage.activityAddItems[0];
            await activityAddItem.insertRealizationData(paperActivityData.realizationDate);
            // don't call insertInspectorName method to don't click on first option
            await activityAddItem.inspectorAutoComplete.type(paperActivityData.inspectorName);
            await activitiyAdderPage.clickOut();
            //
            await clickOnSaveButtonAndCheckDialog(); // calls goToActivityPage
        });

    }),

]; // end suiteArray
