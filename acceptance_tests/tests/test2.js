const BrowserHandler = require("../code/handlers/BrowserHandler");


describe('Test Suite A', () => {

    test('Test 1', async() => {
        var browser = await BrowserHandler.createBrowser(true);
        var page = (await browser.pages())[0];
        await page.goto("https://pt-br.facebook.com/");


        await page.type("input[name='email']", 'ASDFG');
        await page.type("input[name='pass']", '12345');

      
        
        

 

    });

  });