require('custom-env').env('staging');
const FileHandler = require('./code/handlers/FileHandler');

function setLoginData(){
    const data = {
        "OTUS": {
            "email": process.env.EMAIL,
            "password": process.env.PASSWORD
        },
        "OTUS_DOMAIN": {
            "email": "",
            "password": ""
        }
    };
    const content = JSON.stringify(data,null,4);
    FileHandler.write('./login_data.json', content);
    console.log('Login data saved successfully.');
}

setLoginData();