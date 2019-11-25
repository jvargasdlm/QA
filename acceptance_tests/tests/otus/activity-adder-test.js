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
const recruitmentNumberOrName = '5001007'; //'2000735';

// *****************************************************************
// Auxiliar functions

async function openParticipantActivities(){
    await pageOtus.openParticipantFromHomePage(recruitmentNumberOrName);
    await pageOtus.openParticipantActivitiesMenu();
}

async function extractAllActivityDataFromOldPage(){
    //activitiesPage.enableConsoleLog();
    const rowSelector = "div[class='dynamic-table-body-row layout-align-start-center layout-row flex']";
    await activitiesPage.waitForSelector(rowSelector);

    return await activitiesPage.page.evaluate((rowSelector, enums) => { // using the old activities page version
        const categoryDict = {
            "Normal": enums.category.NORMAL,
            "Controle de Qualidade": enums.category.QUALITY_CONTROLL,
            "Repetição": enums.category.REPETITION,
        };

        const rows = Array.from(document.querySelectorAll(rowSelector));
        let data = [];
        for (let i = 0; i < rows.length; i++) {
            let columns = Array.from(rows[i].querySelectorAll("div[ng-repeat='column in row.columns']"));
            data.push({
                acronym: columns[1].innerText,
                type: (columns[2].innerText === "description" ? enums.type.PAPER : enums.type.ON_LINE),
                realizationDate: columns[3].innerText,
                status: columns[4].innerText,
                category: categoryDict[columns[5].innerText]
            })
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

function getOnlineActivityDataToAddObj(acronym, category, externalId=null){
    return {
        acronym: acronym,
        type: enums.type.ON_LINE,
        category: category,
        //externalId: externalId
    }
}

function getPaperActivityDataToAddObj(acronym, category, date, inspectorName, externalId=null){
    return {
        acronym: acronym,
        type: enums.type.PAPER,
        category: category,
        //externalId: externalId,
        realizationDate: date,
        inspectorName: inspectorName
    }
}

async function addActivitiesUnitary(activitiesDataToAdd){
    await activitiyAdderPage.switchQuantityToUnit();

    const classDict = {};
    classDict[enums.type.ON_LINE] = ActivityAdditionItem;
    classDict[enums.type.PAPER] = ActivityAdditionItemPaper;

    let i=0;
    try {
        for (let data of activitiesDataToAdd) {
            await activitiyAdderPage.switchTypeTo(data.type);
            await activitiyAdderPage.selectCategory(data.category);
            await activitiyAdderPage.addActivity(data.acronym, classDict[data.type]);
            if (data.type === enums.type.PAPER) {
                await activitiyAdderPage.activityAddItems[i]
                    .insertPaperExclusiveData(data.realizationDate, data.inspectorName);
            }
            if (data.externalId) {
                await activitiyAdderPage.activityAddItems[i].insertExternalId(data.externalId);
            }
            i++;
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
            //externalId: activityData.externalId,
            realizationDate: activityData.realizationDate
        };
    }

    let activitiesDataAfter = await extractAllActivityDataFromOldPage();

    let newActivitiesData=[], newActivitiesIndexes = [];
    for (let i = 0; i < activitiesDataAfter.length; i++) {
        if(activitiesDataAfter[i].status.length > 0){
            newActivitiesIndexes.push(i);
            newActivitiesData.push(activitiesDataAfter[i]);
        }
    }

    let failMessage = `The amount of activities after addition is NOT equal to the amount of activities already in existence plus the amount of activities added.`;
    try{
        expect(activitiesDataAfter.length).toBe(activitiesDataBefore.length + addedActivitiesData.length);

        newActivitiesData = newActivitiesData.map( data => filterDataToCheck(data));
        addedActivitiesData = addedActivitiesData.map(data => filterDataToCheck(data));

        let conflictData = [];

        for (let i = 0; i < addedActivitiesData.length; i++) {
            if(!newActivitiesData.includes(addedActivitiesData[i])){
                conflictData.push(addedActivitiesData[i]);
            }
        }

        failMessage = `At least one of the added activities does NOT appear on the activity page with the same data:\n`
            + JSON.stringify(conflictData);
        expect(conflictData.length).toBe(0);
    }
    catch (e) {
        errorLogger.addFailMessageFromCurrSpec(failMessage);
    }
    finally {
        // TODO delete all new activities
        // await activitiesPage.searchActivity("novo");
        // await activitiesPage.selectAllActivities();
        const checkboxes = await activitiesPage.page.$$(activitiesPage.getNewCheckbox().tagName);
        for(let index of newActivitiesIndexes){
            await checkboxes[index+2].click();
        }
        await activitiesPage.deleteSelectedActivities();
    }
}

async function addActivitiesUnitaryAndCheck(activitiesDataToAdd){
    await addActivitiesUnitary(activitiesDataToAdd);
    // await activitiyAdderPage.saveChanges();
    // await this.goBackAndWaitLoad(); //<< while save button doesn't work
    // await checkAddition(activitiesDataToAdd);
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

const paperCSJ = getPaperActivityDataToAddObj("CSJ", enums.category.REPETITION, new Date(2018, 4, 19), "Diogo Ferreira");
const paperDSN = getPaperActivityDataToAddObj("DSN", enums.category.QUALITY_CONTROLL, new Date(2018, 6, 3), "Diogo Ferreira");
const paperRETCLQ = getPaperActivityDataToAddObj("RETCLQ", enums.category.NORMAL, new Date(2019, 10, 20), "Diogo Ferreira");

const onlineCSJ = getOnlineActivityDataToAddObj("CSJ", enums.category.QUALITY_CONTROLL, "1234567890");
const onlineDSN = getOnlineActivityDataToAddObj("DSN", enums.category.NORMAL, "0987654321");
const onlineRETCLQ = getOnlineActivityDataToAddObj("RETCLQ", enums.category.REPETITION, "0987654321");


suiteArray = [

    describe('TEMP SUITE', () => {

        test('test', async() => {

            function filterDataToCheck(activityData){
                return {
                    acronym: activityData.acronym,
                    category: activityData.category,
                    realizationDate: activityData.realizationDate
                };
            }

            await activitiyAdderPage.goBackAndWaitLoad();
            let activitiesDataAfter = await extractAllActivityDataFromOldPage();
            activitiesDataAfter = activitiesDataAfter.map(data => filterDataToCheck(data));
            console.log(activitiesDataAfter);

            const optionSelector = activitiesPage.getNewMultipleOptionSelector();
            await optionSelector.initByAttributesSelector("[aria-label='Blocos']");
            await optionSelector.selectOptions(['Grupo 1']);
            await activitiesPage.waitForMilliseconds(5000);
        });

    }),

    xdescribe('Scenario #2.2: Add 1 by 1', () => {

        test('2.2a Only one of paper type', async() => {
            const activitiesDataToAdd = [ paperCSJ ];
            await addActivitiesUnitaryAndCheck(activitiesDataToAdd);
        });

        test('2.2b Only one of online type', async() => {
            const activitiesDataToAdd = [ onlineDSN ];
            await addActivitiesUnitaryAndCheck(activitiesDataToAdd);
        });

        test('2.2c More than one', async() => {
            const activitiesDataToAdd = [ paperCSJ, onlineDSN ];
            await addActivitiesUnitaryAndCheck(activitiesDataToAdd);
        });

        test('2.2d One of each type/category', async() => {
            const activitiesDataToAdd = [
                paperCSJ,
                onlineCSJ,
                paperDSN,
                onlineDSN,
                onlineRETCLQ,
                paperRETCLQ
            ];
            await addActivitiesUnitaryAndCheck(activitiesDataToAdd);
        });

    }),

    xdescribe('Scenario #2.3: Add list of same type', () => {

        test('2.3 test', async() => {


        });

    }),

    xdescribe('Scenario #2.4: Delete one activity from temporary array', () => {

        test('2.3 test', async() => {
            const activitiesDataToAdd = [
                paperCSJ,
                onlineCSJ,
                paperDSN,
                onlineDSN,
                onlineRETCLQ,
                paperRETCLQ
            ];
            try{
                await addActivitiesUnitary(activitiesDataToAdd);
                await activitiyAdderPage.deleteActivityFromTemporaryList(1);
                console.log('done');//.
            }
            catch (e) {
                console.log(e);//.
            }
            finally {
                await activitiyAdderPage.goBackAndWaitLoad();
            }
        });

    }),

    xdescribe('Scenario #2.5: Cancel button reset all', () => {

        test('2.3 test', async() => {
            const activitiesDataToAdd = [
                paperCSJ,
                onlineCSJ,
                paperDSN,
                onlineDSN,
                onlineRETCLQ,
                paperRETCLQ
            ];
            try{
                await addActivitiesUnitary(activitiesDataToAdd);
                await activitiyAdderPage.cancelChanges();
                console.log('done');//.
            }
            catch (e) {
                console.log(e);//.
            }
            finally {
                await activitiyAdderPage.goBackAndWaitLoad();
            }
        });
    }),

]; // end suiteArray
