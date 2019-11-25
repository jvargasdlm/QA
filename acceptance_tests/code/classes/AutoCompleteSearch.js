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
        this.suggestionsContainer = new PageElement(pageExt, "md-virtual-repeat-container");
    }

    async initById(id, index=0, suggestionsContainerIndex=0){
        await super.initById(id);
        await this._initMyOwnAttributes(index, suggestionsContainerIndex);
    }

    async initByTag(index=0, suggestionsContainerIndex=0){
        await super.initByTag(index);
        await this._initMyOwnAttributes(index, suggestionsContainerIndex);
    }

    async _initMyOwnAttributes(index=0, suggestionsContainerIndex=0){
        this.inputText.elementHandle = await this.elementHandle.$(this.inputText.tagName);
        this.clearButton.elementHandle = await this.elementHandle.$(this.clearButton.tagName);

        const suggestionsId = `suggestionList${suggestionsContainerIndex}`;
        await this.suggestionsContainer.initByTagAndSetTempId(suggestionsId, suggestionsContainerIndex);
    }

    async clear(){
        //if(!this.clearButton.elementHandle){
            this.clearButton.elementHandle = await this.elementHandle.$(this.clearButton.tagName);
        //}
        await this.clearButton.click();
        await this.pageExt.clickOut();
    }

    async typeAndClickOnItemList(inputSelector, text, index){
        await this.pageExt.typeWithWait(inputSelector, text);
        await this._clickOnSomeSuggestionOfList(index);
    }

    async type(text){
        await this.inputText.type(text);
    }

    async typeAndClickOnFirstOfList(text){
        await this.inputText.click();
        await this.pageExt.waitForMilliseconds(1000); // wait options appear
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

    async _clickOnSomeSuggestionOfList(suggestionIndex, optionPrefixId="autoCompleteOption"){
        const id = `${optionPrefixId}${suggestionIndex}`;
        try{
            //await this.inputText.click();
            // const selector = `${this.suggestionsContainer.tagName}[aria-hidden='false']`;
            // await this.pageExt.waitForSelector(selector);

            await this.pageExt.setHiddenAttributeValue('#'+this.suggestionsContainer.id, false);

            await this.pageExt.findChildrenToSetTempIds(
                '#'+this.suggestionsContainer.id,
                selectors.SUGGESTION_ITEM_LIST,
                [id], suggestionIndex);

            await this.pageExt.clickWithWait(`[id='${id}']`);
        }
        catch (e) {
            console.log("option id =", id);
            throw e;
        }
    }
}

module.exports = AutoCompleteSearch;