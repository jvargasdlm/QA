const PageOtus = require('./PageOtus');

const selectors = {
    PARTICIPANT_INFO: "section[class='participantInfo']",
    PARTICIPANT_INFO_COLUMN: "section[class='column ng-binding']"
};

class ReportPage extends PageOtus {

    constructor(page){
        super(page);
    }

    async extractInfo(){

    }

    async extractParticipantInfo(){
        let texts = await this.page.evaluate((selectors) => {
            const texts = [];
            const infoNode = document.body.querySelector(selectors.PARTICIPANT_INFO);
            texts.push(infoNode.innerText);
            const columnNodes = infoNode.querySelectorAll(selectors.PARTICIPANT_INFO_COLUMN);
            for(let columnNode of columnNodes){
                texts.push(columnNode.innerText);
            }
            return texts;
        }, selectors);
        console.log(texts);
    }
}

module.exports = ReportPage;