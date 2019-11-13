const PageElement = require('./PageElement');

const selectors = {
    HEADER: "md-grid-tile-header"
};

class GridItem extends PageElement {

    constructor(pageExt){
        super(pageExt, "md-grid-tile");
    }

    // async init(index=0){
    //     await this.initByTag(index);
    // }

    async extractBodyContent(){
        const text = await this.pageExt.page.evaluate((selector) => {
            return document.body.querySelector(selector).innerText;
        }, '#'+this.id);
        return text.split('\n');
    }

}

module.exports = GridItem;