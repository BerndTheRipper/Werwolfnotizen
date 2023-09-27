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
	})
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
		cy.get("#view").find("table > tbody > tr").then(list => {
			var roleNameFromTable = list[0].children[0].innerText;
			var roleAmountFromTable = list[0].children[1].innerText;

			expect(list.length).to.be.equal(1);
			expect(roleNameFromTable).to.be.equal(roleName);
			expect(roleAmountFromTable).to.be.equal(roleAmount);
		});

		cy.get("#view").find("input[name=roleName]").then(element => {
			expect(element[0].innerText).to.be.empty;
		});

		cy.get("#view").find("input[name=roleAmount]").then(element => {
			expect(element[0].innerText).to.be.empty;
		});

		cy.window().then(window => {
			for (var role of window.model.roles) {
				if (role == null || role.roleName != roleName) continue;
				expect(role.roleName).to.be.equal(roleName);
				expect(role.amount).to.be.equal(parseInt(roleAmount));
			}
		});
	}
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