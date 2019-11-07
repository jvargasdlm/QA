const PageOtus = require('../PageOtus');
const ActivityCard = require('./ActivityCard');

const selectors = {
    switches: {
        type: "[aria-label='ActivityType']",
        quantity: "[aria-label='ActivitySelection']"
    },
    category: "md-select", // "[aria-label='Categoria: NORMAL']" //<<
    SEARCH_INPUT: "input[aria-label='Atividade']"
};

const enums = {
    type:{
        ON_LINE: false,
        PAPER: true
    },
    quantity: {
        UNIT: false,
        LIST: true
    },
    category:{
        NORMAL: 0,
        QUALITY_CONTROLL: 1,
        REPETITION: 2
    }
};

class ActivityAdderPage extends PageOtus {

    constructor(page){
        super(page);
        this.typeSwitch = this.getNewSwitch();
        this.quantitySwitch = this.getNewSwitch();
        this.categorySelector = this.getNewOptionSelector();
        this.searchInput = this.getNewSearchInput();
    }

    async init(){
        await this.typeSwitch.forceSetId(selectors.switches.type, "typeSwitch");
        await this.quantitySwitch.forceSetId(selectors.switches.quantity, "quantitySwitch");
        await this.categorySelector.forceSetId(selectors.category, "categorySelector");
        await this.searchInput.forceSetId("md-autocomplete-wrap > input", "searchActivityInput");
    }

    static get categoryEnum(){
        return enums.category;
    }

    async switchTypeToOnline(){
        console.log("to on-line");
        if(this.typeSwitch.isOn !== enums.type.ON_LINE){
            await this.typeSwitch.change();
        }
    }

    async switchTypeToPaper(){
        console.log("to paper");
        if(this.typeSwitch.isOn !== enums.type.PAPER){
            await this.typeSwitch.change();
        }
    }

    async switchQuantityToUnit(){
        if(this.quantitySwitch.isOn !== enums.quantity.UNIT){
            await this.quantitySwitch.change();
        }
    }

    async switchQuantityToList(){
        if(this.quantitySwitch.isOn !== enums.quantity.LIST){
            await this.quantitySwitch.change();
        }
    }

    async selectCategory(categoryEnumValue=enums.category.NORMAL){
        //await this.categorySelector.selectOptionByIndex_temp(categoryEnumValue); // todo
    }

    async searchActivity(nameOrAcronym){
        await this.searchInput.typeAndClickOnFirstOfList(selectors.SEARCH_INPUT, nameOrAcronym);
    }
}

module.exports = ActivityAdderPage;