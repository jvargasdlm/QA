const PageElement = require('./PageElement');

const sideEnum = {
    left: "left",
    right: "right"
};

const selectors = {
    sideAttribute: "md-component-id",
    closedAttrValue: {
        key: "md-close",
        closedAtBegin: "class='md-sidenav-left md-whiteframe-1dp md-closed ng-isolate-scope _md md-default-theme layout-column'",
        open: "class=''",
        closedAgain: "class=''",
    }
};

/*
closed:
md-sidenav-left md-whiteframe-1dp md-closed ng-isolate-scope _md md-default-theme layout-column
open:
md-sidenav-left md-whiteframe-1dp ng-isolate-scope _md md-default-theme layout-column
closed again:
md-sidenav-left md-whiteframe-1dp ng-isolate-scope _md md-default-theme layout-column md-closed
 */

class Sidenav extends PageElement {

    constructor(pageExt, side=sideEnum.left){
        super(pageExt, "md-sidenav");
        this.side = side;
        this.classAttrValue = '';
    }

    async init(){
        await this.initBySelector(`${this.tagName}[${selectors.sideAttribute}=${this.side}`);
        this.classAttrValue = this.getAttribute("class");
    }

    async isOpen(){
        const classAttrValue = this.getAttribute("class");
        return (!classAttrValue.includes(selectors.closedAttrValue));
    }

    async waitForOpen(){

    }



}

module.exports = {Sidenav, sideEnum};