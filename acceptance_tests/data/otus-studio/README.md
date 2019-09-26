# Pattern for Otus Studio data files

The template file set for each test file must be saved to a directory of the same name.
In addition, json file names should be of the form "scenario<scenario id>_<test name or something like>.json", because the prefix "scenario<scenario id>" will be used as the key to fetch the template.

### Example:

Suppose the test file ```./group-questions-test.js``` includes scenarios #1 and #2, and two subcases of scenario 1 were created and use different templates.

```
describe('Group Question Tests - Scenario #1: A group question not can be source/destination of 2 or more questions', () => {

	async function foo(template) {
		//...
	};

	test('1.1 question with 2 sources and 2 destinations', async () => {
		await foo(templatesDict['scenario1-1']);
	});

    test('1.2 question with 3 sources and 3 destinations', async () => {
    	await foo(templatesDict['scenario1-2']);
    });
})

describe('Group Question Tests - Scenario #2: Question SOURCE of 2 or more questions', () => {

	async function bar(template, questionNumber) {
		//...
	};

	test('2.1 First group question can not be source of 2 questions', async () => {
    	await bar(templatesDict['scenario2'], 3);
    });

	test('2.2 First group question can not be source of 3 questions', async () => {
    	await bar(templatesDict['scenario2'], 7);
    });
})
```


In TEST file directory:

 * ```./tests```
	 * ```./otus-studio```
		 * ```./group-questions-test.js```


In DATA files directory:

 * ```./data```
	 * ```./otus-studio```
		 * ```./group-questions-test```
			* ```scenario1-1_multipleSrcAndDest2.json```
			* ```scenario1-2_multipleSrcAndDest3.json```
			* ```scenario2_multiple_sources.json```

