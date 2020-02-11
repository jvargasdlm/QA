const BrowserHandler = require('../../code/handlers/BrowserHandler.js');
let browser, page;
const url = 'https://www.sicredi.com.br/html/ferramenta/simulador-investimento-poupanca/';
const TIMEOUT_PER_TEST = 60000;

const selectors = {
        INPUT_AMOUNT_TO_APPLY: 'input[name=valorAplicar]',
        INPUT_AMOUNT_TO_INVEST: 'input[name=valorInvestir]',
        INPUT_INVESTMENT_TIME: 'input[name=tempo]',
        SUBMIT_BUTTON: 'button[type=submit]',
        LABEL_AMOUNT_TO_APPLY: 'label[id="valorAplicar-error"]',
        LABEL_AMOUNT_TO_INVEST: 'label[id="valorInvestir-error"]',
        LABEL_INVESTMENT_TIME:  'label[id="tempo-error"]',
        RADIO_FOR_YOU: 'input[value="paraVoce"]',
        RADIO_FOR_COMPANY: 'input[value="paraEmpresa"]'
};

async function fillFormForYou(amountToApply, amountToInvest, investmentTime){
        const buttonSelector = selectors.SUBMIT_BUTTON;
        await page.click(selectors.RADIO_FOR_YOU);
        await page.type(selectors.INPUT_AMOUNT_TO_APPLY, amountToApply);
        await page.type(selectors.INPUT_AMOUNT_TO_INVEST, amountToInvest);
        await page.type(selectors.INPUT_INVESTMENT_TIME, investmentTime);
        await page.click(buttonSelector);
}

async function fillFormForCompany(amountToApply, amountToInvest, investmentTime){
    const buttonSelector = selectors.SUBMIT_BUTTON;
    await page.click(selectors.RADIO_FOR_COMPANY);
    await page.type(selectors.INPUT_AMOUNT_TO_APPLY, amountToApply);
    await page.type(selectors.INPUT_AMOUNT_TO_INVEST, amountToInvest);
    await page.type(selectors.INPUT_INVESTMENT_TIME, investmentTime);
    await page.click(buttonSelector);
}

// async function verifyLabelAlert(SELETOR, amountToApply, LABEL){
//     await page.type(SELETOR, amountToApply);
//
// }

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

describe('1. Suite teste of Sicredi Investment Simulator: Profile for you',()=> {

    test('Test 1.1: Amount to apply and amount to invest greater than 20 reais', async ()=>{
        await fillFormForYou("20,01", "20,01", "20")
        const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
        expect(guidanceMessageAmountToApply).toBeNull();
        const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
        expect(guidanceMessageAmountToInvest).toBeNull();
    })

    test('Test 1.2: Amount to apply and amount to invest less than 20 reais', async ()=>{
        await fillFormForYou("19,99", "19,99", "20")
        const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
        expect(guidanceMessageAmountToApply).not.toBeNull();
        const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
        expect(guidanceMessageAmountToInvest).not.toBeNull();
    })

    test('Test 1.3: Blank values', async ()=>{
        await fillFormForYou("", "", "20")
        const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
        expect(guidanceMessageAmountToApply).not.toBeNull();
        const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
        expect(guidanceMessageAmountToInvest).not.toBeNull();
    })

    test('Test 1.4: Blank amount to be applied and amount to invest less than 20 reais', async ()=>{
        await fillFormForYou("", "19,99", "20")
        const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
        expect(guidanceMessageAmountToApply).not.toBeNull();
        const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
        expect(guidanceMessageAmountToInvest).not.toBeNull();
    })

    test('Test 1.5: Blank amount to be applied and amount to invest greater than 20 reais',async()=>{
       await fillFormForYou("", "20,01", "20");
        const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
        expect(guidanceMessageAmountToApply).not.toBeNull();
        const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
        expect(guidanceMessageAmountToInvest).toBeNull();
       }
   )

    test('Test 1.6: Amount to apply less than 20 reais and amount to invest in blank',async()=>{
            await fillFormForYou("19,99", "", "20");
            const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
            expect(guidanceMessageAmountToApply).not.toBeNull();
            const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
            expect(guidanceMessageAmountToInvest).not.toBeNull();
        }
    )

    test('Test 1.7: Amount to apply less than 20 reais and amount to invest greater than 20 reais',async()=>{
            await fillFormForYou("19,99", "20,01", "20");
            const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
            expect(guidanceMessageAmountToApply).not.toBeNull();
            const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
            expect(guidanceMessageAmountToInvest).toBeNull();
        }
    )

    test('Test 1.8: Amount to apply greater than 20 reais and amount to invest in blank',async()=>{
            await fillFormForYou("20,01", "", "20");
            const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
            expect(guidanceMessageAmountToApply).toBeNull();
            const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
            expect(guidanceMessageAmountToInvest).not.toBeNull();
        }
    )

    test('Test 1.9: Amount to apply greater than 20 reais and amount to invest less than 20 reais',async()=>{
            await fillFormForYou("20,01", "19,99", "20");
            const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
            expect(guidanceMessageAmountToApply).toBeNull();
            const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
            expect(guidanceMessageAmountToInvest).not.toBeNull();
        }
    )
});

describe('2. Suite teste of Sicredi Investment Simulator: : Profile for company or agribusiness',()=> {

    test('Test 2.1: Amount to apply and amount to invest greater than 20 reais', async ()=>{
        await fillFormForCompany("20,01", "20,01", "20")
        const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
        expect(guidanceMessageAmountToApply).toBeNull();
        const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
        expect(guidanceMessageAmountToInvest).toBeNull();
    })

    test('Test 2.2: Amount to apply and amount to invest less than 20 reais', async ()=>{
        await fillFormForCompany("19,99", "19,99", "20")
        const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
        expect(guidanceMessageAmountToApply).not.toBeNull();
        const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
        expect(guidanceMessageAmountToInvest).not.toBeNull();
    })

    test('Test 2.3: Blank values', async ()=>{
        await fillFormForCompany("", "", "20")
        const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
        expect(guidanceMessageAmountToApply).not.toBeNull();
        const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
        expect(guidanceMessageAmountToInvest).not.toBeNull();
    })

    test('Test 2.4: Blank amount to be applied and amount to invest less than 20 reais', async ()=>{
        await fillFormForCompany("", "19,99", "20")
        const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
        expect(guidanceMessageAmountToApply).not.toBeNull();
        const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
        expect(guidanceMessageAmountToInvest).not.toBeNull();
    })

    test('Test 2.5: Blank amount to be applied and amount to invest greater than 20 reais',async()=>{
            await fillFormForCompany("", "20,01", "20");
            const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
            expect(guidanceMessageAmountToApply).not.toBeNull();
            const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
            expect(guidanceMessageAmountToInvest).toBeNull();
        }
    )

    test('Test 2.6: Amount to apply less than 20 reais and amount to invest in blank',async()=>{
            await fillFormForCompany("19,99", "", "20");
            const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
            expect(guidanceMessageAmountToApply).not.toBeNull();
            const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
            expect(guidanceMessageAmountToInvest).not.toBeNull();
        }
    )

    test('Test 2.7: Amount to apply less than 20 reais and amount to invest greater than 20 reais',async()=>{
            await fillFormForCompany("19,99", "20,01", "20");
            const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
            expect(guidanceMessageAmountToApply).not.toBeNull();
            const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
            expect(guidanceMessageAmountToInvest).toBeNull();
        }
    )

    test('Test 2.8: Amount to apply greater than 20 reais and amount to invest in blank',async()=>{
            await fillFormForCompany("20,01", "", "20");
            const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
            expect(guidanceMessageAmountToApply).toBeNull();
            const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
            expect(guidanceMessageAmountToInvest).not.toBeNull();
        }
    )

    test('Test 2.9: Amount to apply greater than 20 reais and amount to invest less than 20 reais',async()=>{
            await fillFormForCompany("20,01", "19,99", "20");
            const guidanceMessageAmountToApply = await page.$(selectors.LABEL_AMOUNT_TO_APPLY);
            expect(guidanceMessageAmountToApply).toBeNull();
            const guidanceMessageAmountToInvest = await page.$(selectors.LABEL_AMOUNT_TO_INVEST);
            expect(guidanceMessageAmountToInvest).not.toBeNull();
        }
    )
});