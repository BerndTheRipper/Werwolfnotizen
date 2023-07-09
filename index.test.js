const puppeteer = require('puppeteer');


const timeout = 5000;

//This code exists merely so I can have intellisense while refering to globalThis.__BROWSER_GLOBAL__
//It makes the types be set to puppeteer.Browser and puppeteer.Page
var browser = await puppeteer.launch({headless:"new"});
var page = await browser.newPage();
// var browser = globalThis.__BROWSER_GLOBAL__;
// var page;

beforeAll(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:8000');
}, timeout);

describe(
    'Initial View loading properly',
    () => {
        
        it('should load without error', async () => {
            
            const text = await page.evaluate(() => document.body.textContent);
            const roleInputElement = await page.waitForSelector("#view > form > input[type=text]:nth-child(1)");
            const amountInputElement = await page.waitForSelector("#view > form > input[type=number]:nth-child(2)");
            const testResults = await page.evaluate(() => {
                let output = [];
                
                let view = document.querySelector("#view");
                output.push(view.querySelector("input").autocomplete == "off");

                return output;
            });
            const model = await page.evaluate(()=> model);
            page.click(roleInputElement);
            page.type(roleInputElement, "Barde");

            page.click(amountInputElement);
            page.type(amountInputElement, "2");
            // page.keyboard.press("Enter");
            // page.click(inputElement, {clickCount: 1});
            // console.log(inputElement.placeholder);
            expect(typeof text).not.toBe('function');
            for(var i = 0; i < testResults.length; i++){
                expect(testResults[i]).not.toBe(false);
            }
        });
    },
    timeout,
);