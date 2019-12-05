const lib = require('../../code/otus/lib');

let browser, suiteArray=[], errorLogger;        // for all tests
let pageOtus, selectors;                        // only for otus tests
let activitiyAdderPage, activitiesPage;
let activitiesDataBefore = {};

beforeAll(async () => {
    [browser, pageOtus, errorLogger, selectors] = await lib.doBeforeAll(suiteArray);
    lib.setTestTimeoutSeconds(600);
    await openParticipantActivities();
});

beforeEach(async () => {
    console.log('RUNNING TEST\n', errorLogger.currSpecName);
    await getCurrActivityDataAndGoToAdderPage();
});

afterEach(async () => {
    errorLogger.advanceToNextSpec();
    await goToActivityPage();
    //await pageOtus.waitForMilliseconds(2000);//.
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
const withActivities = false;
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
    await pageOtus.refresh(); // don't use refreshAndWaitLoad to do'nt call init for activitiesPage (is the old version)
    await pageOtus.waitLoad();
}

async function extractAllActivityDataFromOldPage(){
    const rowSelector = "div[layout='row'][tabindex='0']";
    try {
        await activitiesPage.waitForSelector(rowSelector, false, 1000);
    }
    catch(e){
        if( (await activitiesPage.page.$$(rowSelector)).length === 0){
            return [];
        }
    }

    await activitiesPage.clickOnShowAllActivitiesButton();

    return await activitiesPage.page.evaluate((rowSelector, enums) => { // using the old activities page version
        const categoryDict = {
            "Normal": enums.category.NORMAL,
            "Controle de Qualidade": enums.category.QUALITY_CONTROLL,
            "Repetição": enums.category.REPETITION,
        };

        const rows = Array.from(document.querySelectorAll(rowSelector));
        console.log(rows.length);//.
        let data = [];
        for (let i = 0; i < rows.length; i++) {
            let columns = Array.from(rows[i].querySelectorAll("div[ng-repeat='column in row.columns']"));
            data.push({
                acronym: columns[1].innerText,
                type: (columns[2].innerText === "description" ?
                    enums.type.PAPER :
                    enums.type.ON_LINE),
                realizationDate: (columns[3].innerText? columns[3].innerText : ''),
                status: columns[4].innerText,
                category: categoryDict[columns[5].innerText].value
            });
        }
        return data;
    }, rowSelector, enums);
}

async function getCurrActivityDataAndGoToAdderPage(){
    activitiesPage = new ActivitiesPage(pageOtus.page);
    activitiesDataBefore = await extractAllActivityDataFromOldPage();
    await activitiesPage.clickWithWait("md-fab-trigger[aria-label='Adicionar atividade']"); // old button selector
    await pageOtus.waitLoad();
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

    let failMessage = '';
    try {
        for (let i = 0; i < activitiesDataToAdd.length; i++) {
            failMessage = `Error at activity index=${i} addition:`;
            let data = activitiesDataToAdd[i];
            await activitiyAdderPage.switchTypeTo(data.type);
            await activitiyAdderPage.selectCategory(data.category);
            await activitiyAdderPage.addActivity(data.acronym, classDict[data.type]);
        }

        await activitiyAdderPage.initItems();
    }
    catch (e) {
        console.log(failMessage, e.message);//.
        throw e;//.
    }
}

async function addActivitiesUnitaryAndFill(activitiesDataToAdd, notInsertPaperDataInIndexes=[], notInsertExternalIdInIndexes=[]){
    let failMessage = '';
    try {
        await addActivitiesUnitary(activitiesDataToAdd);

        let index = 0;

        for (let i = activitiesDataToAdd.length-1; i >= 0 ; i--) {
            failMessage = `Error at activity index=${i} fill:`;
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
        console.log(failMessage, e.message);//.
        throw e;//.
    }
}

async function checkAddition(addedActivitiesData){

    function filterDataToCheck(activityData){

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

        try {

            return {
                acronym: activityData.acronym,
                type: activityData.type,
                category: (activityData.category instanceof Object? activityData.category.value.toUpperCase() : activityData.category),
                realizationDate: dateToString(activityData.realizationDate)
            };
        }
        catch (e) {
            console.log(e);
            throw e;
        }
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
            if (sameAcronym && sameType && sameCategory && !sameDate) {
                diffLog.push(`acronym? ${sameAcronym}, type? ${sameType}, category? ${sameCategory}, date? ${sameDate}`);
                console.log(`acronym? ${obj.acronym}, activitiesDataAfter = ${array[i].realizationDate}, data = ${obj.realizationDate}`);
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

        failMessage = 'Other';
        let activitiesDataAfter = (await extractAllActivityDataFromOldPage());
        activitiesDataAfter = activitiesDataAfter.map( data => filterDataToCheck(data));

        failMessage = `The amount of activities after addition (${activitiesDataAfter.length}) is NOT equal to` +
            `the amount of activities already in existence (${activitiesDataBefore.length}) plus the amount of activities added (${addedActivitiesData.length}).`;
        expect(activitiesDataAfter).toBeArrayOfSize(activitiesDataBefore.length + addedActivitiesData.length);

        failMessage = 'Other2';
        addedActivitiesData = addedActivitiesData.map(data => filterDataToCheck(data));

        const checkboxes = await activitiesPage.page.$$(activitiesPage.getNewCheckbox().tagName);
        let conflictData = [];
        for(let data of addedActivitiesData){
            let index = myIndexOf(activitiesDataAfter, data);
            if(index >= 0){
                await checkboxes[index + 2].click();
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
        if(failMessage.includes("Other"))
            console.log(e);
        errorLogger.addFailMessageFromCurrSpec(failMessage);
    }
    finally {
        if(numActivitiesToDelete > 0) { // old delete version - don't use activitiesPage delete method
            await activitiesPage.clickWithWait("button[aria-label='Excluir']");
            await (activitiesPage.getNewDialog()).waitForOpenAndClickOnOkButton();
            await activitiesPage.waitLoad();
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

    xdescribe('Scenario #2.2: Add 1 by 1', () => {

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

    xdescribe('Scenario #2.3: Add activity blocks', () => {

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

    xdescribe('Scenario #2.5: Cancel button reset all', () => {

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

    xdescribe('Scenario #2.6: All required fields have been filled', () => {

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

    xdescribe('Scenario #2.7: Need click on autocomplete option to validate', () => {

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
