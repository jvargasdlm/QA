const PageElement = require('./PageElement');

/*
<input
type="search" id="..." name="autocompleteField" ng-if="!floatingLabel"
autocomplete="off" ng-required="$mdAutocompleteCtrl.isRequired" ng-disabled="$mdAutocompleteCtrl.isDisabled"
ng-readonly="$mdAutocompleteCtrl.isReadonly" ng-model="$mdAutocompleteCtrl.scope.searchText"
ng-keydown="$mdAutocompleteCtrl.keydown($event)" ng-blur="$mdAutocompleteCtrl.blur($event)"
ng-focus="$mdAutocompleteCtrl.focus($event)"
placeholder="Digite ..." aria-autocomplete="list" role="combobox" aria-haspopup="true"
aria-activedescendant="" aria-expanded="false" class="..." required="required" aria-invalid="true" style="">
 */

const selectors = {
    AUTO_COMPLETE_SUGGESTIONS: 'md-virtual-repeat-container',
    AUTO_COMPLETE_ITEM: 'li'
};

class SearchInput extends PageElement {

    constructor(pageExt){
        super(pageExt, "input");
    }

    async _clickOnSomeSuggestionOfList(index){
        await this.pageExt.waitForSelector(selectors.AUTO_COMPLETE_SUGGESTIONS);
        let tempIdArr = await this.pageExt.findChildrenToSetTempIdsFromInnerText(selectors.AUTO_COMPLETE_SUGGESTIONS, selectors.AUTO_COMPLETE_ITEM);
        await this.pageExt.clickWithWait(`[id='${tempIdArr[index]}']`);
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
}

module.exports = SearchInput;