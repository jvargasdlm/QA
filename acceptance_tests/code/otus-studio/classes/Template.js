const FileHandler  = require('../../handlers/FileHandler');

class Template {

    constructor(path) {
        this.path = path;
        this.acronym = '';
    }

    async setAcronymFromJsonFile(){
        let data = await FileHandler.readJsonAttribute(this.path, 'identity');
        this.acronym = data.acronym;
    }
}

module.exports = Template;