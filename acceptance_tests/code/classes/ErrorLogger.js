const fileHandler = require('../handlers/FileHandler');
require('custom-env').env('staging');

// *******************************************
// Private functions

function wasExecuted (spec) {
    let pendingReason = spec.result.pendingReason;
    return (pendingReason!==undefined && pendingReason==='');
}

function getTestPath(spec){
    return spec.result.testPath;
}

function getFullNameSplited(spec, separator='\n'){
    const specName = spec.description;
    const suiteName = spec.getFullName().replace(' '+specName, '');
    return `${suiteName}${separator}${specName}`;
}

function setSpecArray(suiteArray, errorLogger){
    let filteredSuiteArray = suiteArray.filter((suite) => {return !suite.markedPending;});
    for(let suite of filteredSuiteArray){
        for (let child of suite.children){
            if(child.children){  // is a suite
                let resultArray = setSpecArray(child);
                errorLogger.specArray = errorLogger.specArray.concat(resultArray);
            }
            else if(wasExecuted(child)){ // is a spec
                errorLogger.specArray.push(child);
            }
        }
    }
}

// *******************************************

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
        return fileHandler.getFileName(getTestPath(this.specArray[0]));
    }

    reset(){
        this.specArray = [];
        this.specIndex = 0;
        this.wrongAssertionLogs = [];
    }

    resetAndSetSpecArray(suiteArray){
        this.reset();
        setSpecArray(suiteArray, this);
    }

    advanceToNextSpec(){
        this.specIndex++;
    }

    addWrongAssertionLogFromCurrSpec(message){
        const specFullName = getFullNameSplited(this.specArray[this.specIndex]);
        const log = `${specFullName}:\n ${message}`;
        this.wrongAssertionLogs.push(log);
        console.error(message);
        throw log;
    }

    exportTestResultLog(){
        const testPath = getTestPath(this.specArray[0]); // any spec from current suite works to get testPath
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

module.exports = ErrorLogger;