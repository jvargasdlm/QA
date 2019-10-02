const PageOtus = require('./PageOtus');
const ActivityQuestionAnswer = require('./ActivityQuestionAnswer');

const selectors = {
    commanderButtons: {
        PREVIOUS_QUESTION: '#previousQuestion',
        CANCEL: '#cancelActivity',
        SAVE: '#saveActivity',
        NEXT_QUESTION: '#nextQuestion'
    },
    inputDataType: {
        'number': "input[aria-label='Insira um valor inteiro']",
        'text': '#textQuestion',
        'date': "input[aria-label='Insira a data']",
        'time': '#inputtime',
        'singleOption': function(label){
            return `md-radio-button[aria-label='${label}']`;
            },
        'multipleOption': function(label){
            return `md-checkbox[aria-label='${label}']`;
        }
    }
};

class PreviewPage extends PageOtus {

    constructor(page){
        super(page);
    }

    async fillActivityQuestions(answersArr){
        await this.clickWithWait("button[aria-label='Iniciar']");
        const inputSelectors = selectors.inputDataType;
        const types = ActivityQuestionAnswer.dataTypes;

        for(let answer of answersArr){
            switch (answer.type) {
                case types.time:
                    await this.clickWithWait(inputSelectors.time);
                    await this.typeWithWait(inputSelectors.time, answer.value); break;
                case types.singleOption:
                    await this.clickWithWait(inputSelectors.singleOption(answer.value)); break;
                case types.multipleOption:
                    await this.clickWithWait(inputSelectors.multipleOption(answer.value));
                    break;
                default:
                    await this.typeWithWait(inputSelectors[answer.type], answer.value); break;
            }

            await this.waitForMilliseconds(500); // for NEXT BUTTON "to know" that input was filled
            await this.clickWithWait(selectors.commanderButtons.NEXT_QUESTION);
        }

        // finalize
        await this.clickWithWait("button[aria-label='Finalizar']");
        await this.waitLoad();
    }
}

module.exports = PreviewPage;