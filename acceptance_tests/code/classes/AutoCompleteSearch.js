const PageElement = require('./PageElement');
const InputField = require('./InputField');
const Button = require('./Button');

const selectors = {
    TAG: "md-autocomplete-wrap",
    //CLEAN_BUTTON: "button[aria-label='Clear Input']",
    SUGGESTIONS_CONTAINER: 'md-virtual-repeat-container', // COULD HAVE MORE THAN ONE
    SUGGESTION_ITEM_LIST: 'li'
};

class AutoCompleteSearch extends PageElement {

    constructor(pageExt){
        super(pageExt, "md-autocomplete-wrap");
        this.inputText = new InputField(pageExt);
        this.clearButton = new Button(pageExt);
    }

    async initById(id, index=0, suggestionsContainerIndex=0){
        await super.initById(id);
        this.inputText.elementHandle = await this.elementHandle.$(this.inputText.tagName);
        this.clearButton.elementHandle = await this.elementHandle.$(this.clearButton.tagName);
    }

    async initByTag(index=0, suggestionsContainerIndex=0){
        await super.initByTag(index);
        this.inputText.elementHandle = await this.elementHandle.$(this.inputText.tagName);
        this.clearButton.elementHandle = await this.elementHandle.$(this.clearButton.tagName);
    }

    async type(text){
        await this.inputText.type(text);
    }

    async typeAndClickOnFirstOfList(text){
        // force hide all autocompletes
        await this.pageExt.page.evaluate((selector) => {
            const elements = Array.from(document.body.querySelectorAll(selector));
            for (let i = 0; i < elements.length; i++) {
                elements[i].setAttribute('aria-hidden', 'true');
            }
        }, selectors.SUGGESTIONS_CONTAINER);

        await this.inputText.click();
        await this.pageExt.waitForMilliseconds(1000); // wait options appear
        await this.inputText.type(text);
        await this.pageExt.waitForMilliseconds(1000); // wait options appear
        await this._clickOnSomeSuggestionOfList(0);
    }

    async _clickOnSomeSuggestionOfList(suggestionIndex){
        const containerVisibleOptionsSelector = selectors.SUGGESTIONS_CONTAINER + `[aria-hidden='false']`;
        try{
            const container = await this.pageExt.waitForSelector(containerVisibleOptionsSelector);
            const options = await container.$$(selectors.SUGGESTION_ITEM_LIST);
            await options[suggestionIndex].click();
        }
        catch (e) {
            console.log(await this.pageExt.page.evaluate((containerVisibleOptionsSelector) => {
                const container = document.body.querySelector(containerVisibleOptionsSelector);
                return container.outerHTML;
            }, containerVisibleOptionsSelector)
            );
            throw e;
        }
    }
}

module.exports = AutoCompleteSearch;