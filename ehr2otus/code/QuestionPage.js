const globalVars = require('./globalVars');
const NavigationHandler = require('./NavigationHandler');

const AutoCompleteQuestion = require('./questions/AutoCompleteQuestion');
const BasicQuestionGroup = require('./questions/BasicQuestionGroup');
const BooleanQuestion = require('./questions/BooleanQuestion');
const DateQuestion = require('./questions/DateQuestion');
const NumericQuestion = require('./questions/NumericQuestion');
const SingleSelectionQuestion = require('./questions/SingleSelectionQuestion');
const TextQuestion = require('./questions/TextQuestion');
const Rule = require('./Rule');

let visibleWhenCounter = 0;//.

let _basicQuestionGroupStack = {
    stack: [],
    size: 0,
    reset: function () {
        this.stack = [];
        this.size = 0
    },
    push: function (basicQuestionGroup) {
        this.stack.push(basicQuestionGroup);
        this.size++;
    },
    pop: function () {
        this.stack.pop();
        if(this.size > 0) {
            this.size--;
        }
    },
    getTop: function () {
        return this.stack[this.size-1];
    },
    addQuestionId: function (questionId) {
        if(this.size > 0){
            this.getTop().addQuestionId(questionId);
        }
    }
};

let _visibleWhenControll = {};

class QuestionPage {

    constructor(){
        this.id = '';
        this.nextPageId = '';
        this.questions = [];
        this.rules = [];
        this.basicQuestionGroups = [];
    }

    getFirstQuestion(){
        return this.questions[0];
    }

    getLastQuestion(){
        return this.questions[this.questions.length-1];
    }

    readFromJsonObj(ehrQuestionPageObj){
        this.id = ehrQuestionPageObj.id;
        this.nextPageId = ehrQuestionPageObj.nextPageId;
        
        let questionObjsArr = Object.entries(ehrQuestionPageObj).filter(([key,value]) => key.includes('Question'));
        this._readQuestions(questionObjsArr);
        _basicQuestionGroupStack.reset();

        this._readRules(ehrQuestionPageObj);

        if(this.basicQuestionGroups.length > 0){
            console.log("\n", this.id, this.basicQuestionGroups);
        }
    }

    _readQuestions(questionObjsArr){
        const questionFuncDict = {
            "autocompleteQuestion": AutoCompleteQuestion,
            "booleanQuestion": BooleanQuestion,
            "dateQuestion": DateQuestion,
            "numericQuestion": NumericQuestion,
            "singleSelectionQuestion": SingleSelectionQuestion,
            "textQuestion": TextQuestion
        };
        try {
            for (let [key, questionObjArr] of questionObjsArr) {
                if (key === "basicQuestionGroup") {
                    for (let questionObj of questionObjArr) {
                        let basicQuestionGroup = new BasicQuestionGroup();
                        this.basicQuestionGroups.push(basicQuestionGroup);

                        _basicQuestionGroupStack.push(basicQuestionGroup);

                        basicQuestionGroup.id = questionObj.id;
                        basicQuestionGroup.name = questionObj.name;
                        let subQuestionObjsArr = Object.entries(questionObj).filter(([key, value]) => key.includes('Question'));
                        this._readQuestions(subQuestionObjsArr);

                        _basicQuestionGroupStack.pop();
                    }
                }
                else {
                    for (let questionObj of questionObjArr) {
                        let questionClazz = questionFuncDict[key];
                        let question = new questionClazz(questionObj, this.id);
                        this.questions.push(question);
                        globalVars.dictQuestionNameId[question.name] = question.id;
                        if (_basicQuestionGroupStack.size > 0) {
                            _basicQuestionGroupStack.addQuestionId(question.id);
                        }
                    }
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    _readRules(ehrQuestionPage){
        let branch = ehrQuestionPage.branch;
        if(!branch){
            return;
        }
        for(let ehrRule of branch) {
            this.rules.push(new Rule(this.id, ehrRule));
        }
    }

    toOtusStudioTemplate(otusStudioTemplate){
        for(let question of this.questions){
            otusStudioTemplate["itemContainer"].push(question.toOtusStudioObj());
            if(question.visibleWhen){
                let hiddenQuestionId = globalVars.dictQuestionNameId[question.hiddenQuestion];
                if(!hiddenQuestionId){ // its a basic question group
                    let basicQuestionGroup = this.basicQuestionGroups.filter((x) => x.name === question.hiddenQuestion)[0];
                    hiddenQuestionId = basicQuestionGroup.getFirstQuestionId();
                }
                console.log(JSON.stringify({
                    question: question.id,
                    hiddenQuestionName: question.hiddenQuestion,
                    hiddenQuestionId: hiddenQuestionId,
                    visibleWhen: globalVars.choiceGroups.findChoiceLabel(question.visibleWhen)
                }, null, 4));
            }
        }
        this._getOtusNavigationObj(otusStudioTemplate["navigationList"]);
        otusStudioTemplate["surveyItemGroupList"].push(this._getOtusGroupListObj());
    }

    _getOtusNavigationObj(navigationList){

        function _navigationItemListForQuestion(question, inNavigation, routes) {
            return NavigationHandler.getNavigationListQuestionElementObj(question.id, question.index, inNavigation, routes)
        }

        const firstQuestion = this.getFirstQuestion();
        let inNavigation = this._inNavigationArrForFirstQuestion();

        if(this.questions.length === 1){
            let nextQuestionId = this._getQuestionIdDefaultRouteToNextPage(this.nextPageId);
            let routes =  [
                NavigationHandler.getDefaultRouteObj(firstQuestion.id, nextQuestionId)
            ];
            this._pushNonDefaultRoutesOtusObj(routes);
            navigationList.push(_navigationItemListForQuestion(firstQuestion, inNavigation, routes));
            return;
        }

        // First Question: with only 1 route to 2th question
        let routes =  [
            NavigationHandler.getDefaultRouteObj(firstQuestion.id, this.questions[1].id)
        ];
        navigationList.push(_navigationItemListForQuestion(firstQuestion, inNavigation, routes));

        // Middle Questions
        let i = 1;
        for (i = 1; i < this.questions.length-1; i++) {
            inNavigation = [
                NavigationHandler.getInNavigationObj(this.questions[i-1].id, this.questions[i-1].index)
            ];
            let routes =  [
                NavigationHandler.getDefaultRouteObj(this.questions[i].id, this.questions[i+1].id)
            ];
            navigationList.push(_navigationItemListForQuestion(this.questions[i], inNavigation, routes));
        }

        // Last Question
        const lastQuestion = this.getLastQuestion();
        inNavigation = [
            NavigationHandler.getInNavigationObj(this.questions[i-1].id, this.questions[i-1].index)
        ];
        let nextQuestionId = this._getQuestionIdDefaultRouteToNextPage(this.nextPageId);
        routes =  [
            NavigationHandler.getDefaultRouteObj(lastQuestion.id, nextQuestionId)
        ];
        this._pushNonDefaultRoutesOtusObj(routes);
        navigationList.push(_navigationItemListForQuestion(lastQuestion, inNavigation, routes));
    }

    _inNavigationArrForFirstQuestion(){
        try {
            let prevQuestionPage = globalVars.ehrQuestionnaire.getPreviousQuestionPageOf(this.id);
            let prevQuestion = prevQuestionPage.getLastQuestion();
            return [NavigationHandler.getInNavigationObj(prevQuestion.id, prevQuestion.index)];
        }
        catch (e) {
            const BEGIN_NODE = globalVars.DEFAULT_NODES.BEGIN;
            if(e === BEGIN_NODE){
                return [NavigationHandler.getInNavigationObj(BEGIN_NODE.id, BEGIN_NODE.index)];
            }
            return [];
        }
    }

    _getQuestionIdDefaultRouteToNextPage(nextPageId){
        try {
            return globalVars.ehrQuestionnaire.getFirstQuestionIdFromQuestionPage(nextPageId);
        }
        catch (e) {
            if(e !== globalVars.END_PAGE_ID){
                throw e;
            }
            return globalVars.DEFAULT_NODES.END.id;
        }
    }

    _pushNonDefaultRoutesOtusObj(routes){
        const lastQuestion = this.getLastQuestion();
        for (let rule of this.rules) {
            let targetQuestionId = this._getQuestionIdDefaultRouteToNextPage(rule.targetPageId);
            rule.setOriginAndTargetQuestionIds(lastQuestion.id, targetQuestionId);
            routes.push(rule.toOtusStudioObj());
        }
    }

    _getOtusGroupListObj(){
        const first = this.getFirstQuestion().id;
        const last = this.getLastQuestion().id;

        let members = [{
            "id": first,
            "position": "start"
        }];

        for (let i = 1; i < this.questions.length; i++) {
            members.push({
                "id": this.questions[i].id,
                "position": "middle"
            })
        }

        members.push({
            "id": last,
            "position": "end"
        });

        return {
            "objectType": "SurveyItemGroup",
            "start": first,
            "end": last,
            "members": members
        }
    }
}

module.exports = QuestionPage;