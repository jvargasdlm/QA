const dataTypes = {
    number: 'number',
    text: 'text',
    date: 'date',
    time: 'time',
    singleOption: 'singleOption',
    multipleOption: 'multipleOption'
};

class ActivityQuestionAnswer {

    constructor(type, value){
        this.type = type;
        this.value = value;
    }

    static get dataTypes(){
        return dataTypes;
    }

}

module.exports = ActivityQuestionAnswer;