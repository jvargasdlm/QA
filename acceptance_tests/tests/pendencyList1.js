const lib = require ('../code/otus/lib');

let browser, pageOtus, selectors;
let suiteArray = [], errorLogger;
const PageElement = require('../code/classes/PageElement');


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



const ActivityQuestionAnswer = require('../code/otus/classes/activities/ActivityQuestionAnswer');
const PreviewPage = require('../code/otus/classes/PreviewPage');
const Button = require('../code/classes/Button');
const InputField = require('../code/classes/InputField');


suiteArray = [


    describe('Test Suite A', () => {

        xtest('Test expect PASS', async () => {
            let x = 1;
            expect(x).toBe(1);
        });

        xtest('Test expect FAIL', async () => {
            let x = 1;
            expect(x).toBe(0);
        });


        test('Test 1', async () => {
            await pageOtus.waitForMilliseconds(1000);
            var button = await pageOtus.page.$$("button[ng-click='$ctrl.loadActivityPlayer(item.activityInfo.recruitmentNumber, item.activityId)']"); //seleciona tadas as atividades
            await button[0].click();/*escolhe a primeira atividade*/
            await pageOtus.waitForMilliseconds(500);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.play()']");//clica em iniciar
            await pageOtus.waitForMilliseconds(500);
            var pergunta1 = await pageOtus.page.$$("md-radio-button[ng-click='$ctrl.blurOnClick()']"); //seleciona todas as perguntas
            await pergunta1[1].click();/*escolhe a segunda opção*/
            await pageOtus.waitForMilliseconds(500);
            var buttonAvancar = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            await buttonAvancar[1].click();//clica em avançar
            await pageOtus.waitForMilliseconds(500);
            var pergunta2 = await pageOtus.page.$$("md-radio-button[ng-click='$ctrl.blurOnClick()']"); //seleciona todas as perguntas
            await pergunta2[1].click();/*escolhe a segunda opção*/
            await pageOtus.waitForMilliseconds(500);
            var buttonAvancar2 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            await buttonAvancar2[1].click();//clica em avançar
            await pageOtus.waitForMilliseconds(500);
            var pergunta3 = await pageOtus.page.$$("md-radio-button[ng-click='$ctrl.blurOnClick()']"); //seleciona todas as perguntas
            await pergunta3[2].click();/*escolhe a terceira opção*/
            await pageOtus.waitForMilliseconds(500);
            var buttonAvancar3 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            await buttonAvancar3[1].click();//clica em avançar
            await pageOtus.waitForMilliseconds(500);
            var pergunta4 = await pageOtus.page.$$("md-radio-button[ng-click='$ctrl.blurOnClick()']"); //seleciona todas as perguntas
            await pergunta4[2].click();/*escolhe a terceira opção*/
            await pageOtus.waitForMilliseconds(500);
            var buttonAvancar4 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            await buttonAvancar4[1].click();//clica em avançar
            await pageOtus.waitForMilliseconds(500);
            var pergunta5 = await pageOtus.page.$$("md-radio-button[ng-click='$ctrl.blurOnClick()']"); //seleciona todas as perguntas
            await pergunta5[0].click();/*escolhe a primeira opção*/
            await pageOtus.waitForMilliseconds(500);
            var buttonAvancar5 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            await buttonAvancar5[1].click();//clica em avançar
            await pageOtus.waitForMilliseconds(500);
            var pergunta6 = await pageOtus.page.$$("md-radio-button[ng-click='$ctrl.blurOnClick()']"); //seleciona todas as perguntas
            await pergunta6[1].click();/*escolhe a segunda opção*/
            await pageOtus.waitForMilliseconds(500);
            var buttonAvancar6 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            await buttonAvancar6[1].click();//clica em avançar
            await pageOtus.waitForMilliseconds(500);
            var pergunta7 = await pageOtus.page.$$("md-radio-button[ng-click='$ctrl.blurOnClick()']"); //seleciona todas as perguntas
            await pergunta7[1].click();/*escolhe a segunda opção*/
            await pageOtus.waitForMilliseconds(500);            var buttonAvancar7 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            await buttonAvancar7[1].click();//clica em avançar
            await pageOtus.waitForMilliseconds(500);
            var pergunta8 = await pageOtus.page.$$("md-radio-button[ng-click='$ctrl.blurOnClick()']"); //seleciona todas as perguntas
            await pergunta8[2].click();/*escolhe a terceira opção*/
            await pageOtus.waitForMilliseconds(500);
            var buttonAvancar8 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            await buttonAvancar8[1].click();//clica em avançar
            await pageOtus.waitForMilliseconds(500);
            var pergunta9 = await pageOtus.page.$$("md-radio-button[ng-click='$ctrl.blurOnClick()']"); //seleciona todas as perguntas
            await pergunta9[2].click();/*escolhe a terceira opção*/
            await pageOtus.waitForMilliseconds(500);
            var buttonAvancar9 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            await buttonAvancar9[1].click();//clica em avançar
            await pageOtus.waitForMilliseconds(500);
            var pergunta10 = await pageOtus.page.$$("md-radio-button[ng-click='$ctrl.blurOnClick()']"); //seleciona todas as perguntas
            await pergunta10[0].click();/*escolhe a primeira opção*/
            await pageOtus.waitForMilliseconds(500);
            var buttonAvancar10 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            await buttonAvancar10[1].click();//clica em avançar
            await pageOtus.waitForMilliseconds(500);
            var pergunta11 = await pageOtus.page.$$("md-radio-button[ng-click='$ctrl.blurOnClick()']"); //seleciona todas as perguntas
            await pergunta11[1].click();/*escolhe a segunda opção*/
            await pageOtus.waitForMilliseconds(500);
            var buttonAvancar11 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            await buttonAvancar11[1].click();//clica em avançar
            await pageOtus.waitForMilliseconds(500);
            var pergunta12 = await pageOtus.page.$$("md-radio-button[ng-click='$ctrl.blurOnClick()']"); //seleciona todas as perguntas
            await pergunta12[2].click();/*escolhe a terceira opção*/
            await pageOtus.waitForMilliseconds(500);
            var buttonSair = await pageOtus.page.$$("button[ng-click='$ctrl.stop()']");
            await buttonSair[2].click();// botão sair da atividade
            await pageOtus.waitForMilliseconds(1000);
            await pageOtus.clickWithWait("button[ng-click='dialog.hide()']");//confirma saida da atividade
            await pageOtus.waitForMilliseconds(5000);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.launchSidenav()']");//botão na parte superior esquerda
            await pageOtus.waitForMilliseconds(3000);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.home()']");//inicio da pagina
            await pageOtus.waitForMilliseconds(5000);
            await pageOtus.clickWithWait("button[ ng-click='$ctrl.loadActivityViewer(item.activityInfo.recruitmentNumber, item.activityId)']");//clica em visualizar atividade
            await pageOtus.waitForMilliseconds(3000);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.exit()']");//clica em sair
            await pageOtus.waitForMilliseconds(3000);
            await pageOtus.clickWithWait("md-switch[ng-model='$ctrl.whichIsShowing']");//muda para as finalizadas
            await pageOtus.waitForMilliseconds(4000);
            var finalizadas1 = await pageOtus.page.$$("button[ng-click='$ctrl.loadActivityViewer(item.activityInfo.recruitmentNumber, item.activityId)']"); //seleciona tadas as atividades
            await finalizadas1[5].click();//escolhe a sexta atividade e seleciona visualizar
            await pageOtus.waitForMilliseconds(4000);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.exit()']");
            await pageOtus.waitForMilliseconds(4000);
            await pageOtus.clickWithWait("md-switch[ng-model='$ctrl.whichIsShowing']");//muda para as finalizadas
            await pageOtus.waitForMilliseconds(4000);
            var finalizadas2 = await pageOtus.page.$$("button[ng-click='$ctrl.loadActivityViewer(item.activityInfo.recruitmentNumber, item.activityId)']"); //seleciona tadas as atividades
            await finalizadas2[2].click();//escolhe a terceira atividade e seleciona visualizar
            await pageOtus.waitForMilliseconds(4000);
            await pageOtus.clickWithWait("button[ ng-click='$ctrl.showFilters()']");//seleciona o filtro
            await pageOtus.waitForMilliseconds(4000);
            await pageOtus.clickWithWait("button[ng-click='$ctrl.exit()']");//clica em sair
            await pageOtus.waitForMilliseconds(3000);































            //
            //
            // var buttonAvancar12 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar12[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(500);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(500);
            // var buttonAvancar13 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar13[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(500);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(500);
            // var buttonAvancar14 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar14[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(500);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(500);
            // var buttonAvancar15 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar15[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(500);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(500);
            // var buttonAvancar16 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar16[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(500);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(500);
            // var buttonAvancar17 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar17[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(500);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(500);
            // var buttonAvancar18 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar18[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(500);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(500);
            // var buttonAvancar19 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar19[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(500);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(500);
            // var buttonAvancar20 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar20[1].click();//clica em avançar

            //
            // var buttonAvancar21 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar21[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(1000);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(1000);
            // var buttonAvancar22 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar22[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(1000);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(1000);
            // var buttonAvancar23 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar23[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(1000);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(1000);


            // await pageOtus.waitForMilliseconds(5000);
            // var buttonAvancar24 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar24[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(5000);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(5000);
            // var buttonAvancar25 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar25[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(5000);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(5000);
            // var buttonAvancar26 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar26[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(5000);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(3000);
            // var buttonAvancar27 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar27[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(3000);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(3000);
            // var buttonAvancar28 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar28[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(3000);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(3000);
            // var buttonAvancar29 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar29[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(3000);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(3000);
            // var buttonAvancar30 = await pageOtus.page.$$("button[ng-click='$ctrl.goAhead()']"); //seleciona em avançar
            // await buttonAvancar30[1].click();//clica em avançar
            // await pageOtus.waitForMilliseconds(3000);
            // await pageOtus.clickWithWait("md-radio-button[ ng-click='$ctrl.blurOnClick()']");//seleciona uma opção
            // await pageOtus.waitForMilliseconds(3000);



















        });

    })

];
