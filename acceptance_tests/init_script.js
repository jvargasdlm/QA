require('custom-env').env('staging');
const FileHandler = require('./code/handlers/FileHandler');

function setLoginData(){

    let email = process.env.EMAIL;
    if(email === 'empty'){
        email = process.env.DEFAULT_EMAIL;
    }

    let password = process.env.PASSWORD;
    if(password === 'empty'){
        password = process.env.DEFAULT_PASSWORD;
    }

    const data = {
        "OTUS": {
            "email": email,
            "password": password
        },
        "OTUS_DOMAIN": {
            "email": "",
            "password": ""
        }
    };

    const content = JSON.stringify(data,null,4);
    FileHandler.write('.' + process.env.LOGIN_DATA_FILE_LOCAL_PATH, content);
    console.log('Login data saved successfully.');
}

setLoginData();