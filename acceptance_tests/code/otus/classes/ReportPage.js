const PageOtus = require('./PageOtus');

const selectors = {
    PARTICIPANT_INFO: "section[class='participantInfo']",
    PARTICIPANT_INFO_COLUMN: "section[class='column ng-binding']",
    VALUES: "section[class='contextValues']"
};

class ReportPage extends PageOtus {

    constructor(page){
        super(page);
    }

    async extractInfo(){
        const participantInfo = await this.extractParticipantInfo();
        const values = await this.extractValues();
        console.log(participantInfo);
        console.log(values);
    }

    async extractParticipantInfo(){
        return await this.page.evaluate((selectors) => {
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

    async extractValues(){
        return await this.page.evaluate((valuesSelector) => {
            let result = [];
            const elements = Array.from(document.body.querySelectorAll(valuesSelector));
            for (let i = 0; i < elements.length; i++) {
                let elementParts = Array.from(elements[i].querySelectorAll('p'));
                result.push(elementParts.map( (elem) => elem.innerText));
            }
            return result;
        }, selectors.VALUES);
    }
}

module.exports = ReportPage;