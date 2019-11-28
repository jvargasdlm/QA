const ActivityItem = require('./ActivityItem');

const selectors = {
    deleteButton: {
        SELECTOR: "[aria-label='Remover']",
        TEMP_ID: "deleteItemButton"
    },
    EXTERNAL_ID: "[name='externalid']"
};

class ActivityAdditionItem extends ActivityItem {

    constructor(pageExt){
        super(pageExt);
        this.closeButton = pageExt.getNewButton();
        this.externalIdInput = pageExt.getNewInputField();
        this.realizationDate = pageExt.getNewCalendar();
        this.inspectorAutoComplete = pageExt.getNewAutoCompleteSearch();
    }

    async init(index){
        await this.initBySelectorAndSetTempId(this.tagName, this.getId(index), index);

        // close button
        const closeButtonSelector = this.closeButton.tagName + selectors.deleteButton.SELECTOR;
        const tempId = `${selectors.deleteButton.TEMP_ID}${index}`;
        await this.pageExt.page.evaluate( (id, buttonSelector, buttonTempId) => {
            const element = document.body.querySelector(id);
            const button = element.querySelector(buttonSelector);
            button.setAttribute('id', buttonTempId);
        }, '#'+this.id, closeButtonSelector, tempId);
        await this.closeButton.initById(tempId);

        const inputTag = this.externalIdInput.tagName;
        this.externalIdInput.elementHandle = await this.elementHandle.$(inputTag + selectors.EXTERNAL_ID);
    }

    async insertExternalId(externalId){
        try{
            await this.externalIdInput.type(externalId);
        }
        catch (e) {
            if(this.externalIdInput.elementHandle){
                throw e;
            }
            console.log("Activity has no external ID input element.");
        }
    }

    async extractData(){
        const content = await super.extractContent();
        this.data = {
            acronym: content[0],
            status: ActivityAdditionItem.statusEnum.NEW,
            name: content[1],
            externalId: null,
            realizationDate: null,
            category: content[2]
        };
        return this.data;
    }

}

module.exports = ActivityAdditionItem;