const delay = require('delay');
// own libs
const mainConstants = require('./mainConstants');
const timeoutConstants = mainConstants.timeout;

// *****************************************************************

let timeout = {
    setTestTimeout: function(milliseconds=timeoutConstants.PER_TEST){
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
        await this.forMilliseconds(timeoutConstants.JSON_DOWNLOAD_TIMEOUT);
    },

    forDownload: async function(){
        await this.forMilliseconds(timeoutConstants.DOWNLOAD_TIMEOUT);
    },

    load: async function() {
        await delay(timeoutConstants.LOAD_PAGE_TIMEOUT);
    }
};

module.exports = {mainConstants, timeout, wait};
