const PageElement = require('./PageElement');

class Menu extends PageElement {

    constructor(pageExt){
        super(pageExt, "md-menu-content");
        this.itemIds = [];
    }

    async init(index=0){
        await this.initByTag(index);
    }

    async clickOnItem(itemIndex){
        const menuItem = (await this.elementHandle.$$("md-menu-item"))[itemIndex];
        await menuItem.click();
    }

    async clickOnItemById(id){
        const menuItem = await this.elementHandle.$(id);
        await menuItem.click();
    }

}

module.exports = Menu;