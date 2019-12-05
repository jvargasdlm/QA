const fileHandler = require('../handlers/FileHandler');
require('custom-env').env('staging');

class ErrorLogger {

    constructor(){
        this.specArray = [];
        this.specIndex = 0;
        this.wrongAssertionLogs = [];
    }

    get currSpecName(){
        return this.specArray[this.specIndex].description;
    }

    get currSpecFileName(){
        return fileHandler.getFileName(_getTestPath(this.specArray[0]));
    }

    hasSpec(){
        return (this.specArray.length > 0);
    }

    reset(){
        this.specArray = [];
        this.specIndex = 0;
        this.wrongAssertionLogs = [];
    }

    resetAndSetSpecArray(suiteArray){
        this.reset();
        _setSpecArray(suiteArray, this);
        if(!this.hasSpec()){
            console.log('Suite array with no tests to run (empty or all skipped).');
        }
    }

    advanceToNextSpec(){
        this.specIndex++;
    }

    addFailMessagesFromCurrSpec(messagesArray){
        const message = messagesArray.join('\n ');
        this.addFailMessageFromCurrSpec(message);
    }

    addFailMessageFromCurrSpec(message){
        console.error(message);
        const specFullName = _getFullNameSplited(this.specArray[this.specIndex]);
        const log = `${specFullName}:\n ${message}`;
        this.wrongAssertionLogs.push(log);
        throw log;
    }

    exportTestResultLog(){
        if(!this.hasSpec()){
            return;
        }
        const testPath = _getTestPath(this.specArray[0]); // any spec from current suite works to get testPath
        const testLocalPath = testPath.replace(process.cwd(), '.');
        const fileName = fileHandler.getFileName(testPath);
        let path = process.cwd() + process.env.TEST_RESULTS_LOCAL_DIR_PATH + '/' + fileName;

        console.log('*************************************\nEnd of test suite of file', fileName);
        const numFails = this.wrongAssertionLogs.length;

        try {
            let content = 'Test file: ' + testLocalPath + '\n\n';

            if(numFails === 0){
                content += 'All tests passed.';
                path += '-result.txt';
            }
            else{
                content += this.wrongAssertionLogs.join('\n\n');
                this.wrongAssertionLogs.forEach((log) => console.error(log));
                path += '-fails.txt';
            }

            fileHandler.write(path, content);
        }
        catch (err) {
            console.error(`Error at write test result (numFails = ${numFails}) at test path ${testLocalPath}\n`, err);
        }
        finally {
            this.reset();
        }
    }
}

// *******************************************
// Private functions

function _wasExecuted (spec) {
    let pendingReason = spec.result.pendingReason;
    return (pendingReason!==undefined && pendingReason==='');
}

function _getTestPath(spec){
    return spec.result.testPath;
}

function _getFullNameSplited(spec, separator='\n'){
    try{
        const specName = spec.description;
        const suiteName = spec.getFullName().replace(' '+specName, '');
        return `${suiteName}${separator}${specName}`;
    }
    catch (e) {
        return '(empty suite)';
    }
}

function _setSpecArray(suiteArray, errorLogger){
    let filteredSuiteArray = suiteArray.filter((suite) => {return !suite.markedPending;});
    for(let suite of filteredSuiteArray){
        for (let child of suite.children){
            if(child.children){  // is a suite
                let resultArray = _setSpecArray(child);
                errorLogger.specArray = errorLogger.specArray.concat(resultArray);
            }
            else if(_wasExecuted(child)){ // is a spec
                errorLogger.specArray.push(child);
            }
        }
    }
}

module.exports = ErrorLogger;