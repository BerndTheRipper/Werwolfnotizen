const timeout = 5000;

var page;
beforeAll(async () => {
    page = await globalThis.__BROWSER_GLOBAL__.newPage();
    await page.goto('http://localhost:8000');
}, timeout);

describe(
    'Initial View loading properly',
    () => {
        it('should load without error', async () => {
            const text = await page.evaluate(() => document.body.textContent);
            const inputElement = await page.waitForSelector("#view > form > input[type=text]:nth-child(1)");
            const testResults = await page.evaluate(() => {
                let output = [];
                let view = document.querySelector("#view");
                output.push(view.querySelector("input").autocomplete == "off")
                return output;
            });
            const model = await page.evaluate(()=> model);
            // page.click(inputElement, {clickCount: 1});
            
            console.log(inputElement.placeholder);
            expect(typeof text).not.toBe('function');
            for(var i = 0; i < testResults.length; i++){
                expect(testResults[i]).not.toBe(false);
            }
        });
    },
    timeout,
);