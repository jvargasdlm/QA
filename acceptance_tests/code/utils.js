const delay = require('delay');

// Constants
require('custom-env').env('staging');
const TIMEOUT_PER_TEST = parseInt(process.env.TIMEOUT_PER_TEST, 10);

// *****************************************************************

let timeout = {
    setTestTimeout: function(milliseconds=TIMEOUT_PER_TEST){
        jest.setTimeout(milliseconds);
    }
};

let wait = {
    forMilliseconds: async function(milliseconds) {
        await delay(milliseconds);
    },

    forSeconds: async function(seconds){
        await delay(seconds * 1000);
    },

    for5seconds: async function(){
        await delay(5000);
    },

    forJsonDownload: async function(){
        await this.forMilliseconds(parseInt(process.env.JSON_DOWNLOAD_TIMEOUT, 10));
    },

    forDownload: async function(){
        await this.forMilliseconds(parseInt(process.env.DOWNLOAD_TIMEOUT, 10));
    },

    load: async function() {
        await delay(parseInt(process.env.LOAD_PAGE_TIMEOUT, 10));
    }
};

module.exports = {timeout, wait};
