const assert = require('assert');
const lib = require('../../code/otus-studio/lib');
const Question = require('../../code/otus-studio/classes/Question');

const FileHandler = require('../../code/handlers/FileHandler');

let browser, page, pageOtus, templatesPage;

beforeAll(async () => {
    [browser, page, pageOtus, templatesPage] = await lib.doBeforeAll();
});

beforeEach(async() => {
    console.log('START TEST *******************');
});

afterEach(async() => {
    console.log('END TEST');
});

afterAll(async () => {
    await browser.close();
});

// *****************************************************************
// Tests 

describe('Otus Studio Test', () => {

  // prepare variables for test
  let createVariable = function(name, label, sending, customizationsValueLabel){
      let arr = Array.from(customizationsValueLabel, x => `${x.value} para: ${x.label}`);
      let customizationPresentation = arr.join('; ');
      return {
          "name": name,
          "label": label,
          "sending": sending,
          "customizations": customizationsValueLabel,
          "customizationPresentation": customizationPresentation
      };
  };

  let VAR1 = createVariable('VAR1', 'Paciente tem diabetes.', '4', [
      {value: '1', label: 'sim'},
      {value: '0', label: 'nao'}]);
  let VAR2 = createVariable('VAR2', 'bla bla bla', '2', [
      {value: '1', label: 'concordo plenamente'},
      {value: '2', label: 'concordo parcialmente'},
      {value: '3', label: 'não concordo nem discordo'},
      {value: '4', label: 'discordo parcialmente'},
      {value: '5', label: 'discordo plenamente'}]);
  let VARIABLES = [VAR1, VAR2];

  // auxiliar functions

  let addVariable = async function(variable){
      await page.type('#inputNewVariableName', variable.name);
      await page.type('#inputNewVariableLabel', variable.label);
      await page.type('#inputNewVariableSending', variable.sending);
      await page.click('#inputNewVariableHasCustom'); // "Sim"

      for (let i = 0; i < variable.customizations.length; i++) {
          let v = variable.customizations[i];
          await page.waitForSelector('#inputNewCustomValue');
          await page.type('#inputNewCustomValue', v.value);
          await page.type('#inputNewCustomLabel', v.label);
          await page.click('#buttonAddNewCustom');
      }

      await pageOtus.clickWithWait('#buttonSave');
  };

  let checkAssertionsOnJsonFile = async function(){
      let path = process.cwd() + process.env.DOWNLOADS_LOCAL_DIR_PATH + '/surveyTemplate.json';
      let requiredAttr = 'staticVariableList';
      let data = await FileHandler.readJsonAttribute(path, requiredAttr);

      assert.equal(VARIABLES.length, data.length);

      for (let i = 0; i < VARIABLES.length; i++) {
          assert.equal(VARIABLES[i].name, data[i].name);
          assert.equal(VARIABLES[i].label, data[i].label);
          assert.equal(VARIABLES[i].sending, data[i].sending);
          assert.equal(VARIABLES[i].customizations.length, data[i].customizations.length);

          for (let j = 0; j < VARIABLES[i].customizations.length; j++) {
              assert.equal(VARIABLES[i].customizations[j].value, data[i].customizations[j].value);
              assert.equal(VARIABLES[i].customizations[j].label, data[i].customizations[j].label);
          }
      }
  };

  it('Create form with customized variables', async () => {

      await templatesPage.openMenu();
      let editorPage = await templatesPage.create('form test', 'TEST');

      // add custom variables
      await editorPage.clickOnResource();
      for (let i = 0; i < VARIABLES.length; i++) {
        await addVariable(VARIABLES[i]);
      }

      // create one single question to be possible export
      await editorPage.clickOnEdition();
      await (new Question(editorPage, 1)).create(Question.typeEnum.NUMERO_INTEIRO);

      // save and download json
      const toolbar = editorPage.toolbar;
      await toolbar.clickSaveButton();
      await toolbar.clickExportButton();

      console.log('check json');
      await checkAssertionsOnJsonFile();
  });
});



