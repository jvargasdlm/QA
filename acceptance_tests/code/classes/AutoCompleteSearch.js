const PageElement = require('./PageElement');

const selectors = {
    SUGGESTIONS_CONTAINER: 'md-virtual-repeat-container', // COULD HAVE MORE THAN ONE
    SUGGESTIONS_CONTAINER_ID: "autoCompleteOptionList",
    SUGGESTIONS_CONTAINER_UNIQUE_ATTR: "style",
    SUGGESTION_LIST: 'ul',
    SUGGESTION_LIST_ID: "suggestionList",
    SUGGESTION_ITEM_LIST: 'li'
};

class SearchInput extends PageElement {

    constructor(pageExt, id){
        super(pageExt, "input", id);
    }

    async typeAndClickOnItemList(inputSelector, text, index){
        await this.pageExt.typeWithWait(inputSelector, text);
        await this._clickOnSomeSuggestionOfList(index);
    }

    async typeAndClickOnFirstOfList(inputSelector, text){
        await this.pageExt.typeWithWait(inputSelector, text);
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

        await this.pageExt.saveHTML("bug");//.

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

module.exports = SearchInput;