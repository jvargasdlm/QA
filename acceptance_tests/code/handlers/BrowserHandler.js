const puppeteer = require('puppeteer');
const configConstants = require('../mainConstants').browser;

async function createBrowser(showBrowser) {
    const windowSize = configConstants.WINDOW_SIZE;
    const windowSizeArg = `--window-size=${windowSize.width},${windowSize.height}`;
    let browserConfig = {
        headless: !showBrowser,
        executablePath: configConstants.EXECUTABLE_PATH,
        slowMo: configConstants.SLOW_TIME_MILLISEC_TO_FOLLOW_INTERACTION,
        defaultViewport: null,
        args: ['--no-sandbox', windowSizeArg, '--ignore-certificate-errors', '--"acceptInsecureCerts"', '--ignoreHTTPSErrors=true'],
        //devtools: true
    };

    let browser = await puppeteer.launch(browserConfig);
    browser._ignoreHTTPSErrors = true; // the flag in args array does not work
    return browser;
}

class BrowserHandler {

    static async createBrowser() {
        return createBrowser(configConstants.SHOW_BROWSER);
    }

    static async createBrowserHeadFull() {
        return createBrowser(true);
    }

    static async openNewTab(browser, url) {
        const page = await browser.newPage();
        await page.goto(url);
        await page.bringToFront();
        return page;
    }

}

module.exports = BrowserHandler;