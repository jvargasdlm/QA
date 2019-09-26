const ParentLib      = require('../ParentLib');
const utils          = require('../utils');
const FileHandler    = require('../handlers/FileHandler');
const PageOtusStudio = require('./classes/PageOtusStudio');
const TemplatesPage  = require('./classes/TemplatesPage');
const Template       = require('./classes/Template');

// *****************************************************************
// Constants and variables

const MAIN_PAGE = 'http://localhost:3000/otus-studio/app/index.html#/login';
const DATA_OTUS_STUDIO_DIR_PATH = '/data/otus-studio/';

let selectors =  {
    button: {
        VISITANTE: "button[ng-click='loginController.visitAccess()']"
    }
};

// *****************************************************************
// Auxiliar Functions

let logged = false;

async function enterAsVisitingBeforeAll(pageOtusStudio){
    if(!logged){
        await pageOtusStudio.gotoUrl(MAIN_PAGE);
        await pageOtusStudio.clickWithWait(selectors.button.VISITANTE);
        logged = true;
    }
}

async function extractPathsToDownloadAndGetTemplatesObj(templatesPage, templateDirPath) {
    let templatesDict = {};
    let paths = [];
    const relativePaths = FileHandler.getDirFiles(templateDirPath);
    for(let path of relativePaths){
        let key = path.split('_')[0];
        path = templateDirPath + path;
        templatesDict[key] = new Template(path);
        await templatesDict[key].setAcronymFromJsonFile();
        paths.push(path);
    }
    console.log('Uploading templates ...');
    await templatesPage.openMenu();
    await templatesPage.uploadsHeadLess(paths);
    console.log('Upload finished.');
    return templatesDict;
}

// *****************************************************************

class OtusStudioLib {

    static async doBeforeAll(suiteArray){
        let [browser, page] = await ParentLib.doBeforeAll(suiteArray);
        let pageOtusStudio = new PageOtusStudio(page);
        await enterAsVisitingBeforeAll(pageOtusStudio);
        let templatesPage = new TemplatesPage(page);
        return [browser, templatesPage, templatesPage.errorLogger];
    }

    static async doBeforeAllAndUploadTemplates(suiteArray){
        let [browser, templatesPage, errorLogger] = await OtusStudioLib.doBeforeAll(suiteArray);
        const currSpecFileName = errorLogger.currSpecFileName;
        const dirPath = process.cwd() + DATA_OTUS_STUDIO_DIR_PATH + currSpecFileName + '/';
        let templatesDict = await extractPathsToDownloadAndGetTemplatesObj(templatesPage, dirPath);
        return [browser, templatesPage, errorLogger, templatesDict];
    }

    static async goBackToMenuAndOpenTemplate(templatesPage, templateAcronym){
        await templatesPage.openMenu();
        return await templatesPage.openTemplate(templateAcronym); // returns editorPage
    }

    static async downloadAndReadJson(editorPage){
        await editorPage.toolbar.clickExportButton();
        const path = utils.mainConstants.paths.DOWNLOADS_DIR_PATH + '/surveyTemplate.json';
        const content = await FileHandler.readJson(path);
        FileHandler.delete(path);
        return content;
    }

    static async downloadAndReadJsonAttribute(editorPage, attributeName){
        await editorPage.toolbar.clickExportButton();
        const path = utils.mainConstants.paths.DOWNLOADS_DIR_PATH + '/surveyTemplate.json';
        const content = await FileHandler.readJsonAttribute(path, attributeName);
        FileHandler.delete(path);
        return content;
    }

    static async assertTemplatesNumber(templatesPage, templatesDict){
        await templatesPage.waitForMilliseconds(1000); // wait last template show up
        const expectedNumber = Object.entries(templatesDict).length;
        console.log('Counting uploaded templates ... must to have', expectedNumber);
        let numUploadedTemplates = await templatesPage.getNumTemplates();
        expect(numUploadedTemplates).toBe(expectedNumber);
    }
}

module.exports = OtusStudioLib;
