const GridItem = require('../../../classes/GridItem');

const typeEnum = {
    ON_LINE: 0,
    PAPER: 1
};

const statusEnum = {
    NEW: 0, //"fiber_new"
    SAVE: 1, //"save"
    FINALIZED: 2 //"check_circle"
};

const selectors = {
    type: {
        ON_LINE: "div[aria-label='Online']",
        PAPER: "div[aria-label='Em papel']"
    }
};

class ActivityItem extends GridItem {

    constructor(pageExt){
        super(pageExt);
        this.data = {};
    }

    static get typeEnum(){
        return typeEnum;
    }

    static get statusEnum(){
        return statusEnum;
    }

    get idPrefix(){
        return "activity";
    }

    getId(index){
        return this.idPrefix + index;
    }

    extractIndexFromId(){
        return this.id.replace(this.idPrefix, '');
    }

    async init(index){
        await this.initById(this.getId(index));
        //await super.initHeader();
    }

    async extractData() {
        const content = await super.extractContent();
        this.data = {
            acronym: content[0],
            status: content[1],
            name: content[2],
            externalId: content[3].split(": ")[1],
            realizationDate: content[4].split(": ")[1],
            category: content[5]
        };
        this.data.type = (await this.elementHandle.$(selectors.type.ON_LINE) ?
                typeEnum.ON_LINE : typeEnum.PAPER);

        return this.data;
    }

    async isSelected(){
        const backGroundColor = await this.getAttributeByDOM(ActivityItem.headerTag, "style");
        return (backGroundColor && backGroundColor.length > 0);
    }

}

module.exports = ActivityItem;