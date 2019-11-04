//require('custom-env').env('staging');
const xml2js = require('xml2js');
const FileHandler = require('./code/FileHandler');
const EhrQuestionnaire = require("./code/EhrQuestionnaire");
//const globalVars = require('./code/globalVars');//.

const outputDirPath = process.cwd() + "/output/";

function createEmptyOtusSutioTemplateObj(name, acronym, oid) {
    return {
        "extents": "StudioObject",
        "objectType": "Survey",
        "oid": oid,
        "identity": {
            "extents": "StudioObject",
            "objectType": "SurveyIdentity",
            "name": name,
            "acronym": acronym,
            "recommendedTo": "",
            "description": "",
            "keywords": []
        },
        "metainfo": {
            "extents": "StudioObject",
            "objectType": "SurveyMetaInfo",
            "creationDatetime": "2019-10-01T18:53:18.725Z",
            "otusStudioVersion": ""
        },
        "dataSources": [],
        "itemContainer": [],
        "navigationList": [],
        "staticVariableList": [],
        "surveyItemGroupList": []
    }
}

function xml2json(ehrXmlFilePath) {
    const ATTR_KEY = 'ATTR';

    function walkJsonObject(jsonObj) {
        for (let key in jsonObj) {
            if(key === ATTR_KEY){
                for (let [key2, value] of Object.entries(jsonObj[ATTR_KEY])){
                    jsonObj[key2] = value;
                }
                delete jsonObj[ATTR_KEY];
            }

            if (jsonObj[key] !== null && typeof(jsonObj[key]) === "object") {
                walkJsonObject(jsonObj[key]);
            }
        }
    }

    try {
        let resultObj = {};
        const xml_string = FileHandler.read(ehrXmlFilePath);
        const parser = new xml2js.Parser({ attrkey: ATTR_KEY });
        parser.parseString(xml_string, function (error, result) {
            if (error === null) {
                walkJsonObject(result);
                resultObj.result = result;
            } else {
                console.log(error);
            }
        });
        return resultObj.result;
    }
    catch (e) {
        throw e;
    }
}

function writeOutputJsonFile(filename, content){
    const path = outputDirPath + filename;
    FileHandler.write(path, JSON.stringify(content, null, 4));
}

function makeConversionEhr2OtusTemplate(templateInfo){
    const xmlFilePath = process.cwd() + "/input/" + templateInfo.filename;

    let content = xml2json(xmlFilePath);
    //writeOutputJsonFile(templateInfo.acronym+".json", content);

    const ehr = new EhrQuestionnaire();
    ehr.readFromJsonObj(content);
    //writeOutputJsonFile(templateInfo.acronym+"-enxuto.json", ehr);

    //const oid = "eleaOtusSUQ6W3VuZGVmaW5lZF1zdXJ2ZXlVVUlEOltiYmFjYzM1MC1lNDdjLTExZTktOGVmNy02MTUwOTJlYjNkOTFdcmVwb3NpdG9yeVVVSUQ6WyBOb3QgZG9uZSB5ZXQgXQ==";
    let template = createEmptyOtusSutioTemplateObj(templateInfo.name, templateInfo.acronym, templateInfo.oid);
    ehr.toOtusStudioTemplate(template);
    writeOutputJsonFile(templateInfo.acronym+"-otus-result.json", template);

    const endPageSentences = ehr.endPage.getSentencesObject();
    writeOutputJsonFile(templateInfo.acronym+"-end-page-sentences.json", endPageSentences);

    //writeOutputJsonFile("dictQuestionNameId.json", globalVars.dictQuestionNameId);
}

function main(){
    try {
        FileHandler.mkdir(outputDirPath);

        const templatesInfo = FileHandler.readJsonSync(process.cwd() + "/input/templateInfo.json").templatesInfo;
        for(let templateInfo of templatesInfo){
            makeConversionEhr2OtusTemplate(templateInfo);
        }
    }
    catch (e) {
        console.log(e);
    }
}

main();