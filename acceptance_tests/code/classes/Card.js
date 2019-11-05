const PageElement = require("./PageElement");

const selectors = {
    tag: "md-card"
};

class Card extends PageElement{

    constructor(pageExt){
        super(pageExt, selectors.tag);
    }


}

module.exports = Card;