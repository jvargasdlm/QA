const PageElement = require('./PageElement');

class Button extends PageElement {

    constructor(pageExt){
        super(pageExt, 'button');
    }

}

module.exports = Button;