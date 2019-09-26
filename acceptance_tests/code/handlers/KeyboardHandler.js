const ks = require('node-key-sender');
const wait = require('../utils').wait;

const TIME_TO_WAIT_FOR_START_TYPE = 400;

const specialKeys = {
    ENTER: '@10'
};

class KeyboardHandler {

    static async sendKey(keyStringCode){
        await ks.sendKey(keyStringCode);
    }

    static async sendKeyAfterWait(keyStringCode, milissecToWait=TIME_TO_WAIT_FOR_START_TYPE){
        await wait.forMilliseconds(milissecToWait);
        await ks.sendKey(keyStringCode);
    }

    static async sendEnterKey(){
        await ks.sendKey(specialKeys.ENTER);
    }

    static async sendEnterKeyAfterWait(milissecToWait=TIME_TO_WAIT_FOR_START_TYPE){
        await wait.forMilliseconds(milissecToWait);
        await ks.sendKey(specialKeys.ENTER);
    }

    static async sendText(text){
        await ks.sendText(text);
    }

    static async sendTextAfterWait(text, milissecToWait=TIME_TO_WAIT_FOR_START_TYPE){
        await wait.forMilliseconds(milissecToWait);
        await ks.sendText(text);
    }
}

module.exports = KeyboardHandler;