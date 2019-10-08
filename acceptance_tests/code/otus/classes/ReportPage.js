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

    static get selectors(){
        return selectors;
    }

    async extractInfo(){
        return {
            participantInfo: await _extractParticipantInfo(this.page),
            items: await this.extractItems()
        };
    }

}

// **************************************************************
// Private functions

async function _extractParticipantInfo(page){
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

// **************************************************************

module.exports = ReportPage;
