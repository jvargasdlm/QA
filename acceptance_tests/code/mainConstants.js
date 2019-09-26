require('custom-env').env('staging');

const dirPath = process.cwd();

const browser = {
    SHOW_BROWSER: (process.env.SHOW_BROWSER === 'true'),
    EXECUTABLE_PATH: dirPath + '/chrome/chrome',
    WINDOW_SIZE: {width: 1920, height: 1080},
    SLOW_TIME_MILLISEC_TO_FOLLOW_INTERACTION: 20
};

const paths = {
    DOWNLOADS_DIR_PATH: dirPath + '/downloads',
    OUTPUT_DIR_PATH: dirPath + '/output',
    SCREENSHOT_DIR_PATH: dirPath + '/output/screenshots',
    TEST_RESULTS_DIR_PATH: dirPath + '/output/test_results',
};

const timeout = {
    PER_TEST: 60 * 1000,
    LOAD_PAGE_TIMEOUT: 5000,
    WAIT_FOR_SELECTOR_TIMEOUT: 5000,
    DOWNLOAD_TIMEOUT: 5000,
    JSON_DOWNLOAD_TIMEOUT: 3000
};

const log = {
    LOG_NAVIGATION_ACTIONS: false
};

module.exports = {
    browser: browser,
    paths: paths,
    timeout: timeout,
    log: log
};