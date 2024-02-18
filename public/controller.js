class Controller {
	model;
	//TODO rename to frontend to avoid confusion
	view;
	eventHandlers = [
		//Initial view event handlers
		[
            /*0*/ this.addRoleEvent,
            /*1*/ this.removeRoleEvent,
            /*2*/ this.moveUpRoleEvent,
            /*3*/ this.moveDownRoleEvent,
            /*4*/ this.checkboxOnClick,
            /*5*/ this.doneWithRoles
		],
		//Night view
		[
            /*0*/ this.wakeUpNextRole,
            /*1*/ this.playerIdentifyInputUnfocused
		],
		//Day view
		[
            /*0*/ this.newMayorUnfocus,
            /*1*/ this.daytimeFormSubmitted,
            /*2*/ this.roleChangedThroughDropdown,
            /*3*/ this.playerIdentifyInputUnfocused,
            /*4*/ this.proposalAcceptanceChanged,
            /*5*/ this.addingNewPlayer,
            /*6*/ this.killingNewPlayer,
				/*7*/ this.dayOver,
				/*8*/ this.hunterTargetChanged
		]
	];

	constructor(model, view) {
		if (!model instanceof Model) {
			throw new TypeError("model parameter must be an instance of Model.");
		}
		if (!view instanceof View) {
			throw new TypeError("view parameter must be an instance of View.");
		}
		this.model = model;
		this.view = view;
	}

	//Event handlers for initial view:
	addRoleEvent(e) {
		e.preventDefault();
		try {
			//This is an event handler for the form, to the this keyword refers to
			//the form that triggered the event
			controller.model.addRole(this.roleName.value, parseInt(this.roleAmount.value));
			controller.view.redraw();
		} catch (e) {
			if (e instanceof ReferenceError || e instanceof RangeError) {
				alert("Fehler: " + e.message);
				console.log(e);
			} else {
				throw e;
			}
		}
	}

	removeRoleEvent(e) {
		//                   button td element    tr element    td with name
		var roleNameToRemove = this.parentElement.parentElement.children[0].innerText;
		controller.model.removeRole(roleNameToRemove);
		controller.view.redoRoleNamesList();
		controller.view.redraw();
	}

	moveUpRoleEvent(e) {
		var roleNameToMove = this.parentElement.parentElement.children[0].innerText;
		controller.model.moveUpRole(roleNameToMove);
		controller.view.redraw();
	}

	moveDownRoleEvent(e) {
		var roleNameToMove = this.parentElement.parentElement.children[0].innerText;
		controller.model.moveDownRole(roleNameToMove);
		controller.view.redraw();
	}

	checkboxOnClick(e) {
		controller.model.useDefaultRoleSorting = this.checked;
		controller.view.redraw();
	}

	doneWithRoles(e) {
		controller.model.startFirstNight();
		controller.view.loadView(NightView, controller.eventHandlers[1]);
	}

	wakeUpNextRole(e) {
		e.preventDefault();
		var form = e.target;
		var playerNames = [];
		var oldIndexes = [];

		var playerNameElements = form.querySelectorAll(".identSection>input");
		var targetElements = form.querySelectorAll(".targetSection>input");

		if (controller.model.roles[controller.model.currentRoleToWakeUp] instanceof Witch) {
			//TODO handle witch input when I get there
			//First checks if healTargets exists and then checks for the value
			if (form.healTargets && form.healTargets.value != "Niemand") {
				controller.model.enterTarget(form.healTargets.value, true);
			}

			if (form.target0 && form.target0.value != "") {
				controller.model.enterTarget(form.target0.value, false);
			}
		} else if (controller.model.roles[controller.model.currentRoleToWakeUp] instanceof Rioter) {
			if (form.causeRiot.value == "yes") {
				controller.model.riot = 1;
			}
		} else {
			for (var element of targetElements) {
				if (element.value == "") continue;
				controller.model.enterTarget(element.value);
			}
		}

		for (var input of playerNameElements) {
			if (input.value == "") continue;
			if (input.getAttribute("role") == "Wolfsjunges") {
				controller.model.identifyPlayers([input.value], [input.getAttribute("oldIndex")], controller.model.roles[controller.model.getRoleIndexByName("Wolfsjunges")]);
				continue;
			}
			playerNames.push(input.value);
			oldIndexes.push(input.getAttribute("oldIndex"));
		}
		controller.model.identifyPlayers(playerNames, oldIndexes);

		try {
			controller.model.wakeUpNextRole();
		}
		catch (e) {
			if (!(e instanceof RangeError)) {
				throw e;
			}
		}

		if (controller.model.currentRoleToWakeUp >= controller.model.roles.length) {
			controller.model.calculateKillProposalsFromTargets();
			controller.view.loadView(DayView, controller.eventHandlers[2]);
			return;
		}
		controller.view.redraw();
	}

	newMayorUnfocus(e) {
		var inputElement = e.target;
		var identifiedPlayer = controller.model.findPlayerByName(inputElement.value, false);
		controller.model.nextMayor = identifiedPlayer;

		if (identifiedPlayer == null && inputElement.value != "Auswählen") {
			alert("Diesen Spieler gibt es nicht. Bitte füge ihn in der Tabelle unten hinzu.");
			inputElement.value = "";
		}

		controller.view.redraw();
	}

	daytimeFormSubmitted(e) {
		e.preventDefault();

		//Submitted through kill button
		if (e.submitter.classList.contains("killButton")) {
			var playerName = e.submitter.parentElement.parentElement.querySelector("td > input").value;
			var playerObject = controller.model.findPlayerByName(playerName, false);
			controller.model.addKillerToProposal(playerObject, "Moderator");
			controller.view.redraw();
		} else {
			controller.dayOver(e);
		}
	}

	roleChangedThroughDropdown(e) {
		if (e.target.classList.contains("roleSelector")) {
			var playerName = e.target.parentElement.parentElement.querySelector("input[type=text]").value;
			var player = controller.model.findPlayerByName(playerName, false);
			var roleIndex = -1;

			try {
				roleIndex = controller.model.getRoleIndexByName(e.target.value);
			} catch (e) {
				//Do nothing, just not crash
			}

			var newRole = controller.model.roles[roleIndex];
			player.role = newRole;
			controller.view.redraw();
		}
	}

	playerIdentifyInputUnfocused(e) {
		var inputElement = e.target;
		var oldIndex = parseInt(inputElement.getAttribute("oldIndex"));

		// If there was nothing in the list and a new name gets entered
		if (oldIndex == -1 && inputElement.value != "") {
			var roleOfPlayer;

			if (inputElement.getAttribute("role") != null) {
				var roleIndex = controller.model.getRoleIndexByName(inputElement.getAttribute("role"));
				roleOfPlayer = controller.model.roles[roleIndex];
			}

			var index = controller.model.findPlayerIndexByName(inputElement.value, true, roleOfPlayer);
			inputElement.setAttribute("oldIndex", index);
			inputElement.required = true;
			inputElement.placeholder = "Erforderlich";

			// There is a player on the list but the name got changed
		} else if (inputElement.value != "") {
			for (var i in controller.model.identifiedPlayers) {
				var player = controller.model.identifiedPlayers[i];
				if (player.playerName != inputElement.value) continue;
				if (inputElement.getAttribute("oldIndex") == i) return;
				alert("Es gibt schon einen Spieler mit diesem Namen! Bitte wähle einen anderen Namen.");
				inputElement.value = controller.model.identifiedPlayers[oldIndex].playerName;
				return;
			}
			controller.model.identifiedPlayers[oldIndex].playerName = inputElement.value;
		} else if (controller.model.identifiedPlayers[oldIndex].playerName != "") {
			alert("Dieses Feld muss einen Wert haben!");
			inputElement.value = controller.model.identifiedPlayers[oldIndex].playerName;
		}

		if (controller.view.currentView instanceof DayView) controller.view.redraw();
	}

	proposalAcceptanceChanged(e) {
		var checkbox = e.target;

		var playerName = checkbox.parentElement.nextElementSibling.children[0].value;

		for (var proposal of controller.model.killProposals) {
			if (proposal.player.playerName != playerName) continue;

			proposal.proposalAccepted = checkbox.checked;

			if (proposal.player.inLove) {
				for (let loveProposal of controller.model.killProposals) {
					if (!loveProposal.player.inLove || loveProposal.player == proposal.player) continue;
					let killers = loveProposal.getKillers();
					if (killers.length == 1 && typeof killers[0] == "string" && killers[0].startsWith("Verliebt in")) {
						loveProposal.proposalAccepted = checkbox.checked;
					}
					break;
				}
			}
			break;
		}

		controller.view.redraw();
	}

	addingNewPlayer(e) {
		controller.model.addPlayer("", null);
		controller.view.redraw();
	}

	killingNewPlayer(e) {
		var newPlayer = controller.model.addPlayer("", null);
		controller.model.addKillerToProposal(newPlayer, "Moderator");
		controller.view.redraw();
	}

	dayOver(e) {
		var viewElement = window.view;
		var ul = viewElement.querySelector(".problems > ul");
		if (ul.children.length) {
			alert("Bitte löse erst die Probleme!");
			return;
		}

		controller.model.finishProposals();

		controller.model.startNight();

		controller.view.loadView(NightView, controller.eventHandlers[1]);
	}

	hunterTargetChanged(e) {
		let hunterName = e.target.parentElement.parentElement.querySelector("input").value;
		let targetName = e.target.value;

		let hunterPlayer = controller.model.findPlayerByName(hunterName, false, null, true);
		let targetPlayer = controller.model.findPlayerByName(targetName, false, null, true);

		let killerRemoved = false;
		let victimAdded = false;
		let doneWithLoop = false;
		//TODO optimize if new target was entered and old one is out what did I want me to optimize exactly?
		for (let proposal of controller.model.killProposals) {
			let killers = proposal.getKillers();
			for (let i in killers) {
				let killer = killers[i];
				if (killer == hunterPlayer) {
					if (targetPlayer == proposal.player) {
						doneWithLoop = true;
						break;
					}
					else {
						proposal.removeKillerByIndex(i);
						killerRemoved = true;
						break;
					}
				}
			}

			if (doneWithLoop) break;

			if (proposal.player == targetPlayer) {
				proposal.addKiller(hunterPlayer);
				victimAdded = true;
				continue;
			}
		}

		if (!victimAdded) {
			controller.model.addKillerToProposal(targetPlayer, hunterPlayer);
		}
		frontend.redraw();
	}
}