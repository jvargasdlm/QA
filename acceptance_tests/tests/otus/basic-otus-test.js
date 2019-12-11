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

const OtusMainPage = require('../../code/otus/classes/OtusMainPage');

// *****************************************************************
// Tests

suiteArray = [

describe('Basic testes in Otus', () => {

  xtest('Select participant lab', async() => {
      await pageOtus.clickWithWait(selectors.homePage.EXIBIR_TODOS_BUTTON);
      await pageOtus.waitForMilliseconds(500);
      await pageOtus.clickOnLastElementOfList(selectors.button.VER_PARTICIPANTE, 0);
      await pageOtus.waitLoad();
      await pageOtus.clickOnMainMenuButton();
      await pageOtus.clickOnButtonByAttribute('ng-click', '$ctrl.loadLaboratory()');
      await pageOtus.waitLoad();
  });

  test('Add participant', async() => {

      await pageOtus.gotoUrl('http://localhost:51001/otus/#/participants-manager/participant-create');

      await pageOtus.typeWithWait('#name', 'Teste da Silva');

      let optionSelectorGender = pageOtus.getNewOptionSelector();
      await optionSelectorGender.initById('sex');
      await optionSelectorGender.selectOption('F');

      let optionSelectorCenter = pageOtus.getNewOptionSelector();
      await optionSelectorCenter.initById('center');
      await optionSelectorCenter.selectOption('RS');

      let calendar = pageOtus.getNewCalendar();
      await calendar.init();
      await calendar.openAndSelectDate(new Date(1995, 8, 15));

      await pageOtus.clickOnButtonByAttribute('ng-click', '$ctrl.saveParticipant()');
      const dialog = pageOtus.getNewDialog();
      await dialog.waitForOpenAndClickOnOkButton();

      // confirm dialog
      await pageOtus.getNewDialogWarning().clickOnOkButton();
  });

  xtest('Checkbox', async() => {

      const otusMainPage = new OtusMainPage(pageOtus.page);
      await otusMainPage.clickWithWait(otusMainPage.getSelectors().button.ATIVIDADES_CENTRO);
      await otusMainPage.waitLoad();

      let labels = ['MG', 'SP', 'RS', 'RJ', 'ES', 'BA'];

      let checkbox = pageOtus.getNewCheckbox();

      for(let label of labels){
          await checkbox.clickByLabel(label);
      }

      await pageOtus.waitForMilliseconds(2000);

      for(let label of labels){
          await checkbox.clickByLabel(label);
      }
  });

})

]; // end suiteArray