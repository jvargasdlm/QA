const ReportPage = require('./ReportPage');

class ExamReportPage extends ReportPage {

    constructor(page){
        super(page);
    }

    async extractItems(){
        const innerTextArrays = await this.page.evaluate((valuesSelector) => {
            let result = [];
            const elements = Array.from(document.body.querySelectorAll(valuesSelector));
            for (let i = 0; i < elements.length; i++) {
                let elementParts = Array.from(elements[i].querySelectorAll('p'));
                let innerTextArr = elementParts.map( (elem) => elem.innerText);
                result.push(innerTextArr);
            }
            return result;
        }, ReportPage.selectors.ITEMS);

        let items = [];
        for(let arr of innerTextArrays){
            items.push(new ExamReportItem(arr));
        }
        return items;
    }
}

class ExamReportItem {

    constructor(innerTextArr){
        this.title = innerTextArr[0];
        let [subtitle, val] = innerTextArr[1].split(':');
        let [empty, value, unit] = val.split(' ');
        this.subtitle = subtitle;
        this.value = value;
        this.unit = unit;
    }
}

module.exports = ExamReportPage;