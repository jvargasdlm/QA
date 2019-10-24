const globalVars = require('./globalVars');
const ExpressionEhr = require('./ExpressionEhr');
const NavigationHandler = require('./NavigationHandler');

class Rule {

    constructor(questionPageId, ehrRule){
        this.originPageId = questionPageId;
        this.origin = '';
        this.targetPageId = ehrRule.targetPageId;
        this.target = '';
        this.expressions = [];
        this._extractExpressions(ehrRule);
    }

    _extractExpressions(ehrRule){
        let ehrRuleArr = ehrRule.rule;
        for(let exprObj of ehrRuleArr){
            for(let expression of exprObj.expression){
                let questionId = globalVars.dictQuestionNameId[expression.questionName];
                this.expressions.push(new ExpressionEhr(expression, questionId));
            }
        }
        /*if(br.rule.length > 1){
           console.log(questionPage.id);
       }*/
    }

    equals(otherRule){
        if(!otherRule instanceof Rule){
            throw `Rule.equals: received object is not a Rule - ${JSON.stringify(otherRule, null, 4)}`;
        }
        return (
            otherRule.originPageId === this.originPageId &&
            otherRule.targetPageId === this.targetPageId);
    }

    setOriginAndTargetQuestionIds(originQuestionId, targetQuestionId){
        this.origin = originQuestionId;
        if(this.targetPageId === globalVars.END_PAGE_ID){
            this.target = globalVars.DEFAULT_NODES.END.id;
        }
        else{
            this.target = targetQuestionId;
        }
    }

    toOtusStudioObj(){
        let expressions = [];
        for(let expr of this.expressions){
            expressions.push(expr.toOtusStudioObj());
        }

        return NavigationHandler.getNonDefaultRoutesObj(this.origin, this.target, expressions);
    }
}

module.exports = Rule;