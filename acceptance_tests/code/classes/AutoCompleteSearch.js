const PageElement = require('./PageElement');
const InputField = require('./InputField');
const Button = require('./Button');

const selectors = {
    TAG: "md-autocomplete-wrap",
    //CLEAN_BUTTON: "button[aria-label='Clear Input']",
    SUGGESTIONS_CONTAINER: 'md-virtual-repeat-container', // COULD HAVE MORE THAN ONE
    SUGGESTIONS_CONTAINER_ID: "autoCompleteOptionList",
    SUGGESTIONS_CONTAINER_UNIQUE_ATTR: "style",
    SUGGESTION_LIST: 'ul',
    SUGGESTION_LIST_ID: "suggestionList",
    SUGGESTION_ITEM_LIST: 'li'
};

class AutoCompleteSearch extends PageElement {

    constructor(pageExt){
        super(pageExt, "md-autocomplete-wrap");
        this.inputText = new InputField(pageExt);
        this.clearButton = new Button(pageExt);
    }

    async _initMyOwnAttributes(index=0){
        this.inputText.elementHandle = await this.elementHandle.$(this.inputText.tagName);
        this.clearButton.elementHandle = await this.elementHandle.$(this.clearButton.tagName);
    }

    async clear(){
        //if(!this.clearButton.elementHandle){
            this.clearButton.elementHandle = await this.elementHandle.$(this.clearButton.tagName);
        //}
        await this.clearButton.click();
    }

    async typeAndClickOnItemList(inputSelector, text, index){
        await this.pageExt.typeWithWait(inputSelector, text);
        await this._clickOnSomeSuggestionOfList(index);
    }

    async typeAndClickOnFirstOfList(text){
        await this.inputText.type(text);
        await this.pageExt.waitForMilliseconds(1000); // wait options appear
        await this._clickOnSomeSuggestionOfList(0);
    }

    async clickOnInputAndOnItemList(inputSelector, index=0){
        await this.pageExt.clickWithWait(inputSelector);
        await this._clickOnSomeSuggestionOfList(index);
    }

    async clickOnInputAndOnFirstOfList(inputSelector){
        await this.pageExt.clickWithWait(inputSelector);
        await this._clickOnSomeSuggestionOfList(0);
    }

    async _clickOnSomeSuggestionOfList(index){
        await this.pageExt.waitForSelector(selectors.SUGGESTIONS_CONTAINER);

        await this.pageExt.page.evaluate((selectors) => {
            const elements = Array.from(document.body.querySelectorAll(selectors.SUGGESTIONS_CONTAINER));
            let i = 0;
            const n = elements.length;
            if(n > 1) {
                let found = false;
                while(!found && i<n){
                    let uniqueAttrValue = elements[i++].getAttribute(selectors.SUGGESTIONS_CONTAINER_UNIQUE_ATTR);
                    found = (uniqueAttrValue && uniqueAttrValue !== '');
                }
                --i;
            }
            const container = elements[i];
            container.setAttribute("id", selectors.SUGGESTIONS_CONTAINER_ID);
            const suggestionList = container.querySelector(selectors.SUGGESTION_LIST);
            suggestionList.setAttribute("id", selectors.SUGGESTION_LIST_ID);

        }, selectors);

        let tempIdArr = await this.pageExt.findChildrenToSetTempIdsFromInnerText(
            '#'+selectors.SUGGESTION_LIST_ID,
            selectors.SUGGESTION_ITEM_LIST);

        const id = tempIdArr[index];
        try{
            await this.pageExt.clickWithWait(`[id='${id}']`);
        }
        catch (e) {
            console.log(id);
            throw e;
        }
    }
}

module.exports = AutoCompleteSearch;