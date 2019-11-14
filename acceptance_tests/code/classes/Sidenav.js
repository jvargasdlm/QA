const PageElement = require('./PageElement');

const sideEnum = {
    left: "left",
    right: "right"
};

const selectors = {
    sideAttribute: "md-component-id",
    closedAttrValue: {
        key: "md-close"
    },
    keyAttr: "class"
};

/*
closed (at benig):  md-sidenav-left md-whiteframe-1dp md-closed ng-isolate-scope _md md-default-theme layout-column
open:               md-sidenav-left md-whiteframe-1dp ng-isolate-scope _md md-default-theme layout-column
closed again:       md-sidenav-left md-whiteframe-1dp ng-isolate-scope _md md-default-theme layout-column md-closed
 */

class Sidenav extends PageElement {

    constructor(pageExt, side, index=0){
        super(pageExt, "md-sidenav");
        this.side = side;
        this.index = index; // if exist more than one with same side
        this.id = `sidenav_${this.side}_${this.index}`;
        //this.classAttrValue = undefined;
    }

    async init(){
        await this.initBySelectorAndSetTempId(`${this.tagName}[${selectors.sideAttribute}=${this.side}`, this.id, this.index);
        //this.classAttrValue = await this.getAttributeByDOM(selectors.keyAttr);
    }

    async isOpen(){
        //const classAttrValue = this.getAttribute(selectors.keyAttr);
        const classAttrValue = this.getAttributeByDOM(selectors.keyAttr);
        return (!classAttrValue.includes(selectors.closedAttrValue.key));
    }

    async waitForOpen(){
        await this.pageExt.page.waitForFunction( (id, selectors) => {
            !document.getElementById(id).getAttribute(selectors.keyAttr).includes(selectors.closedAttrValue.key)},
            {}, this.id, selectors);
    }

    async waitForClose(){
        await this.pageExt.page.waitForFunction(
            `document.getElementById(${this.id}).getAttribute(${selectors.keyAttr}).includes(${selectors.closedAttrValue.key})`);
    }

}

module.exports = {Sidenav, sideEnum};