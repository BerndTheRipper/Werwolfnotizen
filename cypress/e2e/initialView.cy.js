// <reference types="Cypress" />

describe('template spec', () => {
	it('Doesnt submit when typing unknown role with no number', () => {
		var roleToTest = "Eine Rolle, die ich nicht kenne";

		cy.visit("http://localhost:8000");

		var role = cy.get("#view").find("input[name=roleName]");
		role.type(roleToTest);

		var amount = cy.get("#view").find("input[name=roleAmount]");
		// amount.type("20");

		var stub = cy.stub();
		cy.on("window:alert", stub);

		cy.get("#view").find("input[type=submit]").click();

		expect(stub).to.not.called;
	});
});