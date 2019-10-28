let choiceGroups = {
    choiceObj: {},
    set: function(choiceArr){
        this.choiceObj = choiceArr;
    },
    findChoiceLabel: function (value){
        const isNumValue = !isNaN(parseInt(value));
        const isBoolValue = (value === 'true' || value === 'false');
        if(isNumValue || isBoolValue){
            return value;
        }
        for(let [id, choices] of Object.entries(this.choiceObj)) {
            for (let choice of choices) {
                if(choice.name === value){
                    return choice.label;
                }
            }
        }
    }
};

module.exports = {
    // constants
    DEFAULT_NODES: {
        BEGIN: {id: "BEGIN NODE", index: 0},
        END: {id: "END NODE", index: 1}
    },
    FIRST_QUESTION_INDEX: 2,
    END_PAGE_ID: "END_PAGE",
    // variables
    metaDataGroups: {},
    choiceGroups: choiceGroups,
    dictQuestionNameId: {},
    ehrQuestionnaire: undefined
};