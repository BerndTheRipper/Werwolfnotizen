import Model from "../../public/model.js"

describe('template spec', () => {
	it('Doesn\'t submit when typing unknown role with no number', () => {
		roleInputRelatedTests("Eine unbekannte Rolle");
	});

	it('Doesn\'t submit when typing known role with no number.', () => {
		roleInputRelatedTests("Hexe", "", null);
	});

	it("Doesn't submit when trying unknown role with number.", () => {
		roleInputRelatedTests("kldsghgdjfkg", "12", false);

		// cy.visit("http://localhost:8000");
		// var roleName = "kldsghgdjfkg";
		// var roleAmount = "12";

		// const stub = cy.stub();
		// cy.on("window:alert", stub);

		// enterThingsInRoleFields(roleName, roleAmount);

		// cy.get("#view").find("input[type=submit]").click();

		// expect(stub.getCall(0)).to.be.calledWith("Ich kenne die Rolle " + roleName + " nicht.");
	});

	it("Does submit when trying known role with number", () => {
		roleInputRelatedTests("Hexe", "1", true);
	});
});

function roleInputRelatedTests(roleName, roleAmount, expectedSuccess = null) {
	cy.visit("http://localhost:8000");

	const stub = cy.stub();
	cy.on("window:alert", stub);

	enterThingsInRoleFields(roleName, roleAmount);

	cy.get("#view").find("input[type=submit]").click();

	if (expectedSuccess == null) {
		expect(stub).to.not.called;
	}
	else if (!expectedSuccess) {
		cy.log("TODO: Replace these tests with a counter to see how if an alert box has been shown.");

		cy.window().then(window => {
			var document = window.document;

			assert(document.querySelector("#view > table > tbody").children.length == 0)

			assert(window.model.roles.length == 0);
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
	}
}

function enterThingsInRoleFields(roleName, roleAmount) {
	//roleName being a literal 0 is a valid input, so I can't just do if(roleName)
	if (roleName != null && roleAmount != "") {
		var role = cy.get("#view").find("input[name=roleName]");
		role.type(roleName);
	}

	//roleAmount being a literal 0 is a valid input, so I can't just do if(roleAmount)
	if (roleAmount != null && roleAmount != "") {
		var amount = cy.get("#view").find("input[name=roleAmount]");
		amount.type(roleAmount);
	}
}