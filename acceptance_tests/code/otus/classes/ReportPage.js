const PageOtus = require('./PageOtus');

const selectors = {
    PARTICIPANT_INFO: "section[class='participantInfo']",
    PARTICIPANT_INFO_COLUMN: "section[class='column ng-binding']",
    ITEMS: "section[class='contextValues']"
};

class ReportPage extends PageOtus {

    constructor(page){
        super(page);
    }

    async extractInfoFromExamReport(){
        return extractInfoToReportItem(await extractInfo(this.page), ExamReportItem);
    }

    async extractInfoFromActivityReport(){
        return extractInfoToReportItem(await extractInfo(this.page), ActivityReportItem);
    }
}

// **************************************************************
// Private functions and classes

async function extractParticipantInfo(page){
    return await page.evaluate((selectors) => {
        let result = {};
        const infoNode = document.body.querySelector(selectors.PARTICIPANT_INFO);
        const infos = infoNode.innerText.split('\n');
        for(let info of infos){
            let [data, value] = info.split(': ');
            result[`${data}`] = value;
        }
        return result;
    }, selectors);
}

async function extractItems(page){
    return await page.evaluate((valuesSelector) => {
        let result = [];
        const elements = Array.from(document.body.querySelectorAll(valuesSelector));
        for (let i = 0; i < elements.length; i++) {
            let elementParts = Array.from(elements[i].querySelectorAll('p'));
            let innerTextArr = elementParts.map( (elem) => elem.innerText);
            result.push(innerTextArr);
        }
        return result;
    }, selectors.ITEMS);
}

async function extractInfo(page){
    return {
        participantInfo: await extractParticipantInfo(page),
        items: await extractItems(page)
    }
}

async function extractInfoToReportItem(extractedInfo, ReportItemClass){
    for (let i = 0; i < extractedInfo.items.length; i++) {
        extractedInfo.items[i] = new ReportItemClass(extractedInfo.items[i]);
    }
    return extractedInfo;
}

// ---------------------------------------------------------------

class ExamReportItem {

    constructor(innerTextArr){
        this.title = innerTextArr[0];
        let [subtitle, val] = innerTextArr[1].split(':');
        let [empty, value, unit] = val.split(' ');
        this.subtitle = subtitle;
        this.value = value;
        this.unit = unit;
    }
}

class ActivityReportItem {

    constructor(innerTextArr) {
        this.questionText = '';
        this.answer = '';
    }
}

// **************************************************************
module.exports = ReportPage;
