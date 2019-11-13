const GridItem = require('../../../classes/GridItem');

const statusIcons = {
    NEW: "fiber_new",
    SAVE: "save",
    FINALIZED: "check_circle"
};

const typeEnum = {
    ON_LINE: 0,
    PAPER: 1
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

    get getAllStatus(){
        return statusIcons;
    }

    get getTypeEnum(){
        return typeEnum;
    }

    async extractInfo() {
        const content = await super.extractBodyContent();
        this.data = {
            acronym: content[0],
            status: content[1],
            name: content[2],
            externId: content[3].split(": ")[1],
            realization: content[4].split(": ")[1],
            category: content[5]
        };
        this.data.type = (await this.elementHandle.$(selectors.type.ON_LINE) ?
                typeEnum.ON_LINE : typeEnum.PAPER);

        return this.data;
    }

}

module.exports = ActivityItem;