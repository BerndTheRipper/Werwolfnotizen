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
		//Enter the roles in the wrong order, actual order is Werwolf, Barde, Freimaurer
		enterRoleWithTesting("Werwolf", "3", true, true);
		enterRoleWithTesting("Freimaurer", "4", true, false);
		enterRoleWithTesting("Barde", "2", true, false);

		//Check if the bard has been sorted in correctly after he has been entered out of order
		cy.window().then(window => {
			var document = window.document;
			var roleNameElement = document.querySelector("#roleOverview > tbody > tr:nth-child(2) > td:nth-child(1)");

			expect(roleNameElement.innerText).to.equal("Barde");
			expect(roleNameElement.nextElementSibling.innerText).to.equal("2");
			expect(document.querySelector("#defaultSortingCheckbox")).to.be.checked;
		});

		//Move the bard in front of the werewolf
		cy.get("#view").find("tbody > tr:nth-child(2) > td:nth-child(4) > button").click();

		//Check if bard and werewolf are in the right place (bard first and then werewolf)
		cy.window().then(window => {
			var document = window.document;

			expect(document.querySelector("#defaultSortingCheckbox")).to.not.be.checked;
			expect(window.model.roles.length).to.equal(3);
			expect(window.model.roles[0].roleName).to.equal("Barde");
			expect(window.model.roles[0].amount).to.equal(2);
			expect(window.model.roles[1].roleName).to.equal("Werwolf");
			expect(window.model.roles[1].amount).to.equal(3);
		});

		viewMatchesModel();

		enterRoleWithTesting("Werwolf", "3", true, true);
		enterRoleWithTesting("Freimaurer", "4", true, false);
		enterRoleWithTesting("Barde", "2", true, false);

		// Checking again just to be sure
		cy.window().then(window => {
			var document = window.document;
			var roleNameElement = document.querySelector("#roleOverview > tbody > tr:nth-child(2) > td:nth-child(1)");

			expect(roleNameElement.innerText).to.equal("Barde");
			expect(roleNameElement.nextElementSibling.innerText).to.equal("2");
			expect(document.querySelector("#defaultSortingCheckbox")).to.be.checked;
		});

		//Move down Freimaurer
		cy.get("#view").find("tbody > tr:nth-child(3) > td:nth-child(4) > button").click();
		cy.window().then(window => {
			var document = window.document;

			expect(document.querySelector("#defaultSortingCheckbox")).to.not.be.checked;
			expect(window.model.roles.length).to.equal(3);
			expect(window.model.roles[1].roleName).to.equal("Freimaurer");
			expect(window.model.roles[1].amount).to.equal(4);
			expect(window.model.roles[2].roleName).to.equal("Barde");
			expect(window.model.roles[2].amount).to.equal(2);
		});
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