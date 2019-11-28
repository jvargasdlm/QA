const lib = require('../../code/otus/lib');

let browser, suiteArray=[], errorLogger;        // for all tests
let pageOtus, selectors;                        // only for otus tests
let activitiyAdderPage, activitiesPage;
let activitiesDataBefore = {};

beforeAll(async () => {
    [browser, pageOtus, errorLogger, selectors] = await lib.doBeforeAll(suiteArray);
    await openParticipantActivities();
});

beforeEach(async () => {
    console.log('RUNNING TEST\n', errorLogger.currSpecName);
    await getCurrActivityDataAndGoToAdderPage();
});

afterEach(async () => {
    errorLogger.advanceToNextSpec();
    await pageOtus.waitForMilliseconds(2000);//.
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
const recruitmentNumber = '5001007'; //'2000735';
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
}


async function extractAllActivityDataFromOldPage(){
    const rowSelector = "div[layout='row'][tabindex='0']";
    await activitiesPage.waitForSelector(rowSelector);

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
                type: (columns[2].innerText === "description" ? enums.type.PAPER : enums.type.ON_LINE),
                realizationDate: columns[3].innerText,
                status: columns[4].innerText,
                category: categoryDict[columns[5].innerText]
            });
        }
        return data;
    }, rowSelector, enums);
}

async function getCurrActivityDataAndGoToAdderPage(){
    activitiesPage = new ActivitiesPage(pageOtus.page);
    await activitiesPage.clickOnShowAllActivitiesButton();
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

async function addActivitiesUnitary(activitiesDataToAdd, notInsertPaperDataInIndexes=[], notInsertExternalIdInIndexes=[]){
    await activitiyAdderPage.switchQuantityToUnit();

    const classDict = {};
    classDict[enums.type.ON_LINE] = ActivityAdditionItem;
    classDict[enums.type.PAPER] = ActivityAdditionItemPaper;

    let i=0;
    try {
        for (let i = 0; i < activitiesDataToAdd.length; i++) {
            let data = activitiesDataToAdd[i];
            await activitiyAdderPage.switchTypeTo(data.type);
            await activitiyAdderPage.selectCategory(data.category);
            const activityItem = await activitiyAdderPage.addActivity(data.acronym, classDict[data.type]);
            if (!notInsertPaperDataInIndexes.includes(i) && data.type === enums.type.PAPER) {
                await activityItem.insertPaperExclusiveData(data.realizationDate, data.inspectorName);
            }
            if (!notInsertExternalIdInIndexes.includes(i) && data.externalId) {
                await activityItem.insertExternalId(data.externalId);
            }
        }
    }
    catch (e) {
        console.log(`Error at activity index=${i} addition:`, e.message);//.
        throw e;//.
    }
}

async function checkAddition(addedActivitiesData){

    function filterDataToCheck(activityData){
        return {
            acronym: activityData.acronym,
            category: activityData.category,
            externalId: activityData.externalId,
            realizationDate: activityData.realizationDate
        };
    }

    function myIndexOf(array, obj) {
        for (let i = 0; i < array.length; i++) {
            const sameAcronym = (array[i].acronym === obj.acronym);
            const sameCategory = (array[i].category.value === obj.category.value);
            const sameDate = (array[i].realizationDate === obj.realizationDate);
            if (sameAcronym &&
                sameCategory &&
                sameDate) {
                return i;
            }
            // if (array[i].acronym === obj.acronym &&
            //     array[i].category.value === obj.category.value &&
            //     array[i].realizationDate === obj.realizationDate) {
            //     return i;
            // }
        }
        return -1;
    }

    let numActivitiesToDelete = 0;

    await pageOtus.waitForMilliseconds(500); // wait to load page
    const url = pageOtus.page.url();
    let failMessage = `I should be at activities page, but I'm at url = ${url}`;
    try{
        expect(url).toBe(activityPageUrl);

        await activitiesPage.clickOnShowAllActivitiesButton();
        let activitiesDataAfter = (await extractAllActivityDataFromOldPage())
            .map( data => filterDataToCheck(data));

        failMessage = `The amount of activities after addition (${activitiesDataAfter.length}) is NOT equal to` +
            `the amount of activities already in existence (${activitiesDataBefore.length}) plus the amount of activities added (${addedActivitiesData.length}).`;
        expect(activitiesDataAfter).toBeArrayOfSize(activitiesDataBefore.length + addedActivitiesData.length);

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
    try{
        await addActivitiesUnitary(activitiesDataToAdd);
        await pageOtus.waitForMilliseconds(2500); // wait fill inputs complete
        await activitiyAdderPage.saveChanges();
        await checkAddition(activitiesDataToAdd);
    }
    catch (e) {
        await goToActivityPage();
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
        paper: getPaperActivityDataToAddObj("CSJ", enums.category.REPETITION, new Date(2018, 4, 19),
            "Diogo Ferreira", recruitmentNumber+"002")
    },
    ACTA: {
        online: getOnlineActivityDataToAddObj("ACTA", enums.category.NORMAL, recruitmentNumber+"003"),
        paper: getPaperActivityDataToAddObj("ACTA", enums.category.QUALITY_CONTROLL, new Date(2018, 6, 3),
            "Diogo Ferreira", recruitmentNumber+"004")
    },
    RETCLQ: {
        online: getOnlineActivityDataToAddObj("RETCLQ", enums.category.REPETITION, recruitmentNumber+"005"),
        paper: getPaperActivityDataToAddObj("RETCLQ", enums.category.NORMAL, new Date(2019, 10, 20),
            "Diogo Ferreira", recruitmentNumber+"006")
    }
};

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

    xdescribe('TEMP SUITE', () => {

        test('Extract item content', async() => {

        });

    }),

    describe('Scenario #2.2: Add 1 by 1', () => {

        test('2.2a Only one of paper type', async() => {
            const activitiesDataToAdd = [ activityData.CSJ.paper ];
            await addActivitiesUnitaryAndCheck(activitiesDataToAdd);
        });

        xtest('2.2b Only one of online type', async() => {
            const activitiesDataToAdd = [ activityData.ACTA.online ];
            await addActivitiesUnitaryAndCheck(activitiesDataToAdd);
        });

        xtest('2.2c More than one', async() => {
            const activitiesDataToAdd = [ activityData.CSJ.paper, activityData.ACTA.online ];
            await addActivitiesUnitaryAndCheck(activitiesDataToAdd);
        });

        xtest('2.2d One of each type/category', async() => {
            const activitiesDataToAdd = [
                //activityData.CSJ.paper,
                activityData.CSJ.online,
                //activityData.ACTA.paper,
                activityData.ACTA.online,
                activityData.RETCLQ.online,
                //activityData.RETCLQ.paper
            ];
            await addActivitiesUnitaryAndCheck(activitiesDataToAdd);
        });

    }),

    xdescribe('Scenario #2.3: Add activity blocks', () => {

        async function saveBlocksAdditionAndCheck(){
            let activitiesDataToAdd = [];
            for(let activityAddItem of activitiyAdderPage.activityAddItems){
                activitiesDataToAdd.push(await activityAddItem.extractData());
            }
            await activitiyAdderPage.saveChanges();
            //await checkAddition(activitiesDataToAdd);
        }

        test('2.3a Add only 1 block of ON-LINE type', async() => {
            try {
                await checkActivityItemsIsClear();
                await activitiyAdderPage.switchTypeToOnline();
                await activitiyAdderPage.addActivityBlock(['Laboratório'], ActivityAdditionItem);
                await saveBlocksAdditionAndCheck();
            }
            catch(e){
                console.log(e);//.
                await goToActivityPage();
                throw e;
            }
        });

        test('2.3b Add only 1 block of PAPER type', async() => {
            try {
                await checkActivityItemsIsClear();
                await activitiyAdderPage.switchTypeToPaper();
                await activitiyAdderPage.addActivityBlock(['Laboratório'], ActivityAdditionItemPaper);

                let activitiesDataToAdd = [], i=0;
                for(let activityAddItem of activitiyAdderPage.activityAddItems){
                    let date = new Date(2019, 3,20) + i++;
                    let data = await activityAddItem.extractData();
                    data.realizationDate = date;
                    activitiesDataToAdd.push(data);
                    await activitiyAdderPage.activityAddItems[i].insertPaperExclusiveData(date, "Diogo Ferreira");
                }

                await activitiyAdderPage.saveChanges();
                //await checkAddition(activitiesDataToAdd);
            }
            catch(e){
                console.log(e);//.
                await goToActivityPage();
                throw e;
            }
        });

        test('2.3c Add 2 blocks of same type', async() => {
            try {
                await checkActivityItemsIsClear();
                await activitiyAdderPage.switchTypeToOnline();
                await activitiyAdderPage.addActivityBlock(['Laboratório', 'Desfechos'], ActivityAdditionItem);
                await saveBlocksAdditionAndCheck();
            }
            catch(e){
                console.log(e);//.
                await goToActivityPage();
                throw e;
            }
        });

        test('2.3d Add blocks AND unit activities', async() => {
            try {
                await checkActivityItemsIsClear();
                await activitiyAdderPage.switchTypeToOnline();
                await activitiyAdderPage.addActivityBlock(['Laboratório'], ActivityAdditionItem);
                await addActivitiesUnitary([activityData.ACTA.online]);
                await activitiyAdderPage.addActivityBlock(['Desfechos'], ActivityAdditionItem);
                await saveBlocksAdditionAndCheck();
            }
            catch(e){
                console.log(e);//.
                await goToActivityPage();
                throw e;
            }
        });

    }),

    xdescribe('Scenario #2.4: Delete one activity from temporary array', () => {

        test('2.4 test', async() => {
            const activitiesDataToAdd = [
                activityData.CSJ.paper,
                activityData.CSJ.online,
                activityData.ACTA.paper,
                activityData.ACTA.online,
                activityData.RETCLQ.online,
                activityData.RETCLQ.paper
            ];
            try{
                await checkActivityItemsIsClear();
                await addActivitiesUnitary(activitiesDataToAdd);
                await activitiyAdderPage.deleteActivityFromTemporaryList(1);
                const numActivityItems = await activitiyAdderPage.countActivities();
                await goToActivityPage();

                expect(numActivityItems).toBe(activitiesDataToAdd.length - 1);
            }
            catch (e) {
                console.log(e);//.
                await goToActivityPage();
                throw e;
            }
        });

    }),

    xdescribe('Scenario #2.5: Cancel button reset all', () => {

        test('2.5 test', async() => {
            const activitiesDataToAdd = [
                activityData.CSJ.paper,
                activityData.CSJ.online,
                activityData.ACTA.paper,
                activityData.ACTA.online,
                activityData.RETCLQ.online,
                activityData.RETCLQ.paper
            ];
            try{
                await checkActivityItemsIsClear();
                await addActivitiesUnitary(activitiesDataToAdd);
                await activitiyAdderPage.cancelChanges();
                await goToActivityPage();
            }
            catch (e) {
                console.log(e);//.
                await goToActivityPage();
                throw e;
            }
        });
    }),

    xdescribe('Scenario #2.6: All required fields have been filled', () => {

        const activitiesDataToAdd = [
            activityData.CSJ.paper,
            activityData.CSJ.online,
            activityData.ACTA.paper,
            activityData.ACTA.online,
            // activityData.RETCLQ.online,
            // activityData.RETCLQ.paper
        ];

        async function fillActivitiesMissingSomething(notInsertPaperDataInIndexes, notInsertExternalIdInIndexes){
            try{
                await checkActivityItemsIsClear();
                await addActivitiesUnitary(activitiesDataToAdd, notInsertPaperDataInIndexes, notInsertExternalIdInIndexes);
            }
            catch (e) {
                console.log(e);//.
                await goToActivityPage();
                throw e;
            }
        }

        async function clickOnSaveButtonAndCheckDialog(){
            let failMessage = null;
            try{
                await activitiyAdderPage.saveButton.click();
                const dialog = activitiyAdderPage.getNewDialog();
                await dialog.waitForOpen();
                const numActionButtons = dialog.getNumActionButtons();
                await dialog.clickOnCancelButton();

                failMessage = `Dialog should be has only one action button (CANCEL), but has ${numActionButtons}`;
                expect(numActionButtons).toBe(1);

                failMessage = null;
                await goToActivityPage();
            }
            catch (e) {
                if(failMessage){
                    errorLogger.addFailMessageFromCurrSpec(failMessage);
                }
                console.log(e);//.
                await goToActivityPage();
                throw e;
            }
        }

        test('2.6a Missing external ID in one online activity', async() => {
            await fillActivitiesMissingSomething([], [1]);
            await clickOnSaveButtonAndCheckDialog();
        });

        test('2.6b Missing external ID in one paper activity', async() => {
            await fillActivitiesMissingSomething([], [0]);
            await clickOnSaveButtonAndCheckDialog();
        });

        test('2.6c Missing realization date in one paper activity', async() => {
            const paperActivityIndex = 2;
            await fillActivitiesMissingSomething([paperActivityIndex], []);
            await activitiyAdderPage.activityAddItems[paperActivityIndex].insertInspector(activitiesDataToAdd[paperActivityIndex].inspectorName);
            await clickOnSaveButtonAndCheckDialog();
        });

        test('2.6d Missing inspector name in one paper activity', async() => {
            const paperActivityIndex = 2;
            await fillActivitiesMissingSomething([paperActivityIndex], []);
            await activitiyAdderPage.activityAddItems[paperActivityIndex].insertRealizationData(activitiesDataToAdd[paperActivityIndex].realizationDate);
            await clickOnSaveButtonAndCheckDialog();
        });
    }),

]; // end suiteArray
