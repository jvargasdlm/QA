const lib = require ('../code/otus/lib');

let browser, pageOtus, selectors;
let suiteArray = [], errorLogger;


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



const ActivityQuestionAnswer = require('../code/otus/classes/activities/ActivityQuestionAnswer')
const PreviewPage = require('../code/otus/classes/PreviewPage')

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
          await pageOtus.waitForMilliseconds(2000);
          await pageOtus.clickWithWait("button[ng-if='attrs.showParticipantsButton']")/*exibe os todos*/
          await pageOtus.waitLoad();
          var button = await pageOtus.page.$$("button[aria-label='Ver participante']")/*seleciona todos participante*/
          await button[0].click();/*escolhe o segundo participante*/
          await pageOtus.clickWithWait("button[ng-click='$ctrl.launchSidenav()']")/*abre a aba superior esquerda*/
          await pageOtus.waitLoad();
          await pageOtus.waitForMilliseconds(3000);
          await pageOtus.clickWithWait("button[ng-click='$ctrl.loadParticipantActivities()']")/*seleciona as atividades*/
          await pageOtus.waitForMilliseconds(3000);
          await pageOtus.typeWithWait("input[ng-model='$ctrl.filter']", "csj");
          await pageOtus.waitForMilliseconds(5000)


          async function getInertext() {
              const mySelector = "span[ng-if='!column.specialField']";
              const myIndex = 3;
              return await pageOtus.page.evaluate(
                  (selector, index) => {
                      const element = (document.body.querySelectorAll(selector))[index];
                      return element.innerText;
                  },
                  mySelector, myIndex);


          }

          let text = await getInertext();
          let estaFinalizado = (text === "Finalizado");
          console.log("Finalizado");
          expect(estaFinalizado).toBe(true)


          // Fill
          //const previewPage = new PreviewPage(pageOtus.page);
          //await previewPage.fillActivityQuestions(answersArr);

          // estamos de volta na pagina de atividades

          //let estahFinalizado = await verSeEstahFinalizado();
          // expect(estahFinalizado).toBe(true);

          //const mySelector = 'blablabla';
          //         const myIndex = 2;
          //         const text = await pageOtus.page.evaluate((selector, index) => {
          //            const element = (document.body.querySelectorAll(selector))[index];
          //            return element.innerText;
          //         }, mySelector, myIndex);

      });
  })


  ];// end suiteArray