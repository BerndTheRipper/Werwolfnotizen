describe('Entering roles', () => {
	it('Doesn\'t submit when typing unknown role with no number', () => {
		enterRoleWithTesting("Eine unbekannte Rolle");
	});

	it('Doesn\'t submit when typing known role with no number.', () => {
		enterRoleWithTesting("Hexe", "", null);
	});

	it("Doesn't submit when trying unknown role with number.", () => {
		enterRoleWithTesting("kldsghgdjfkg", "12", false);
	});

	it("Does submit when trying known role with number", () => {
		enterRoleWithTesting("Hexe", "1", true);
	});
});

describe("Removing roles and editing their order", () => {
	it("Removes a role", () => {
		cy.visit("http://localhost:8000");
		var roleName = "Leibwächter";
		//Make sure the role exists
		enterRoleWithTesting(roleName, "1", true, false);

		cy.get("#roleOverview > tbody > tr > td:nth-child(3) > button").click();

		cy.window().then(window => {
			var document = window.document;

			expect(document.querySelector("#view > #roleOverview > tbody").children).to.be.empty;
			for (var entry of window.model.roles) {
				if (entry == null) continue;
				expect(entry.roleName).to.not.equal(roleName);
			}
		});
	});

	it("Moves up a role without any trouble", () => {
		updowntest(["Werwolf", "Freimaurer", "Barde"], ["3", "4", "2"], 1, true);

		updowntest(["Werwolf", "Freimaurer", "Barde"], ["3", "4", "2"], 2, true);
	});

	it("moves down a role without any trouble", () => {
		updowntest(["Werwolf", "Freimaurer", "Barde"], ["3", "4", "2"], 0, false);

		updowntest(["Werwolf", "Freimaurer", "Barde"], ["3", "4", "2"], 1, false);
	});
});

function enterRoleWithTesting(roleName, roleAmount, expectedSuccess = null, reloadPage = true) {
	if (reloadPage) {
		cy.visit("http://localhost:8000");
	}
	else {
		cy.location().then(location => {
			expect(location.href).to.equal("http://localhost:8000/");
		});
	}

	enterThingsInRoleFields(roleName, roleAmount);

	cy.get("#view").find("input[type=submit]").click();
	cy.log("TODO: Replace these tests with a counter to see how if an alert box has been shown.");
	//Expects failure because no amount was entered
	if (expectedSuccess == null) {
		cy.window().then(window => {
			var document = window.document;
			console.log(document.querySelector("#view > form > input[type=text]:nth-child(1)").value);
			expect(document.querySelector("#view > form > input[type=text]:nth-child(1)").value).to.equal(roleName);
			for (var child of document.querySelector("#view > table > tbody").children) {
				var childName = child.children[0].innerText;
				expect(childName).to.not.be(roleName);
			}

			for (var role of window.model.roles) {
				expect(role.roleName).not.to.be(roleName);
			}
		})
	}
	//Expects failure because role is unknown
	else if (!expectedSuccess) {
		cy.window().then(window => {
			var document = window.document;

			assert(document.querySelector("#view > form > input[type=text]:nth-child(1)").value == roleName);

			for (var child of document.querySelector("#view > table > tbody").children) {
				var childName = child.children[0].innerText;
				expect(childName).to.not.be(roleName);
			}

			for (var role of window.model.roles) {
				expect(role.roleName).not.to.be(roleName);
			}
		});
	}
	//Expects success
	else {
		cy.get("#view").find("input[name=roleName]").then(element => {
			expect(element[0].innerText).to.be.empty;
		});

		cy.get("#view").find("input[name=roleAmount]").then(element => {
			expect(element[0].innerText).to.be.empty;
		});

		viewMatchesModel();
	}
}

function viewMatchesModel() {
	var htmlNameList = [];
	var htmlAmountList = [];
	cy.get("#view").find("table > tbody").then(result => {
		var tbody = result[0];
		for (var i = 0; i < tbody.children.length; i++) {
			var entry = tbody.children[i];
			// console.log(tbody.children[i].children[0].innerText);
			var roleNameFromTable = entry.children[0].innerText;
			var roleAmountFromTable = entry.children[1].innerText;

			htmlNameList.push(roleNameFromTable);
			htmlAmountList.push(roleAmountFromTable);
		}
	});

	expect(htmlNameList.length).to.equal(htmlAmountList.length);
	cy.window().then(window => {
		var document = window.document;
		var iterations = 0;
		var nonNullEntries = 0;
		for (; iterations < window.model.roles.length; iterations++) {
			if (window.model.roles[iterations] == null) continue;
			expect(window.model.roles[iterations].roleName).to.equal(htmlNameList[nonNullEntries]);
			expect(window.model.roles[iterations].amount).to.equal(parseInt(htmlAmountList[nonNullEntries]));
			nonNullEntries++;
		}
		expect(nonNullEntries).to.equal(htmlNameList.length);

		expect(parseInt(document.querySelector("#view").querySelector(".totalPlayerAmountIndicator").innerText)).to.equal(window.model.playerAmountByRolesSum);
	});
}

function enterThingsInRoleFields(roleName, roleAmount) {
	//roleName being a literal 0 is a valid input, so I can't just do if(roleName)
	if (roleName != null && roleName != "") {
		var role = cy.get("#view").find("input[name=roleName]");
		role.type(roleName);
	}

	//roleAmount being a literal 0 is a valid input, so I can't just do if(roleAmount)
	if (roleAmount != null && roleAmount != "") {
		var amount = cy.get("#view").find("input[name=roleAmount]");
		amount.type(roleAmount);
	}
}

/**
 * @function updowntest
 * 
 * Runs tests where certain roles are entered and then the role at moveIndex is moved up if moveUp is true or down if moveUp is false
 * 
 * @param {object[string]} roleNames the names of the roles to enter
 * @param {object[string]} roleAmounts the amounts of roles to enter
 * @param {number} moveIndex the index of the role to move up or down, starting with index 0
 * @param {boolean} moveUp if true, it is being tested with the role being moved up, if false, the role is moved down
 */
function updowntest(roleNames, roleAmounts, moveIndex, moveUp) {
	expect(roleNames.length).to.equal(roleAmounts.length);
	expect(roleNames.length).to.be.above(1);
	assert(moveUp && moveIndex > 0 || !moveUp && moveIndex < roleNames.length - 1);
	enterRoleWithTesting(roleNames[0], roleAmounts[0], true, true);

	var buttonIndex = "5";
	if (moveUp) buttonIndex = "4";

	for (var i = 1; i < roleNames.length; i++) {
		enterRoleWithTesting(roleNames[i], roleAmounts[i], true, false);
	}

	var orderedRoleNames = [];
	var orderedRoleAmounts = [];

	cy.window().then(window => {
		for (var role of window.model.roles) {
			if (role == null) continue;
			orderedRoleNames.push(role.roleName);
			orderedRoleAmounts.push(role.amount);
		}
	});

	cy.get("#view").find("tbody > tr:nth-child(" + (moveIndex + 1) + ") > td:nth-child(" + buttonIndex + ") > button").click();

	var moveIndexInt = parseInt(moveIndex);
	var lowerMoveIndex = -1;
	var upperMoveIndex = -1;
	var lowerCheckIndex = -1;
	var upperCheckIndex = -1;

	if (moveUp) {
		lowerMoveIndex = moveIndexInt - 1;
		upperMoveIndex = moveIndexInt;
	} else {
		lowerMoveIndex = moveIndexInt;
		upperMoveIndex = moveIndexInt + 1;
	}
	lowerCheckIndex = upperMoveIndex;
	upperCheckIndex = lowerMoveIndex;


	cy.window().then(window => {
		var document = window.document;

		expect(document.querySelector("#defaultSortingCheckbox")).to.not.be.checked;
		expect(window.model.roles.length).to.equal(roleNames.length);
		expect(window.model.roles[lowerMoveIndex].roleName).to.equal(orderedRoleNames[lowerCheckIndex]);
		expect(window.model.roles[lowerMoveIndex].amount).to.equal(parseInt(orderedRoleAmounts[lowerCheckIndex]));
		expect(window.model.roles[upperMoveIndex].roleName).to.equal(orderedRoleNames[upperCheckIndex]);
		expect(window.model.roles[upperMoveIndex].amount).to.equal(parseInt(orderedRoleAmounts[upperCheckIndex]));
	});

	viewMatchesModel();
}

