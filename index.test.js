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

var roleNamesFromObject;
var roleNamesFromDatalist;
var roleNamesInGame;
describe("Role Datalist", ()=>{
    test("Role datalist + model role list matches object from role file without duplicates", async () => {
        roleNamesFromObject = await page.evaluate(() => Object.keys(Role.roleList));
        await redoRolesDatalist();
        await redoRolesInGame();
        alreadySeen = [];
        
        for(var role of roleNamesFromDatalist){
            expect(alreadySeen).not.toContain(role);
            expect(roleNamesFromObject).toContain(role);
            alreadySeen.push(role);
        }

        for(var role of roleNamesInGame){
            expect(alreadySeen).not.toContain(role);
            expect(roleNamesFromObject).toContain(role);
            alreadySeen.push(role);
        }

        for(var role of roleNamesFromObject){
            expect(alreadySeen).toContain(role);
        }
    });
});

describe(
    'Initial View functioning properly',
    () => {
        test('Adding roles', async () => {
            roleNamesFromObject = await page.evaluate(() => Object.keys(Role.roleList));
            var nonMatchName = "afkljeasg";
            expect(roleNamesFromObject).not.toContain(nonMatchName);
            
            await addAllRolesOnce();
            
            const gameModel = await page.evaluate(() => model);
            var totalPlayers = 0;

            for(var i = 1; i <= gameModel.roles.length; i++){
                var nameTd = await page.evaluate((i) => document.querySelector(`#roleOverview > tbody > tr:nth-child(${i}) > td`).innerText, i);
                var amountTd = await page.evaluate((i) => document.querySelector(`#roleOverview > tbody > tr:nth-child(${i}) > td:nth-child(2)`).innerText, i);
                expect(nameTd).toBe(gameModel.roles[i-1].roleName);
                expect(parseInt(amountTd)).toBe(gameModel.roles[i-1].amount);
                totalPlayers += gameModel.roles[i-1].amount;
            }

            const roleInputElement = await page.waitForSelector("#view > form > input[type=text]:nth-child(1)");
            const amountInputElement = await page.waitForSelector("#view > form > input[type=number]:nth-child(2)");
            

        }, timeout);
        
        test.todo("Removing roles");

        test.todo("Changing role order");

        test.todo("Disabling default sorting");

        test.todo("Enabling default sorting with holes in final list");

        test.todo("Enabling default sorting without holes in final list");

        test.todo("Testing player counter");
    },
    timeout,
);

async function redoRolesDatalist(){
    roleNamesFromDatalist = await page.evaluate(() => {
        var output = [];
        var datalist = document.querySelector("#rolenamesdatalist");
        for(var child of datalist.children){
            output.push(child.value);
        }
        return output;
    });
}

async function redoRolesInGame(){
    roleNamesInGame = await page.evaluate(() => {
        var output = [];
        for(var role of model.roles){
            output.push(role.roleName);
        }
        return output;
    })
}

async function addAllRolesOnce(){
    const roleInputElement = await page.waitForSelector("#view > form > input[type=text]:nth-child(1)");
    const amountInputElement = await page.waitForSelector("#view > form > input[type=number]:nth-child(2)");
    await redoRolesDatalist();
    for(var name of roleNamesFromDatalist){
        await roleInputElement.click();
        await roleInputElement.type(name, {delay:0});
        
        await amountInputElement.click();
        await amountInputElement.type("1");
        
        await page.keyboard.press("Enter");
        
    }
}
