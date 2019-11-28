const ActivityAdditionItem = require('./ActivityAdditionItem');

class ActivityAdditionItemPaper extends ActivityAdditionItem {

    constructor(pageExt){
        super(pageExt);
        this.realizationDate = pageExt.getNewCalendar();
        this.inspectorAutoComplete = pageExt.getNewAutoCompleteSearch();
    }

    async init(index, childrenIndex){
        await super.init(index);
        let local = 'realizationDate';//.
        try {
            await this.realizationDate.init(childrenIndex);
            local = 'inspectorAutoComplete';//.
            await this.inspectorAutoComplete.initByTag(childrenIndex+2, childrenIndex+2); //+2 coz already exist 2 autocompletes
        }
        catch (e) {
            console.log(local+'\n', e);
            //throw e;
        }
    }

    async insertRealizationData(date){
        await this.realizationDate.openAndSelectDate(date);
    }

    async insertInspector(inspectorName){
        await this.inspectorAutoComplete.type(inspectorName);
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

}

module.exports = ActivityAdditionItemPaper;