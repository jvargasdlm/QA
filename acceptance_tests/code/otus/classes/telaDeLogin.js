const lib = require('../lib');

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
    await browser.close();
    
});

// *****************************************************************
// Specific modules for this suite test


// *****************************************************************
// Tests

  var PreviewPage = require('./PreviewPage')


  describe('Test Suite A', () => {

    test('Test 1', async() => {

      await pageOtus.waitForMilliseconds(2000)
      await pageOtus.clickWithWait("button[ng-if='attrs.showParticipantsButton']")/*exibe os partisipantes*/
      await pageOtus.waitLoad();
      var button = await pageOtus.page.$$("button[aria-label='Ver participante']")/*seleciona todos participante*/
      await button[1].click();/*escolhe o segundo participante*/
      await pageOtus.waitForMilliseconds(2000);
      await pageOtus.clickWithWait("button[ng-click='$ctrl.launchSidenav()']")/*abre a aba superior direita*/
      await pageOtus.waitLoad();
      await pageOtus.clickWithWait("button[ng-click='$ctrl.loadParticipantActivities()']")/*seleciona as atividades*/
      await pageOtus.waitForMilliseconds(2000)
      var checkbox = await pageOtus.page.$$("md-checkbox[ng-checked='row.selected']")/*seleciona todos checkbox*/
      await checkbox[1].click();/*escolhe o segundo checkbox*/
      await pageOtus.waitForMilliseconds(2000)
      await pageOtus.clickWithWait("[ng-click='$ctrl.fillSelectedActivity()']")/*clica em preencher a atividade*/
      await pageOtus.waitForMilliseconds(2000)
      await pageOtus.clickWithWait("[ng-click='$ctrl.play()']")/*clica em iniciar*/
      await pageOtus.waitForMilliseconds(2000)
      await pageOtus.clickWithWait("input[ng-model='$ctrl.answer']")/*clica no campo para inserir um valor*/
      await pageOtus.waitForMilliseconds(2000)
      
      




      

      




    });

  }),

  describe('Test Suite B', () => {

    test('Test 2', async() => {

    });

  })

 // end suiteArray
