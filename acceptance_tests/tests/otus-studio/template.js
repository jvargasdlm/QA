const lib = require('../../code/otus-studio/lib');

let browser, suiteArray=[], errorLogger;        // for all tests
let templatesPage, templatesDict, editorPage;   // only for otus studio tests

beforeAll(async () => {
    [browser, templatesPage, errorLogger, templatesDict] = await lib.doBeforeAllAndUploadTemplates(suiteArray);
});

beforeEach(async() => {
    console.log('RUNNING TEST\n', errorLogger.currSpecName);
});

afterEach(async () => {
    errorLogger.advanceToNextSpec();
});

afterAll(async () => {
    await errorLogger.exportTestResultLog();
    await browser.close();
});

// *****************************************************************
// Specific modules for this suite test


// *****************************************************************
// Tests

suiteArray = [

    describe('Test Suite A', () => {

        test('Test 1', async() => {

        });

    }),

    describe('Test Suite B', () => {

        test('Test 2', async() => {

        });

    })

]; // end suiteArray