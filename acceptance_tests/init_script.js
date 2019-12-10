require('custom-env').env('staging');
const FileHandler = require('./code/handlers/FileHandler');
const readline = require('readline-sync');

function setLoginDataByEnvVariables(){

    function defineValue(value, defaultValue){
        return (value==='empty' ? defaultValue : value);
    }

    const data = {
        "OTUS": {
            "email": defineValue(process.env.OTUS_EMAIL, process.env.OTUS_DEFAULT_EMAIL),
            "password": defineValue(process.env.OTUS_PASSWORD, process.env.OTUS_DEFAULT_PASSWORD),
        },
        "OTUS_DOMAIN": {
            "email": defineValue(process.env.OTUS_DOMAIN_EMAIL, process.env.OTUS_DOMAIN_DEFAULT_EMAIL),
            "password": defineValue(process.env.OTUS_DOMAIN_PASSWORD, process.env.OTUS_DOMAIN_DEFAULT_PASSWORD),
        }
    };

    const content = JSON.stringify(data,null,4);
    FileHandler.write('.' + process.env.LOGIN_DATA_FILE_LOCAL_PATH, content);
    console.log('Login data saved successfully.');
}

function setLoginDataByTerminalInput() {

    function readPlatformLoginData(platformName, defaultEmail, defaultPassword){
        console.log("\n"+platformName);
        let email = readline.question(' Email (press Enter key to use default address): ');
        let password = '';
        if(email.length===0){
            email = defaultEmail;
            password = defaultPassword;
        }
        else {
            password = readline.questionNewPassword(' Password: ', {
                    min: 1,
                    confirmMessage: ' Confirm password: ',
                    unmatchMessage: '  It differs from first one. You can press Enter key to retry from first one.'
                });
        }
        return {
            email: email,
            password: password
        }
    }

    console.log("Set login data");

    const data = {
        "OTUS":
            readPlatformLoginData("Otus", process.env.OTUS_DEFAULT_EMAIL, process.env.OTUS_DEFAULT_PASSWORD),
        "OTUS_DOMAIN":
            readPlatformLoginData("Otus Domain", process.env.OTUS_DOMAIN_DEFAULT_EMAIL, process.env.OTUS_DOMAIN_DEFAULT_PASSWORD)
    };

    const content = JSON.stringify(data,null,4);
    FileHandler.write('.' + process.env.LOGIN_DATA_FILE_LOCAL_PATH, content);
    console.log('\nLogin data saved successfully.');
}

setLoginDataByTerminalInput();