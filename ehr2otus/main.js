const xml2js = require('xml2js');
const FileHandler = require('./code/FileHandler');
const EhrQuestionnaire = require("./code/EhrQuestionnaire");
const globalVars = require('./code/globalVars');//.

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

function xml2json(ehrXmlFilePath, resultObj) {
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
    }
    catch (e) {
        throw e;
    }
}

function makeConversionEhr2OtusTemplate(){
    const dirPath = process.cwd() + "/";
    const xmlFilePath = dirPath + "ELEA.xml"; //. maybe by custom env variable?
    const outputDirPath = dirPath + "output/";
    try {
        let content = {};
        xml2json(xmlFilePath, content);
        content = content.result;
        FileHandler.write(outputDirPath + "ELEA.json", JSON.stringify(content, null, 4));

        const ehr = new EhrQuestionnaire();
        ehr.readFromJsonObj(content);
        //FileHandler.write(dirPath + "ELEA-enxuto.json", JSON.stringify(ehr, null, 4));

        const oid = "eleaOtusSUQ6W3VuZGVmaW5lZF1zdXJ2ZXlVVUlEOltiYmFjYzM1MC1lNDdjLTExZTktOGVmNy02MTUwOTJlYjNkOTFdcmVwb3NpdG9yeVVVSUQ6WyBOb3QgZG9uZSB5ZXQgXQ==";
        let template = createEmptyOtusSutioTemplateObj("ELEA", "ELEA", oid);
        ehr.toOtusStudioTemplate(template);
        FileHandler.write(outputDirPath + "ELEA-otus-result.json", JSON.stringify(template, null, 4));

        //FileHandler.write(outputDirPath + "dictQuestionNameId.json", JSON.stringify(globalVars.dictQuestionNameId, null, 4));
    }
    catch (e) {
        console.log(e);
    }
}

makeConversionEhr2OtusTemplate();

/*
ELEA14aGroup
ELEA14mGroup
 */

