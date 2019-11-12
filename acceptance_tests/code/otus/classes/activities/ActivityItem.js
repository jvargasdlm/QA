const GridItem = require('../../../classes/GridItem');

class ActivityItem extends GridItem {

    constructor(pageExt){
        super(pageExt);
        this.data = {};
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
    }

}

module.exports = ActivityItem;