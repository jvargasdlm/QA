const PageElement = require('./PageElement');

const directionEnum = {
    left: 'left',
    right: 'right',
    down: 'down',
    up: 'up'
};

const selectors = {
    trigger:{
        tag: 'md-fab-trigger',
        open: function () {
            return this.trigger.tag + "[aria-expanded='true']"
        }
    },
    actions:{
        tag: 'md-fab-actions',
        open: function(){
            return this.actions.tag + "[aria-hidden='false']"
        }
    }
};

class SpeedDial extends PageElement {

    constructor(pageExt, directionEnumValue){
        super(pageExt, "md-fab-speed-dial");
        this.direction = directionEnumValue;
        this.triggerButton = null;
        this.actionButtons = [];
    }

    async init(triggerButtonId, actionButtonIdArr, id){
        if(id){
            this.id = id;
            await this.init(id);
        }
        else{
            await this.initByTag();
        }

        await this.pageExt.findChildrenButtonToSetTempIds(selectors.trigger.tag, [triggerButtonId]);
        await this.pageExt.findChildrenButtonToSetTempIds(selectors.actions.tag, actionButtonIdArr);

        this.triggerButton = await this.pageExt.page.$(`[id='${triggerButtonId}']`);
        for(let id of actionButtonIdArr){
            this.actionButtons.push(await this.pageExt.page.$(`[id='${id}']`));
        }
    }

    async clickToOpenAndChooseAction(actionOptionIndex){
        try{
            await this.elementHandle.click();
            await this.pageExt.waitForSelector(selectors.trigger.open());
            await this.actionButtons[actionOptionIndex].click();
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    }

    async isOpen(){
        const triggerElemHandler = await this.elementHandle.$(selectors.trigger.tag);
        return PageElement.s_getAttribute(triggerElemHandler, selectors.trigger.open());
    }

    async forceOpen(){

    }

}

module.exports = {SpeedDial, directionEnum};