const PageOtusStudio  = require('./PageOtusStudio');
const EditorPage      = require('./EditorPage');
const Dialog          = require('../../classes/Dialog');
const utils           = require('../../utils');
const FileHandler     = require('../../handlers/FileHandler');
const KeyboardHandler = require('../../handlers/KeyboardHandler');

const selectors = {
    button: {
        MENU: '#surveyforms-menu',
        ADD:  'md-fab-trigger > button', //"button[aria-label='menu']", //
        NEW: "button[aria-label='novo']",
        UPLOAD: "button[aria-label='upload']",
        TEMPLATE: 'survey-template',
        ABRIR_EDITOR: "button[aria-label='Abrir Editor']",
        OPCOES: "button[ng-click='$mdOpenMenu($event)']",
        EXCLUIR: "button[aria-label='excluir']",
        EXPORTAR: "button[aria-label='exportar']"
    },
    input:{
        SEARCH: "input[aria-label='search']"
    }
};

// *********************************************************
// Private Functions

function _addOptionsSelector(beHidden) {
    return `md-fab-actions[aria-hidden='${beHidden}']`;
}

async function _initEditorPage(page){
    let editorPage = new EditorPage(page);
    await editorPage.init();
    return editorPage;
}

// *********************************************************

class TemplatesPage extends PageOtusStudio {

    constructor(page){
        super(page);
    }

    async openMenu(){
        //console.log('lets open templates menu');//.
        await this.clickOnMainMenuButton();
        await this.clickWithWait(selectors.button.MENU);
        await this.waitForSelector(selectors.input.SEARCH);
        //console.log('\ttemplates menu opened');
    };

    async openTemplate(templateAcronym){
        await this.clickOn(templateAcronym);
        await this.clickWithWait(selectors.button.ABRIR_EDITOR);
        return await _initEditorPage(this.page);
    }

    async clickOnAddTemplateAndWaitOptions(){
        //await utils.pageHasElementSelector(selectors.button.ADD);
        await this.clickWithWait(selectors.button.ADD); // '+' button
        await utils.wait.forMilliseconds(5000);//.

        let selector = _addOptionsSelector(false); // options must be visible
        await this.waitForSelector(selector);
    }

    async create(name, acronym){
        await this.clickOnAddTemplateAndWaitOptions();
        await this.hasElementSelector(selectors.button.NEW);//.
        await utils.wait.forMilliseconds(10000);// without does not work (why?)

        await this.clickWithWait(selectors.button.NEW); // 'Criar' button
        let dialog = new Dialog(this);
        await dialog.waitForOpen();
        const nameInputSelector = "input[ng-model='newSurveyForm.name']";
        await this.waitForSelector(nameInputSelector);
        await this.page.type(nameInputSelector, name);
        await this.page.type('input[ng-model="newSurveyForm.acronym"]', acronym);
        await this.clickWithWait(`button[ng-disabled='newSurveyForm.$invalid']`); // "CRIAR FORMULARIO" button
        await dialog.waitForClose();
        return await _initEditorPage(this.page);
    }

    async uploadHeadFull(path){
        await this.clickOnAddTemplateAndWaitOptions();
        await this.clickWithWait(selectors.button.UPLOAD);
        await KeyboardHandler.sendTextAfterWait(); // wait OS file dialog load
        await KeyboardHandler.sendEnterKey();
        await utils.wait.forMilliseconds(500+500); // wait OS file dialog close AND template appear on list
    }

    async uploadsHeadFull(templatesObj, check=false){
        await this.openMenu();
        for (let [key,template] of Object.entries(templatesObj)){
            let path = template.path;
            await this.uploadHeadFull(path, template.acronym, check);
        }
        //await this.waitForSelector(addOptionsSelector(true));
    }

    async uploadsHeadLess(filePaths) {
        await uploadByIndexedDBForHeadless(this.page, filePaths);
        await utils.wait.forSeconds(2);
        await this.refresh();
        await this.waitForSelector(selectors.button.TEMPLATE);
    }

    async clickOn(templateAcronym){
        await this.typeWithWait(selectors.input.SEARCH, templateAcronym);
        let elements = await this.page.$$(selectors.button.TEMPLATE);
        let maxAttempts = 100, attempt = 1;
        while(elements.length !== 1 && attempt <= maxAttempts){
            elements = await this.page.$$(selectors.button.TEMPLATE);
            attempt++;
            //console.log(`num elems = ${elements.length}, attempt = ${attempt-1}`);//.
        }
        await elements[0].click();
    };

    async delete(templateAcronym){
        await this.clickOn(templateAcronym);
        await this.clickWithWait(selectors.button.OPCOES);
        await this.clickWithWait(selectors.button.EXCLUIR);
    };

    async export(templateAcronym){
        await this.clickOn(templateAcronym);
        await this.clickWithWait(selectors.button.OPCOES);
        await this.clickWithWait(selectors.button.EXPORTAR);
    };

    async goBackToTemplatesMainPage(){
        await this.page.goBack();
        await this.waitForSelector(selectors.input.SEARCH);
    };

    // ----------------------------------------------------
    // Debug

    async getNumTemplates() {
        let templateList = await this.page.$$(selectors.button.TEMPLATE);
        try {
            return templateList.length;
        }
        catch (e) {
            console.log(e);
            return -1;
        }
    };
}

// ***********************************************************************
// UPLOAD BY DIRECT INSERTION IN BROWSER INDEXEDDB

let uploadByIndexedDBForHeadless = async function(page, pathArray){

    const templates = [];
    for(let [key, path] of Object.entries(pathArray)) {
        let template = await FileHandler.readJson(path);
        templates.push({
            template_oid: template.oid,
            contributor: "visitor",
            template: template
        });
    }

    await page.evaluate((templates) => {
        const DB_NAME = 'otus-studio';
        const STORE_NAME = 'survey_template';
        const KEY_PATH = 'template_oid';

        let request = window.indexedDB.open(DB_NAME, 1);
        let db;
        request.onsuccess = function(event) {
            let db = event.target.result;
            let transaction = db.transaction(STORE_NAME, 'readwrite');
            // add success event handleer for transaction, you should also add onerror, onabort event handlers
            transaction.onsuccess = function(event) {
                console.log('[Transaction] ALL DONE!');
            };

            // get store from transaction, returns IDBObjectStore instance
            let objectStore = transaction.objectStore(STORE_NAME);

            // put templates data in objectStore
            templates.forEach(function(template){
                let db_op_req = objectStore.add(template); // IDBRequest

                db_op_req.onsuccess = function(event) {
                    //console.log(event.target.result == template.key); // true
                };
                db_op_req.onerror = function(event) {
                    // handle error
                };
            });
        };

        request.onerror = function(event) {
            console.log('[onerror]', request.error);
        };

        request.onupgradeneeded = function(event) {
            db = event.target.result;
            let store = db.createObjectStore(STORE_NAME, {keyPath: KEY_PATH});
            store.createIndex('contributor_idx', 'contributor', {unique: true});
        };
    }, templates);
};


module.exports = TemplatesPage;