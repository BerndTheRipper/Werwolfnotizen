const puppeteer = require('puppeteer');
const { Model, Player, KillProposal } = require("./../public/model");
const { Role } = require('../public/roles');


const timeout = 50000;

//This code exists merely so I can have intellisense while refering to globalThis.__BROWSER_GLOBAL__
//It makes the types be set to puppeteer.Browser and puppeteer.Page
var browser = await puppeteer.launch({ headless: "new" });
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
		test.todo("Adding role (fragmented)");

		test("Adding role with unknown role name", () => {
			let model = new Model();

			expect(() => { model.addRole("Unknown role", 1) }).toThrow("Ich kenne die Rolle Unknown role nicht.");
			expect(model.roles.length).toBe(0);
			expect(model.playerAmountByRolesSum).toBe(0);
		});

		test("Adding role with wrong amount", () => {
			let model = new Model();
			let expectedTotal = 0;

			for (roleName of Object.keys(Role.roleList)) {
				if (Role.roleList[roleName].onlyOneAllowed) {
					expect(() => { model.addRole(roleName, 3) }).toThrow("Diese Rolle " + roleName + " darf es nur einmal geben");
					continue;
				}
				expect(() => { model.addRole(roleName, 3) }).not.toThrow();
				expectedTotal += 3;
			}

			expect(model.playerAmountByRolesSum).toEqual(expectedTotal);
		});

		describe("Adding roles with activatable abilities resets counter", () => {
			let model = new Model();

			test("adding the roles properly", () => {
				expect(model.riot).toBe(2);
				model.addRole("Unruhestifterin", 1);
				expect(model.riot).toBe(0);

				expect(model.toughGuyAttacked).toBe(2);
				model.addRole("Harter Bursche", 1);
				expect(model.toughGuyAttacked).toBe(0);

				expect(model.pupKilled).toBe(2);
				model.addRole("Wolfsjunges", 1);
				expect(model.pupKilled).toBe(0);

				expect(model.leperKilled).toBe(2);
				model.addRole("Aussätzige", 1);
				expect(model.leperKilled).toBe(0);
			});

			test("removing the roles properly", () => {
				expect(model.riot).toBe(0);
				model.removeRole("Unruhestifterin");
				expect(model.riot).toBe(2);

				expect(model.toughGuyAttacked).toBe(0);
				model.removeRole("Harter Bursche");
				expect(model.toughGuyAttacked).toBe(2);

				expect(model.pupKilled).toBe(0);
				model.removeRole("Wolfsjunges");
				expect(model.pupKilled).toBe(2);

				expect(model.leperKilled).toBe(0);
				model.removeRole("Aussätzige");
				expect(model.leperKilled).toBe(2);
			});
		});

		test("playerAmountByRolesSum adding up properly", () => {
			let model = new Model();

			expect(model.playerAmountByRolesSum).toBe(0);

			model.addRole("Werwolf", 3);
			model.addRole("Hexe", 1);
			model.addRole("Hinterwäldler", 1);

			expect(model.playerAmountByRolesSum).toBe(5);

			model.addRole("Freimaurer", 4);
			model.addRole("Werwolf", 2);

			expect(model.playerAmountByRolesSum).toBe(8);

			model.removeRole("Hexe");

			expect(model.playerAmountByRolesSum).toBe(7);

			model.removeRole("Werwolf");

			expect(model.playerAmountByRolesSum).toBe(5);
		});

		test("passing no argument to function", () => {
			let model = new Model();
			expect(() => { model.addRole() }).toThrow("Ich kenne die Rolle undefined nicht.");
		});
	});

	describe("removeRole function", () => {
		test("removing a role", () => {
			let model = new Model();

			model.addRole("Hexe", 1);
			expect(model.playerAmountByRolesSum).toBe(1);

			model.addRole("Werwolf", 8);
			expect(model.playerAmountByRolesSum).toBe(9);

			expect(model.removeRole("Hexe")).toBe(true);
			expect(model.playerAmountByRolesSum).toBe(8);

			expect(model.removeRole("Werwolf")).toBe(true);
			expect(model.playerAmountByRolesSum).toBe(0);
		});

		test("passing existing role that is not in the game to function", () => {
			let model = new Model();

			expect(model.removeRole("Hexe")).toBe(false);
		});

		test.todo("passing non-existing role to function");

		test.todo("passing no argument to function");
	});

	describe("getRoleIndexByName", () => {
		test.todo("getting role indexes for each role");

		test.todo("passing role name that's not ingame");

		test.todo("passing completely invalid role name");

		test.todo("passing completely invalid type");

		test.todo("passing no argument to function");
	});

	describe("moveUpRole function", () => {
		test("moving up a role", () => {
			let model = new Model();
			expect(model.useDefaultRoleSorting).toBeTruthy();

			expect(model.addRole("Barde", 2)).toBeInstanceOf(Role);
			expect(model.addRole("Werwolf", 2)).toBeInstanceOf(Role);

			expect(model.roles[6]).toBeInstanceOf(Role);
			expect(model.roles[6].roleName).toBe("Werwolf");

			expect(model.roles[13]).toBeInstanceOf(Role);
			expect(model.roles[13].roleName).toBe("Barde");

			expect(model.moveUpRole("Barde")).toBeUndefined();;

			expect(model.useDefaultRoleSorting)();

			expect(model.roles[0]).toBeInstanceOf(Role);
			expect(model.roles[0].roleName).toBe("Barde");

			expect(model.roles[1]).toBeInstanceOf(Role);
			expect(model.roles[1].roleName).toBe("Werwolf");
		});

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
		test("find a correctly entered player", () => {
			let model = new Model();

			let searchedPlayer = model.addPlayer("Harri");
			expect(searchedPlayer).toBeInstanceOf(Player);

			let otherPlayers = [model.addPlayer("Garlenz"), model.addPlayer("Flegranz"), model.addPlayer("Rofldings")];
			for (var player of otherPlayers) {
				expect(player).toBeInstanceOf(Player);
			}

			expect(model.findPlayerByName("Harri")).toEqual(searchedPlayer);
		});

		test("not find incorrectly entered player without adding", () => {
			let model = new Model();

			let searchedPlayer = model.addPlayer("Harri");
			expect(searchedPlayer).toBeInstanceOf(Player);

			let otherPlayers = [model.addPlayer("Garlenz"), model.addPlayer("Flegranz"), model.addPlayer("Rofldings")];
			for (var player of otherPlayers) {
				expect(player).toBeInstanceOf(Player);
			}

			expect(model.findPlayerByName("Garlenzino", false)).toBeNull();
			expect(model.findPlayerByName("Hargi", false)).toBeNull();
			expect(model.findPlayerByName("Glegranz", false)).toBeNull();
		});

		test("not find incorrectly entered player with adding", () => {
			let model = new Model();

			let username = "Harri";

			expect(model.findPlayerByName(username, false, null)).toBeNull();
			expect(model.findPlayerByName(username, true, null)).toBeInstanceOf(Player);
		});

		//TODO figure out this role stuff
		test("find correctly entered player with adding role", () => {
			let model = new Model();
			let searchedPlayer = model.addPlayer("Harri");
			expect(searchedPlayer).toBeInstanceOf(Player);

			var wantedRole = model.addRole("Barde", 2);
			expect(wantedRole).toBeInstanceOf(Role);

			let otherPlayers = [model.addPlayer("Garlenz"), model.addPlayer("Flegranz"), model.addPlayer("Rofldings")];
			for (var player of otherPlayers) {
				expect(player).toBeInstanceOf(Player);
			}

			expect(model.findPlayerByName("Harri", false, wantedRole)).toBe(searchedPlayer);
			expect(searchedPlayer.role).toBeInstanceOf(Role);
			expect(searchedPlayer.role.roleName).toBe("Barde");
		});

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
