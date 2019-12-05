const PageElement = require('./PageElement');

const selectors = {
    HEADER: "md-grid-tile-header"
};

class GridItem extends PageElement {

    constructor(pageExt){
        super(pageExt, "md-grid-tile");
        this.headerId = undefined;
    }

    static get headerTag(){
        return selectors.HEADER;
    }

    async initHeader(){
        this.headerId = this.id + '_header';
        await this.findChildrenToSetTempIds(selectors.HEADER, [this.headerId]);
    }

    async extractContent(){
        const text = await this.pageExt.page.evaluate((selector) => {
            let text = document.body.querySelector(selector).innerText;
            ['delete\n','Informações do Usuário\.\n','Id externo não requerido *']
                .forEach(word => {text = text.replace(word, '')});
            return text;
        }, '#'+this.id);
        //console.log(text);
        return text.split('\n').filter(w => w.length > 0); //todo
    }

}

module.exports = GridItem;