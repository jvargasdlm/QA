const PageElement = require('./PageElement');

class DynamicElement extends PageElement {

    constructor(pageExt, allPossibleStateIds, id){
        super(pageExt);
        this.allStateIds = allPossibleStateIds; // useful for element without own class
        this.state = '';
        this.id = id;
    }

    async init(parentElementHandle, selector){
        this.elementHandle = await parentElementHandle.$(selector);
        await this.updateAndGetState();
    }

    async updateAndGetState() {
        //TODO
        return this.state;
    }

    /*
    * Run all possible ids looking for this element.
    * If found it, return aria-hidden attribute value
     */
    async isHidden(){
        const ids = Object.entries(this.allStateIds).map(([key,id]) => {return id});
        let i=0, found=false, isHidden=true;
        do{
            [found, isHidden] =
                await this.pageExt.page.evaluate((id) => {
                   let element = document.body.querySelector(id);
                   if(element){
                       return [true, element.getAttribute('aria-hidden')];
                   }
                   return [false, true];
                }, ids[i++]);
        }
        while(!found && i < ids.length);
        return isHidden;
    }

}

module.exports = DynamicElement;