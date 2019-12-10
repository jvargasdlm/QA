const utils = require('../../code/utils');
const lib = require('../../code/otus-studio/lib');

const Question = require('../../code/otus-studio/classes/Question');
const Template = require('../../code/otus-studio/classes/Template');

let browser, templatesPage;
let suiteArray=[], specArray=[], specIndex = 0, wrongAssertionLogs = [];

beforeAll(async () => {
    [browser, templatesPage, specArray] = await lib.doBeforeAll(suiteArray);
});

beforeEach(async() => {
    console.log('START TEST\n', specArray[specIndex].description);
});

afterEach(async () => {
    specIndex++;
});

afterAll(async () => {
    await browser.close();
    wrongAssertionLogs.forEach((log) => console.error(log));
});

// *****************************************************************
// Tests

suiteArray = [

describe('Move Question', () => {
    
    let questionTemplateIdOrder = [];
    let editorPage = null;
    let acronym = '', actionCounter=0;

    async function checkQuestionsOrder(message){
        let questions=[],  arr = [];
        for (let i = 0; i < questionTemplateIdOrder.length; i++) {
            let question = await Question.getInstanceAndInit(editorPage, i+1);
            questions.push(question);
            arr.push(question.templateId.replace(acronym, ''));
        }
        console.log(`${message}\n${arr.join(' ')}`);
        await editorPage.screenshot(`${++actionCounter}-${message}.png`);

        for (let i = 0; i < questionTemplateIdOrder.length; i++) {
            expect(questions[i].templateId).toBe(acronym+`${questionTemplateIdOrder[i]}`);
        }
    }

    it('Move Questions', async() => {
        const path = process.cwd() + '/data/' + '10questionsMainRoutes.json';
        let template = new Template(path);
        await template.setAcronymFromJsonFile();
        acronym = template.acronym;

        await templatesPage.openMenu();
        await templatesPage.uploadsHeadLess([path]);
        editorPage = await templatesPage.openTemplate(acronym);
        let editionTabPage = editorPage.activeTabPage;

        await editionTabPage.moveQuestionToAfter(3,5);
        questionTemplateIdOrder = [1, 2, 4, 5, 3, 6, 7, 8, 9, 10];
        await checkQuestionsOrder('q3 to after q5');

        await editionTabPage.moveQuestionToBegin(2);
        questionTemplateIdOrder = [2, 1, 4, 5, 3, 6, 7, 8, 9, 10];
        await checkQuestionsOrder('q2 to BEGIN');

        await editionTabPage.moveQuestionToAfter(8,4);
        questionTemplateIdOrder = [2, 1, 4, 5, 8, 3, 6, 7, 9, 10];
        await checkQuestionsOrder('q4 to after q8');

        await editionTabPage.deleteQuestion(3);
        questionTemplateIdOrder = [2, 1, 5, 8, 3, 6, 7, 9, 10];
        await checkQuestionsOrder('delete q2');
    });

})

]; // end suiteArray