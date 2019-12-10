const ActivityAdditionItem = require('./ActivityAdditionItem');

class ActivityAdditionItemPaper extends ActivityAdditionItem {

    constructor(pageExt){
        super(pageExt);
        this.realizationDate = pageExt.getNewCalendar();
        this.inspectorAutoComplete = pageExt.getNewAutoCompleteSearch();
    }

    async init(indexInHtml, childrenIndex){
        await super.init(indexInHtml);
        await this.realizationDate.initByParentElement(this.elementHandle, "[aria-label='Data de Realização']");
        await this.inspectorAutoComplete.initByTag(childrenIndex+2, childrenIndex+2); //+2 coz already exist 2 autocompletes
    }

    async insertRealizationData(date){
        await this.realizationDate.openAndSelectDate(date);
    }

    async insertInspector(inspectorName){
        await this.inspectorAutoComplete.typeAndClickOnFirstOfList(inspectorName);
        await this.pageExt.clickOut();
    }

    async insertPaperExclusiveData(date, inspectorName){
        try {
            await this.insertRealizationData(date);
            await this.insertInspector(inspectorName);
        }
        catch (e) {
            if(!this.realizationDate.elementHandle || !this.inspectorAutoComplete.elementHandle){
                throw `Activity item doesn't have inputs for paper type data.`
            }
            throw e;
        }
    }

    async extractData(){
        const content = await super.extractContent();
        this.data = {
            acronym: content[0],
            type: ActivityAdditionItemPaper.typeEnum.PAPER,
            status: ActivityAdditionItemPaper.statusEnum.NEW,
            name: content[1],
            externalId: (this.externalIdInput.elementHandle? this.externalIdInput.content : null),
            realizationDate: this.realizationDate.currDate,
            category: (content[2].split(": ")[1]).toUpperCase()
        };
        return this.data;
    }

}

module.exports = ActivityAdditionItemPaper;