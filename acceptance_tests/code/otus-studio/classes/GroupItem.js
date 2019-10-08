const DynamicElement = require('../../classes/DynamicElement');

// ***********************************************
// Constants

const stateItemGroup = {
    CREATE: 'createGroup',
    EDITOR_SAVE: 'editorGroup', // disket icon
    VALIDATE_CHECKBOX: 'validateGroup', // checkbox
    INVALIDATE: 'invalidateGroup',
    SAVED_EDITOR: 'savedGroupEditor', // first saved group question
    SAVED_ITEM: 'savedGroupItem',    // middle saved group question
};

const selectors = {
    ITEM_GROUP_TYPE: 'item-group-type'
};

// ***********************************************
// Private Functions

function _extractStateFromId(id) {
    let parts = id.split('_');
    if(parts.length < 2){
        return 'undefinedInGroupItemId';
    }
    return parts[0];
}

// ***********************************************

class GroupItem extends DynamicElement { // could be a button or checkbox

    constructor(editionTabPage){
        super(editionTabPage); // dont need define states (has static method) or id
    }

    async init(parentElementHandle){
        await super.init(parentElementHandle, selectors.ITEM_GROUP_TYPE);
    }

    async updateAndGetState() {
        this.id = await this.extractIdFromElemHandle(); // this.getAttribute('id');
        this.state = _extractStateFromId(this.id);
        return this.state;
    }

    // ------------------------------------------------------
    // Static methods

    static get stateItemEnum(){
        return stateItemGroup;
    }
}

module.exports = GroupItem;