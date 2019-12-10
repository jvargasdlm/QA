const PageElement = require('./PageElement');

const selectors = {
    HEADER: "md-grid-tile-header"
};

class GridItem extends PageElement {

    constructor(pageExt){
        super(pageExt, "md-grid-tile");
    }

    static get headerTag(){
        return selectors.HEADER;
    }

    async extractContent(){
        const text = await this.pageExt.page.evaluate((selector) => {
            let text = document.body.querySelector(selector).innerText;
            ['delete\n','Informações do Usuário\.\n','Id externo não requerido *']
                .forEach(word => {text = text.replace(word, '')});
            return text;
        }, '#'+this.id);
        return text.split('\n').filter(w => w.length > 0);
    }

}

module.exports = GridItem;