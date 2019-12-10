const ActivityItem = require('./ActivityItem');

const selectors = {
    TAG: "otus-activity-adder-card",
    deleteButton: {
        SELECTOR: "[aria-label='Remover']",
        TEMP_ID: "deleteItemButton"
    },
    EXTERNAL_ID: "[name='externalid']"
};

class ActivityAdditionItem extends ActivityItem {

    constructor(pageExt){
        super(pageExt);
        this.index = 0;
        this.tagName = selectors.TAG;
        this.closeButton = pageExt.getNewButton();
        this.externalIdInput = pageExt.getNewInputField();
    }

    async init(indexInHtml){
        this.index = indexInHtml;
        const id = await this.pageExt.getAttributeBySelector(selectors.TAG, 'id', indexInHtml);
        await this.initById(id);

        // close button
        const closeButtonSelector = this.closeButton.tagName + selectors.deleteButton.SELECTOR;
        const tempId = `${selectors.deleteButton.TEMP_ID}${indexInHtml}`;
        await this.pageExt.page.evaluate( (id, buttonSelector, buttonTempId) => {
            const element = document.body.querySelector(id);
            const button = element.querySelector(buttonSelector);
            button.setAttribute('id', buttonTempId);
        }, '#'+this.id, closeButtonSelector, tempId);
        await this.closeButton.initById(tempId);

        const inputTag = this.externalIdInput.tagName;
        this.externalIdInput.elementHandle = await this.elementHandle.$(inputTag + selectors.EXTERNAL_ID);
    }

    get requireExternalId(){
        return (!!this.externalIdInput.elementHandle);
    }

    async insertExternalId(externalId){
        try{
            await this.externalIdInput.type(externalId);
        }
        catch (e) {
            if(this.externalIdInput.elementHandle){
                throw e;
            }
        }
    }

    async extractData(){
        const content = await super.extractContent();
        this.data = {
            acronym: content[0],
            type: ActivityAdditionItem.typeEnum.ON_LINE,
            status: ActivityAdditionItem.statusEnum.NEW,
            name: content[1],
            externalId: (this.externalIdInput.elementHandle? this.externalIdInput.content : null),
            realizationDate: '',
            category: (content[2].split(": ")[1]).toUpperCase()
        };
        return this.data;
    }

}

module.exports = ActivityAdditionItem;