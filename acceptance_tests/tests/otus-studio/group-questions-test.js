const lib = require('../../code/otus-studio/lib');

let browser, templatesPage, editorPage;
let suiteArray=[], errorLogger, templatesDict;

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

const Question      = require('../../code/otus-studio/classes/Question');
const Group         = require('../../code/otus-studio/classes/Group');
const GroupButton   = require('../../code/otus-studio/classes/GroupItem');
const groupItemState = GroupButton.stateItemEnum;

// *****************************************************************
// Auxiliar Functions

async function createGroup(firstQuestionNumber, lastQuestionNumber){
    let firstQuestion = await Question.getInstanceAndInit(editorPage, firstQuestionNumber);
    let lastQuestion = await Question.getInstanceAndInit(editorPage, lastQuestionNumber);
    let group = new Group(editorPage);
    await group.create(firstQuestion, lastQuestion);
    return group;
}

async function assertGroupCreatedSuccessfully(group, index=0){
    await group.assertGroupCreatedSuccessfully();
    let jsonObjArr = await lib.downloadAndReadJsonAttribute(editorPage, editorPage.getJsonFields().groupList);
    await group.assertWithJsonObject(jsonObjArr[index]);
}

async function assertGroupIsEmptyAtJson(group, index=0){
    let jsonObjArr = await lib.downloadAndReadJsonAttribute(editorPage, editorPage.getJsonFields().groupList);
    await group.assertIAmEmpty(jsonObjArr);
}

// *****************************************************************
// Tests
/*
    Included by scenarios #2 and #3
    4) Dado que um usuário editor de template
    Quando criar um bloco
    Então as questões do meio do bloco não podem ser origem ou destino de um pulo
    E a rota destino de cada questão do meio deve manter a ordem consecutiva das questões do bloco
*/

suiteArray = [

    describe('Group Question Tests - Scenario #1: A group question not can be source/destination of 2 or more questions', () => {

        /*
        1) Dado que um usuário editor de template
        Quando criar um bloco
        Então o sistema não permite incluir questões que sejam origem e destino de 2 ou mais questões.
         */

        let tryCreateGroupWithQuestionWithMultipleSourcesANDDestinations = async function (template) {
            editorPage = await lib.goBackToMenuAndOpenTemplate(templatesPage, template.acronym);
            let firstQuestion  = await Question.getInstanceAndInit(editorPage, 3);
            let middleQuestion = await Question.getInstanceAndInit(editorPage, 4); // source/destination of 2+ questions
            let lastQuestion   = await Question.getInstanceAndInit(editorPage, 5);

            let questions = [firstQuestion, middleQuestion, lastQuestion];
            for(let question of questions){
                await question.clickOnGroupItemButton();
                await question.assertState(groupItemState.INVALIDATE);
            }
        };

        test('1.1 question with 2 sources and 2 destinations', async () => {
            await tryCreateGroupWithQuestionWithMultipleSourcesANDDestinations(templatesDict['scenario1-1']);
        });

        test('1.2 question with 3 sources and 3 destinations', async () => {
            await tryCreateGroupWithQuestionWithMultipleSourcesANDDestinations(templatesDict['scenario1-2']);
        });
    }),

    describe('Group Question Tests - Scenario #2: Question SOURCE of 2 or more questions', () => {
        /*
        2) Dado que um usuário editor de template
        Quando criar um bloco
        Então a primeira questão do bloco não pode ser a ORIGEM de 2 ou mais questões.
         */
        let tryCreateGroupWhereFirstQuestionIsMultipleSource = async function(template, questionNumber){
            editorPage = await lib.goBackToMenuAndOpenTemplate(templatesPage, template.acronym);
            let firstQuestion = await Question.getInstanceAndInit(editorPage, questionNumber); // source of 2 or more questions
            await firstQuestion.clickOnGroupItemButton();
            await firstQuestion.assertState(groupItemState.INVALIDATE); //<< INVALIDATE
        };

        test('2.1 First group question can not be source of 2 questions', async() => {
            await tryCreateGroupWhereFirstQuestionIsMultipleSource(templatesDict['scenario2'], 3);
        });

        test('2.2 First group question can not be source of 3 questions', async() => {
            await tryCreateGroupWhereFirstQuestionIsMultipleSource(templatesDict['scenario2'], 7);
        });

        // ... mas questao ORIGEM de 2ou+ pode ser a ultima do bloco
        let createGroupWhereLastQuestionIsMultipleSource = async function(template, firstQuestionNumber, lastQuestionNumber){
            editorPage = await lib.goBackToMenuAndOpenTemplate(templatesPage, template.acronym);
            let group = await createGroup(firstQuestionNumber, lastQuestionNumber);
            await assertGroupCreatedSuccessfully(group);
        };

        test('2.3 Last group question can be source of 2 questions', async() => {
            await createGroupWhereLastQuestionIsMultipleSource(templatesDict['scenario2'], 2, 3);
        });

        test('2.4 Last group question can be source of 3 questions', async() => {
            await createGroupWhereLastQuestionIsMultipleSource(templatesDict['scenario2'],6, 7);
        });
    }),

    describe('Group Question Tests - Scenario #3: Question DESTINATION of 2 or more questions', () => {

        /*
        3) Dado que um usuário editor de template
        Quando criar um bloco
        Então a última questão do bloco não pode ser o DESTINO de 2 ou mais questões.
        */
        let tryCreateGroupWhereLastQuestionHasMultipleDestinations = async function(template, firstQuestionNumber, lastQuestionNumber){
            editorPage = await lib.goBackToMenuAndOpenTemplate(templatesPage, template.acronym);
            let firstQuestion = await Question.getInstanceAndInit(editorPage, firstQuestionNumber);
            let lastQuestion = await Question.getInstanceAndInit(editorPage, lastQuestionNumber);// destination of 2 or more questions
            await firstQuestion.clickOnGroupItemButton();
            await firstQuestion.assertState(groupItemState.EDITOR_SAVE);
            await lastQuestion.assertState(groupItemState.CREATE); // unavailable to add to group
        };

        test('3.1 Question with 2 destinations can not be the last group question', async() => {
            await tryCreateGroupWhereLastQuestionHasMultipleDestinations(templatesDict['scenario3'],2, 5);
        });

        test('3.2 Question with 3 destinations can not be the last group question', async() => {
            await tryCreateGroupWhereLastQuestionHasMultipleDestinations(templatesDict['scenario3'], 6, 9);
        });

        // ... mas questao DESTINO de 2ou+ pode ser a primeira do bloco
        let createGroupWhereFirstQuestionHasMultipleDestinations = async function(template, firstQuestionNumber, lastQuestionNumber){
            editorPage = await lib.goBackToMenuAndOpenTemplate(templatesPage, template.acronym);
            let firstQuestion = await Question.getInstanceAndInit(editorPage, firstQuestionNumber);  // destination of 2 or more questions
            let lastQuestion = await Question.getInstanceAndInit(editorPage, lastQuestionNumber);
            await firstQuestion.assertState(groupItemState.CREATE);
            let group = new Group(editorPage);
            await group.create(firstQuestion, lastQuestion);
            await assertGroupCreatedSuccessfully(group);
        };

        test('3.3 Question with 2 destinations can be the first group question', async() => {
            await createGroupWhereFirstQuestionHasMultipleDestinations(templatesDict['scenario3'], 5, 6);
        });

        test('3.4 Question with 3 destinations can be the first group question', async() => {
            await createGroupWhereFirstQuestionHasMultipleDestinations(templatesDict['scenario3'], 11, 12);
        });

    }),

    describe('Group Question Tests - Scenario #5: Move questions', () => {

        /*
        5) Dado que um usuário editor de template
        Quando tentar mover qualquer questão do formulário para dentro do bloco
        Então o sistema não deixa fazer isto, permanecendo tudo imutável
         */
        async function assertQuestionUnchanged(question, acronym, expectedState){
            expect(question.templateId).toBe(acronym+`${question.number}`);
            await question.assertState(expectedState);
        }

        test('5. It may not be possible move question to inside group', async() => { // NOT ANY MORE, ALL STAY AS SAME

            let acronym = templatesDict['scenario5'].acronym;
            editorPage = await lib.goBackToMenuAndOpenTemplate(templatesPage, acronym);

            // make group 2-8
            let group = await createGroup(2, 8);
            await assertGroupCreatedSuccessfully(group);

            // move 9 after 4
            let questionOut = await Question.getInstanceAndInit(editorPage, 9);
            const moveSuccess = await questionOut.moveToAfterAndReset(4);
            expect(moveSuccess).toBeFalse();

            // check if any thing change (states and positions)
            await assertQuestionUnchanged(group.getFirstQuestion(), acronym, groupItemState.SAVED_EDITOR);
            for(let question of group.getTailQuestions()){
                await assertQuestionUnchanged(question, acronym, groupItemState.SAVED_ITEM);
            }

            await assertQuestionUnchanged(questionOut, acronym, groupItemState.CREATE);
        })
    }),

    describe('Group Question Tests - Scenario #6: Delete group', () => {
        /*
        6) Dado que um usuário editor de template
        Quando deletar um bloco
        Então o sistema deve excluir o bloco
        E cada questao deve voltar a ser visualizada em telas separadas
         */
        test('6. Delete group', async() => {
            editorPage = await lib.goBackToMenuAndOpenTemplate(templatesPage, templatesDict['scenario6'].acronym);
            // make group 2-5
            let firstQuestion = await Question.getInstanceAndInit(editorPage, 2);
            let lastQuestion = await Question.getInstanceAndInit(editorPage, 5);
            let group = new Group(editorPage);
            await group.create(firstQuestion, lastQuestion);
            //await assertGroupCreatedSuccessfully(group);
            // delete and check
            let oldQuestions = await group.delete();
            for(let question of oldQuestions){
                await question.assertState(groupItemState.CREATE);
            }
            await assertGroupIsEmptyAtJson(group);
        });
    }),

    describe('Group Question Tests - Scenarios #7,#8: Edit group', () => {

        /*
        7)
        Dado que um usuário editor de template
        Quando editar um bloco
        E adicionar mais questoes
        Então o sistema deve incluir questoes adicionadas no bloco
        E estas questoes incluidas devem ser visualizadas na mesma pagina
         */
        test('7. Add questions in group', async() => {

            editorPage = await lib.goBackToMenuAndOpenTemplate(templatesPage, templatesDict['scenario7'].acronym);
            let group = await createGroup(2, 5);

            let newLastQuestion = await Question.getInstanceAndInit(editorPage, 8);
            await group.addQuestionsUntil(newLastQuestion);

            const firstQuestion = group.getFirstQuestion();
            expect(group.getNumQuestions()).toBe(newLastQuestion.number - firstQuestion.number + 1);
            await firstQuestion.assertState(groupItemState.SAVED_EDITOR);

            let number = firstQuestion.number + 1;
            for(let question of group.getTailQuestions()){
                question.assertNumber(number++);
                await question.assertState(groupItemState.SAVED_ITEM);
            }
        });

        /*
        8)
        Dado que um usuário editor de template
        Quando editar um bloco
        E excluir questões
        Então o sistema deve excluir questões do bloco
        E estas devem ser visualizadas em paginas diferentes
         */
        test('8. Delete questions from group', async() => {

            editorPage = await lib.goBackToMenuAndOpenTemplate(templatesPage, templatesDict['scenario8'].acronym);
            let group = await createGroup(2, 8);

            //let newLastQuestion = await Question.getInstanceAndInit(editorPage, 5);
            let oldQuestions = await group.excludeQuestionsAfter(5);
            let newLastQuestion = group.getLastQuestion();

            const firstQuestion = group.getFirstQuestion();
            expect(group.getNumQuestions()).toBe(newLastQuestion.number - firstQuestion.number + 1);
            await firstQuestion.assertState(groupItemState.SAVED_EDITOR);

            let number = firstQuestion.number + 1;
            for(let question of group.getTailQuestions()){
                question.assertNumber(number++);
                await question.assertState(groupItemState.SAVED_ITEM);
            }

            number = newLastQuestion.number + 1;
            for(let question of oldQuestions){
                question.assertNumber(number++);
                await question.assertState(groupItemState.CREATE);
            }

            await assertGroupCreatedSuccessfully(group);
        });
    }),

    describe('Group Question Tests - Scenario #9: Delete group question no deviation', () => {

        beforeAll(async () => {
            editorPage = await lib.goBackToMenuAndOpenTemplate(templatesPage, templatesDict['scenario9'].acronym);
        });

        async function createGroupWith2QuestionsAndDeleteQuestion(firstQuestionNumber, lastQuestionNumber, questionNumberToDelete) {
            let group = await createGroup(firstQuestionNumber, lastQuestionNumber);
            let templateIdsBeforeDelete = group.getQuestionsTemplateIds();
            const firstQuestion = await group.deleteQuestion(questionNumberToDelete);
            const templateIdIndex = (questionNumberToDelete === firstQuestionNumber ? 1 : 0);
            await firstQuestion.assert(firstQuestionNumber, templateIdsBeforeDelete[templateIdIndex], groupItemState.CREATE);
            await assertGroupIsEmptyAtJson(group);
        }

        /*
        9.1)
        Dado que um usuário editor de template
        Quando excluir uma questão de um grupo com 2 questões
        Então o sistema deve excluir a questão e o grupo
        E atualizar a outra questão como disponível para edição de grupo
        */
        test('9.1a Delete first question inside group with 2 questions', async () => {
            await createGroupWith2QuestionsAndDeleteQuestion(18, 19, 18);
        });

        test('9.1b Delete last question inside group with 2 questions', async () => {
            await createGroupWith2QuestionsAndDeleteQuestion(14, 15, 15);
        });

        // -------------------------------------------------------------------------------------------------
        // 3 or + questions

        async function createGroupAndDeleteQuestionFromHim(firstQuestionNumber, lastQuestionNumber, questionNumberToDelete) {
            let group = await createGroup(firstQuestionNumber, lastQuestionNumber);
            const templateIdsBeforeDelete = group.getQuestionsTemplateIds();
            await group.deleteQuestion(questionNumberToDelete);

            const firstQuestion = group.getFirstQuestion();
            firstQuestion.assertNumber(firstQuestionNumber);
            await firstQuestion.assertState(groupItemState.SAVED_EDITOR);

            const deleteFirstQuestion = (questionNumberToDelete === firstQuestionNumber ? 1 : 0);
            let number = questionNumberToDelete + deleteFirstQuestion;
            let templateIdIndex = questionNumberToDelete - firstQuestionNumber + 1 + deleteFirstQuestion;
            for (let question of group.getTailQuestions()) {
                await question.assert(number++, templateIdsBeforeDelete[templateIdIndex++], groupItemState.SAVED_ITEM);
            }

            await assertGroupCreatedSuccessfully(group);
        }

        /*
        9.2a)
        Dado que um usuário editor de template
        Quando excluir uma questao de um grupo com mais de 2 questões
        Então o sistema deve excluir a questão
        E manter o grupo com as questões restantes
        */
        test('9.2a Delete question inside group with 3 or more questions', async () => {
            await createGroupAndDeleteQuestionFromHim(8, 10, 9);
        });

        /*
        9.2b)
        Dado que um usuário editor de template
        Quando excluir a primeira questao de um grupo com mais de 2 questões
        Então o sistema deve excluir a questão
        E manter o grupo com as questões restantes
        E atualizar o estado de grupo da segunda questão
        */
        test('9.2b Delete first question inside group with 3 or more questions', async () => {
            await createGroupAndDeleteQuestionFromHim(2, 4, 2);
        });

    }),

    xdescribe('Group Question Tests - Scenario #10: Delete group extreme question ', () => {

        /*
       10)
       Dado que um usuário editor de template
       Quando excluir a primeira questao de um grupo que é destino de um desvio
       Então o sistema deve excluir a questão
       E manter o grupo com as questões restantes
       E atualizar o estado de grupo da segunda questão
       E redirecionar o desvio para esta questão
        */
        test('10. Delete first group question that is a 2x destination', async () => {
            console.log(":D");
        });
    })

]; // end suiteArray
