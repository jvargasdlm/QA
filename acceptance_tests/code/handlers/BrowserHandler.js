const puppeteer = require('puppeteer');
require('custom-env').env('staging');

class BrowserHandler {

    static async createBrowser() {
        const showBrowser = (process.env.SHOW_BROWSER === 'true');
        return _createBrowser(showBrowser);
    }

    static async createBrowserHeadFull() {
        return _createBrowser(true);
    }

    static async openNewTab(browser, url) {
        const page = await browser.newPage();
        await page.goto(url);
        await page.bringToFront();
        return page;
    }

}

async function _createBrowser(showBrowser) {
    const width = process.env.WINDOW_WIDTH;
    const height = process.env.WINDOW_HEIGHT;
    const windowSizeArg = `--window-size=${width},${height}`;
    let browserConfig = {
        headless: !showBrowser,
        executablePath: process.cwd() + process.env.CHROME_EXECUTABLE_LOCAL_PATH,
        slowMo: parseInt(process.env.SLOW_TIME_MILLISEC_TO_FOLLOW_INTERACTION, 10),
        defaultViewport: null,
        args: ['--no-sandbox', windowSizeArg, '--ignore-certificate-errors', '--"acceptInsecureCerts"', '--ignoreHTTPSErrors=true']
    };

    let browser = await puppeteer.launch(browserConfig);
    browser._ignoreHTTPSErrors = true; // the flag in args array does not work
    return browser;
}

module.exports = BrowserHandler;