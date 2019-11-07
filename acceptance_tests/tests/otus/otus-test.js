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

// *****************************************************************
// Tests

suiteArray = [
/*
describe('otus test', () => {

  xtest('select participant lab', async() => {
      await pageOtus.clickWithWait(selectors.homePage.EXIBIR_TODOS_BUTTON);
      await pageOtus.clickOnLastElementOfList(selectors.button.VER_PARTICIPANTE, 0);
      await pageOtus.waitLoad();
      await pageOtus.clickOnMainMenuButton();
      await pageOtus.clickOnButtonByAttribute('ng-click', '$ctrl.loadLaboratory()');
      await pageOtus.waitLoad();
  });

  xtest('select participant activity form', async() => {
      await pageOtus.goToHomePageAndWaitLoad();
      await pageOtus.clickWithWait(selectors.button.EXIBIR_TODOS_BUTTON);
      await pageOtus.clickOnLastElementOfList(selectors.button.VER_PARTICIPANTE, 0);
      await pageOtus.waitLoad();

      await pageOtus.clickOnMainMenuButton();
      await pageOtus.clickWithWait(selectors.sidenav.ATIVIDADES_BUTTON);
      await pageOtus.waitLoad();

      const bottomMenuSelectors = ActivitiesPageSelectors.bottomMenuButtons;
      await pageOtus.clickWithWait(bottomMenuSelectors.ADD);
      await pageOtus.waitForExpandedAttributeValue(bottomMenuSelectors.ADD, true);
      await pageOtus.clickWithWait(bottomMenuSelectors.ATIVIDADE_ONLINE);
      await pageOtus.waitLoad();

      let checkbox = pageOtus.getNewCheckbox();
      await checkbox.clickAfterFindInList(0);
      await checkbox.clickAfterFindInList(1);
      await checkbox.clickAfterFindInList(2);
  });

  xtest('Add participant', async() => {

      await pageOtus.gotoUrl('http://localhost:3000/otus/app/#/participants-manager/participant-create');

      await pageOtus.typeWithWait('#name', 'Teste da Silva');

      let optionSelector = pageOtus.getNewOptionSelector();
      await optionSelector.selectOption('sex', 'F');
      await optionSelector.selectOption('center', 'RS');

      let calendar = pageOtus.getNewCalendar();
      await calendar.openAndSelectDate('Data de Nascimento', -3, -4, 25);

      await pageOtus.clickOnButtonByAttribute('ng-click', '$ctrl.saveParticipant()');
      await pageOtus.getNewDialog().clickOnCustomizedActionButton("OK");

      // confirm dialog
      await pageOtus.getNewDialogWarning().clickOnOkButton();
  });

  test('test checkbox', async() => {

      await pageOtus.clickWithWait(selectors.button.ATIVIDADES_CENTRO);
      await pageOtus.waitLoad();

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


  xtest('test html controllers', async() => {

      await pageOtus.clickWithWait(selectors.button.ATIVIDADES_CENTRO);
      await pageOtus.waitLoad();

      let optionSelector = pageOtus.getNewOptionSelector();
      await optionSelector.selectOption('select_5', 'MED3'); // 'Sigla'
      // await pageOtus.waitLoad();

      let calendar = pageOtus.getNewCalendar();
      await calendar.openAndSelectPeriod('Período Inicial', 0, -2);

      let checkbox = pageOtus.getNewCheckbox();
      await checkbox.clickByLabel('MG');
      await checkbox.clickByLabel('RS');
  });

})
*/
]; // end suiteArray