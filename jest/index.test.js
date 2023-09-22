const puppeteer = require('puppeteer');
const { Model, Player, KillProposal } = require("./../public/model");


const timeout = 50000;

//This code exists merely so I can have intellisense while refering to globalThis.__BROWSER_GLOBAL__
//It makes the types be set to puppeteer.Browser and puppeteer.Page
// var browser = await puppeteer.launch({ headless: "new" });
// var page = await browser.newPage();
var browser = globalThis.__BROWSER_GLOBAL__;
var page;

beforeAll(async () => {
	page = await browser.newPage();
	await page.goto('http://localhost:8000');
}, timeout);

var roleNamesFromObject;
var roleNamesFromDatalist;
var roleNamesInGame;
describe("Role Datalist", () => {
	test("Role datalist + model role list matches object from role file without duplicates", async () => {
		roleNamesFromObject = await page.evaluate(() => Object.keys(Role.roleList));
		await redoRolesDatalist();
		await redoRolesInGame();
		alreadySeen = [];

		for (var role of roleNamesFromDatalist) {
			expect(alreadySeen).not.toContain(role);
			expect(roleNamesFromObject).toContain(role);
			alreadySeen.push(role);
		}

		for (var role of roleNamesInGame) {
			expect(alreadySeen).not.toContain(role);
			expect(roleNamesFromObject).toContain(role);
			alreadySeen.push(role);
		}

		for (var role of roleNamesFromObject) {
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

			for (var i = 1; i <= gameModel.roles.length; i++) {
				var nameTd = await page.evaluate((i) => document.querySelector(`#roleOverview > tbody > tr:nth-child(${i}) > td`).innerText, i);
				var amountTd = await page.evaluate((i) => document.querySelector(`#roleOverview > tbody > tr:nth-child(${i}) > td:nth-child(2)`).innerText, i);
				expect(nameTd).toBe(gameModel.roles[i - 1].roleName);
				expect(parseInt(amountTd)).toBe(gameModel.roles[i - 1].amount);
				totalPlayers += gameModel.roles[i - 1].amount;
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

describe("Model functioning propoerly", () => {
	describe("addRole function", () => {
		test.todo("Adding role");

		test.todo("Adding role with unknown role name");

		test.todo("Adding role with wrong amount");

		test.todo("Adding roles with activatable abilities resets counter");

		test.todo("playerAmountByRolesSum adding up properly");

		test.todo("passing no argument to function");
	});

	describe("removeRole function", () => {
		test.todo("removing a role");

		test.todo("passing existing role that is not in the game to function");

		test.todo("passing non-existing role to function");

		test.todo("passing no argument to function");
	});

	describe("getRoleIndexByName", () => {
		test.todo("getting role indexes for each role");

		test.todo("passing role name that's not ingame");

		test.todo("passing completely invalid role name");

		test.todo("passing completely invalid type");

		test.todo("passing no argument to function");

		test.todo("passing no argument to function");
	});

	describe("moveUpRole function", () => {
		test.todo("moving up a role");

		test.todo("passing role thats not ingame");

		test.todo("passing rolename thats unknown to the game");

		test.todo("passing role that's already on top of the list");

		test.todo("passing invalid argument to rolename");

		test.todo("passing no argument to function");
	});

	describe("moveDownRole function", () => {
		test.todo("moving down a role");

		test.todo("passing role thats not ingame");

		test.todo("passing rolename thats unknown to the game");

		test.todo("passing role that's already on bottom of the list");

		test.todo("passing invalid argument to rolename");

		test.todo("passing no argument to function");
	});

	describe("getRoleData function", () => {
		test.todo("returns proper list leaving out nulls");
	});

	describe("getRoleNamesInGame function", () => {
		test.todo("get proper list of names leaving out nulls");
	});

	describe("startFirstNight and startNight", () => {
		test.todo("starting first night");

		test.todo("starting nth night");
	});

	describe("wakeUpNextRole", () => {
		describe("first night", () => {
			test.todo("calling with no wakeup gaps");

			test.todo("calling with first night wakeup gaps");

			test.todo("Calling with null gaps");

			test.todo("calling with invalid role objects");
		});

		describe("other nights", () => {
			test.todo("calling with no wakeup gaps");

			test.todo("calling with first night wakeup gaps");

			test.todo("Calling with null gaps");

			test.todo("calling with invalid role objects");
		});
	});

	describe("identifyPlayers", () => {
		test.todo("identifying valid list of players");

		test.todo("renaming valid list of players and indexes");

		test.todo("identifying single player");

		test.todo("currentRole default detected properly");

		test.todo("currentRole as alternative detected properly");
	});

	describe("enterTarget", () => {
		test.todo("entering one name");

		test.todo("entering multiple names");

		test.todo("entering unknown name");

		test.todo("entering multiple unknown name");

		test.todo("sneaking in invalid type");
	});

	describe("findPlayerByName", () => {
		test.todo("find a correctly entered player");

		test.todo("not find incorrectly entered player without adding");

		test.todo("not find incorrectly entered player with adding");

		test.todo("find correctly entered player with adding role");

		test.todo("not find incorrectly entered player with adding and role");

		test.todo("not find incorrectly entered player without adding but entering role");
	});


});

async function redoRolesDatalist() {
	roleNamesFromDatalist = await page.evaluate(() => {
		var output = [];
		var datalist = document.querySelector("#rolenamesdatalist");
		for (var child of datalist.children) {
			output.push(child.value);
		}
		return output;
	});
}

async function redoRolesInGame() {
	roleNamesInGame = await page.evaluate(() => {
		var output = [];
		for (var role of model.roles) {
			output.push(role.roleName);
		}
		return output;
	})
}

async function addAllRolesOnce() {
	const roleInputElement = await page.waitForSelector("#view > form > input[type=text]:nth-child(1)");
	const amountInputElement = await page.waitForSelector("#view > form > input[type=number]:nth-child(2)");
	await redoRolesDatalist();
	for (var name of roleNamesFromDatalist) {
		await roleInputElement.click();
		await roleInputElement.type(name, { delay: 0 });

		await amountInputElement.click();
		await amountInputElement.type("1");

		await page.keyboard.press("Enter");

	}
}
