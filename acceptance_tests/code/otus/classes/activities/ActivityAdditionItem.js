const GridItem = require('../../../classes/GridItem');

const selectors = {
    deleteButtonIcon:{
        TAG: "md-icon",
        ATTR_NAME: 'aria-label',
        ATTR_VALUE: 'delete'
    },
    EXTERNAL_ID: "input[ng-model='activity.ExternalID']"
};

function getId(index){
    return "activity" + index;
}

class ActivityAdditionItem extends GridItem {

    constructor(pageExt){
        super(pageExt);
        this.closeButton = pageExt.getNewButton();
        this.externalIdInput = pageExt.getNewInputField();
        this.realizationDate = pageExt.getNewCalendar();
        this.inspectorAutoComplete = pageExt.getNewAutoCompleteSearch();
    }

    async init(index){
        await this.initBySelectorAndSetTempId(this.tagName, getId(index), index);

        // close button
        await this.pageExt.page.evaluate( (tag, index, buttonTag, iconSelector) => {
            const element = (document.body.querySelectorAll(tag))[index];
            const buttons = element.querySelectorAll(buttonTag);
            let i=0, found = false;
            do {
                let icon = buttons[i++].querySelector(iconSelector.TAG);
                found = (icon.getAttribute(iconSelector.ATTR_NAME) === iconSelector.ATTR_VALUE);
            }while (!found && i < buttons.length);
            buttons[--i].setAttribute('id', `deleteButton${index}`);
        }, this.tagName, index, this.closeButton.tagName, selectors.deleteButtonIcon);

        await this.closeButton.initById(`cancelButton${index}`);

        this.externalIdInput.elementHandle = await this.elementHandle.$(selectors.EXTERNAL_ID);
    }

    async insertExternalId(externalId){
        try{
            await this.externalIdInput.type(externalId);
        }
        catch (e) {
            if(!this.externalIdInput.elementHandle){
                throw "Activity has no external ID input element.";
            }
            throw e;
        }
    }

}

module.exports = ActivityAdditionItem;