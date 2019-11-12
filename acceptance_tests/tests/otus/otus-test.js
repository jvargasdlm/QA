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
    await browser.close();
});

// *****************************************************************
// Specific modules for this suite test

const ActivitiesPageSelectors = require('../../code/otus/classes/activities/ActivitiesPage').getSelectors();
const OtusMainPage = require('../../code/otus/classes/OtusMainPage');

// *****************************************************************
// Tests

suiteArray = [

describe('otus test', () => {

  test('select participant lab', async() => {
      await pageOtus.clickWithWait(selectors.homePage.EXIBIR_TODOS_BUTTON);
      await pageOtus.waitForMilliseconds(500);
      await pageOtus.clickOnLastElementOfList(selectors.button.VER_PARTICIPANTE, 0);
      await pageOtus.waitLoad();
      await pageOtus.clickOnMainMenuButton();
      await pageOtus.clickOnButtonByAttribute('ng-click', '$ctrl.loadLaboratory()');
      await pageOtus.waitLoad();
  });

  test('Add participant', async() => {

      await pageOtus.gotoUrl('http://localhost:3000/#/participants-manager/participant-create');

      await pageOtus.typeWithWait('#name', 'Teste da Silva');

      let optionSelectorGender = pageOtus.getNewOptionSelector();
      await optionSelectorGender.initById('sex');
      await optionSelectorGender.selectOption('F');

      let optionSelectorCenter = pageOtus.getNewOptionSelector();
      await optionSelectorCenter.initById('center');
      await optionSelectorCenter.selectOption('RS');

      let calendar = pageOtus.getNewCalendar();
      await calendar.openAndSelectDate('Data de Nascimento', -3, -4, 25);

      await pageOtus.clickOnButtonByAttribute('ng-click', '$ctrl.saveParticipant()');
      const dialog = pageOtus.getNewDialog();
      await dialog.waitForOpenAndClickOnOkButton();

      // confirm dialog
      await pageOtus.getNewDialogWarning().clickOnOkButton();
  });

  xtest('test checkbox', async() => {

      const otusMainPage = new OtusMainPage(pageOtus.page);
      await otusMainPage.clickWithWait(otusMainPage.getSelectors().button.ATIVIDADES_CENTRO);
      await otusMainPage.waitLoad();

      let labels = ['MG', 'SP', 'RS', 'RJ', 'ES', 'BA'];

      let checkbox = pageOtus.getNewCheckbox();

      for (let i = 0; i < labels.length; i++) {
          await checkbox.clickByLabel(labels[i]);
      }

      await pageOtus.waitForMilliseconds(2000);//.

      for (let i = 0; i < labels.length; i++) {
          await checkbox.clickByLabel(labels[i]);
      }
  });

})

]; // end suiteArray