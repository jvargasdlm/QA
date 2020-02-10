const BrowserHandler = require('../../code/handlers/BrowserHandler.js');
let browser, page;
const url = 'https://www.sicredi.com.br/html/ferramenta/simulador-investimento-poupanca/';
const TIMEOUT_PER_TEST = 60000;

const selectors = {
        EMAIL_INPUT: 'input[name=userEmail]',
        PASSWORD_INPUT: 'input[name=userPassword]',
        VALOR_APLICAR: 'input[name=valorAplicar]',
        VALOR_INVESTIR: 'input[name=valorInvestir]',
        TEMPO: 'input[name=tempo]',
        SUBMIT_BUTTON: 'button[type=submit]',
        LABEL_VALOR_APLICAR: 'label[id="valorAplicar-error"]',
        LABEL_VALOR_INVESTIR: 'label[valorInvestir-error]',
        LABEL_TEMPO:  'label[id="tempo-error"]'
};

async function fillForm(valorAplicar, valorInvestir, tempo){
    const buttonSelector = selectors.SUBMIT_BUTTON;
    await page.type(selectors.VALOR_APLICAR, valorAplicar);
    await page.type(selectors.VALOR_INVESTIR, valorInvestir);
    await page.type(selectors.TEMPO, tempo);
    await page.click(buttonSelector);
}

async function verificarLabelAlertaMaxima(SELETOR, valorAplicar, LABEL){
    await page.type(SELETOR, valorAplicar);

}

beforeAll(async () => {
    jest.setTimeout(TIMEOUT_PER_TEST);
    browser = await BrowserHandler.createBrowser();
    page = (await browser.pages())[0];
});

beforeEach(async () => {
    await page.goto(url);
});

afterAll(async ()=>{
    await browser.close();
})

// *****************************************************************
// Tests

describe('asdfasdf',()=> {
   test('teste 1: valores abaixo do minimo',async()=>{
       await fillForm("19,00", "19,00", "1");
       }
   )

   test('verificar a menssagem alerta valor aplicar', async ()=>{
       await fillForm("19,00", "", "")
       const retornoAlerta = await page.$(selectors.LABEL_VALOR_APLICAR);
       expect(retornoAlerta).not.toBeNull();
   })

    test('verificar a menssagem alerta valor aplicar', async ()=>{
        await fillForm("19,00", "", "")
        const retornoAlerta = await page.$(selectors.LABEL_VALOR_APLICAR);
        expect(retornoAlerta).toBeNull();
    })



});