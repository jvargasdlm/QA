const BrowserHandler = require("../code/handlers/BrowserHandler");


describe('Test Suite A', () => {

    test('Test 1', async() => {
        var browser = await BrowserHandler.createBrowser(true);
        var page = (await browser.pages())[0];
        await page.goto("http://www.google.com");


        await page.type("input[name='q']", '12345');

        await page.waitForSelector("[value='Pesquisa Google']");
        await page.click("[value='Pesquisa Google']");
        await page.click("[value=']");      





    });

  });
