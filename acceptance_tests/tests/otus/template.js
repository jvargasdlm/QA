const lib = require('../../code/otus/lib');

let browser, pageOtus, selectors;
let suiteArray=[], errorLogger;

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
    await browser.stop();
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
