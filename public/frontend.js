class Frontend {
	model;
	// The view that is currently shown.
	currentView;
	// The view element in the HTML code.
	viewElement;
	constructor(model, viewElement = document.getElementById("view")) {
		if (!model instanceof Model) {
			throw new TypeError("model parameter must be an instance of Model.");
		}
		this.model = model;
		this.viewElement = viewElement;
	}

	// Event handlers takes in an array of event handlers. See the constructor
	// to see which one goes where.
	loadView(view, eventHandlers) {
		this.currentView = new view(model, this.viewElement, eventHandlers);
	}

	redraw() {
		this.currentView.redraw();
		if (this.currentView instanceof InitialView) {
			this.redoRoleNamesList();
		} else if (this.currentView instanceof NightView || this.currentView instanceof DayView) {
			this.redoPlayerNamesList();
		}
	}

	redoRoleNamesList() {
		var roleNamesInGame = model.getRoleNamesInGame();
		var roleNameDataList = document.getElementById("rolenamesdatalist");
		roleNameDataList.innerHTML = "";

		for (var name of Object.keys(Role.roleList)) {
			if (roleNamesInGame.includes(name)) {
				continue;
			}
			this.addOptionToDataList(roleNameDataList, name);
		}
	}

	redoPlayerNamesList() {
		var playerDatalist = document.getElementById("playernames");
		var rolelessPlayerDatalist = document.getElementById("rolelessPlayers");
		playerDatalist.innerHTML = "";
		rolelessPlayerDatalist.innerHTML = "";
		for (var player of this.model.identifiedPlayers) {
			this.addOptionToDataList(playerDatalist, player.playerName);

			if (player.role == null) {
				this.addOptionToDataList(rolelessPlayerDatalist, player.playerName);
			}
		}
	}

	addOptionToDataList(datalist, value) {
		var option = document.createElement("option");
		option.value = value;
		datalist.appendChild(option);
	}
}

//A class to unite common traits of a view in
class View {
	model;
	viewElement;
	eventHandlers;
	constructor(model, viewElement, eventHandlers) {
		if (!model instanceof Model) {
			throw new TypeError("model parameter must be an instance of Model.");
		}
		if (!viewElement instanceof Element) {
			throw new TypeError("viewElement parameter must be an instance of Element.");
		}
		if (!eventHandlers instanceof Array) {
			throw new TypeError("eventHandlers parameter must be an instance of Array.");
		}
		for (var i in eventHandlers) {
			if (typeof eventHandlers[i] != "function") {
				throw new TypeError("eventHandlers parameter must be an array of functions, but the element at index " + i + " is not.");
			}
		}
		this.model = model;
		this.viewElement = viewElement;
		this.eventHandlers = eventHandlers;
	}
	redraw() {
		throw new Error("The function redraw of the View class must be implemented.");
	}
	_generateTableRows(amount) {
		var output = document.createElement("tr");
		for (var i = 0; i < amount; i++) {
			var entry = document.createElement("td");
			output.appendChild(entry);
		}
		return output;
	}

	_generateSubmitButton() {
		var output = document.createElement("input");
		output.value = "Weiter";
		output.type = "submit";
		return output;
	}

	//TODO add feature where pre-existing player-name-data is already shown
	//TODO turn the following two functions into wrappers
	_generatePlayerNameInputFromRole(role) {
		var roleName = role.roleName;
		var amount = role.amount;
		var playersWithRoleIndexes = [];
		var output = [];

		if (role.amountIdentified > 0) {
			for (var index in this.model.identifiedPlayers) {
				var player = this.model.identifiedPlayers[index];

				if (player.role != role) continue;

				playersWithRoleIndexes.push(index);

				if (playersWithRoleIndexes.length == role.amountIdentified) break;
			}

			if (playersWithRoleIndexes.length != role.amountIdentified) {
				console.warn("playersWithRole.length different from role.amountIdentified");
			}
		}

		for (var i = 0; i < amount; i++) {
			var element = this._generatePlayerNameInput(playersWithRoleIndexes[i], role, false, true);
			element.placeholder = roleName + " " + (i + 1);

			if (this instanceof NightView && element.getAttribute("oldIndex") != "-1") element.addEventListener("focusout", this.eventHandlers[1]);
			else if (!(this instanceof NightView)) element.addEventListener("focusout", this.eventHandlers[1]);
			output.push(element);

			output.push(document.createElement("br"));
		}

		if (amount == 1) {
			output[0].placeholder = roleName;
		}

		return output;
	}

	_generateTargetNameInput(targetText, amount) {
		var output = [];
		for (var i = 0; i < amount; i++) {
			var element = this._generatePlayerNameInput(null, true);
			element.placeholder = targetText + " " + (i + 1);
			element.name = "target" + i;
			output.push(element);
			output.push(document.createElement("br"));
		}

		if (amount == 1) {
			output[0].placeholder = targetText;
		}

		return output;
	}

	_generatePlayerSelectInput(name, placeholder) {
		var output = document.createElement("input");
		output.type = "text";
		output.name = name;
		output.placeholder = placeholder;
		output.setAttribute("list", "playernames");
		output.autocomplete = "off";
		return output;
	}

	_generatePlayerNameInput(index, role = null, existingPlayersPossible = false, rolelessPlayersPossible = false) {
		var output = document.createElement("input");
		output.type = "text";

		if (index == null) index = "-1";
		output.setAttribute("oldIndex", index);

		var playerName = "";

		if (this.model.identifiedPlayers[index] != null) {
			playerName = this.model.identifiedPlayers[index].playerName;
		}

		output.value = playerName;

		if (existingPlayersPossible) {
			output.setAttribute("list", "playernames");
		} else if (rolelessPlayersPossible) {
			output.setAttribute("list", "rolelessPlayers");
		}

		if (role != null) {
			output.setAttribute("role", role.roleName);
		}

		output.autocomplete = "off";
		return output;
	}

	_generateUlFromArray(array, parent) {
		var ul = document.createElement("ul");
		for (var string of array) {
			var li = document.createElement("li");
			li.innerHTML = string;
			ul.appendChild(li);
		}
		parent.appendChild(ul);

		return ul;
	}

	_generateDropDownFromArray(array, parent, defaultEntry = "Rolle") {
		var select = document.createElement("select");
		array = [defaultEntry].concat(array);

		for (var entry of array) {
			var optionElement = document.createElement("option");
			optionElement.value = entry;
			optionElement.innerText = entry
			select.appendChild(optionElement);
		}

		if (parent != null) parent.appendChild(select);
		return select;
	}

	_addOptionToDataList(datalist, value) {
		var option = document.createElement("option");
		option.value = value;
		datalist.appendChild(option);
		return option;
	}
}

class InitialView extends View {
	constructor(model, viewElement, eventHandlers) {
		super(model, viewElement, eventHandlers);
		var htmlBase = document.getElementById("initialView").innerHTML;
		this.viewElement.innerHTML = htmlBase;
		var form = this.viewElement.getElementsByTagName("form")[0];
		form.onsubmit = eventHandlers[0];

		for (var input of viewElement.getElementsByTagName("input")) {
			if (input.type == "checkbox") input.id = input.getAttribute("tid");
		}

		viewElement.getElementsByTagName("button")[0].onclick = eventHandlers[5];
		this.redraw();
	}


	redraw() {
		var element = this.viewElement;
		for (var input of element.getElementsByTagName("input")) {
			if (input.type == "submit") continue;
			input.value = "";
		}

		this.viewElement.getElementsByTagName("tbody")[0].innerHTML = "";
		var roleData = this.model.getRoleData();

		for (var i in roleData) {
			var tr = super._generateTableRows(5);
			tr.children[0].innerText = roleData[i][0];
			tr.children[1].innerText = roleData[i][1];

			var buttonTexts = ["Entfernen", "Hoch", "Runter"];
			for (var i = 0; i < 3; i++) {
				var moveButton = document.createElement("button");
				moveButton.innerText = buttonTexts[i];
				moveButton.onclick = this.eventHandlers[1 + i];
				moveButton.style.width = "100%";
				tr.children[2 + i].appendChild(moveButton);
			}

			this.viewElement.getElementsByTagName("tbody")[0].appendChild(tr);
		}

		document.getElementById("defaultSortingCheckbox").checked = model.useDefaultRoleSorting;
		document.getElementById("defaultSortingCheckbox").onchange = this.eventHandlers[4];

		this.viewElement.getElementsByClassName("totalPlayerAmountIndicator")[0].innerText = model.playerAmountByRolesSum;
		var form = this.viewElement.getElementsByTagName("form")[0];
		form.roleName.focus();
	}
}

class NightView extends View {
	constructor(model, viewElement, eventHandlers) {
		super(model, viewElement, eventHandlers);
		var htmlBase = document.getElementById("nightView").innerHTML;
		this.viewElement.innerHTML = htmlBase;

		this.redraw(true);
	}

	redraw(firstDraw = false) {
		var currentRole = this.model.roles[this.model.currentRoleToWakeUp];
		var form = this.viewElement.getElementsByClassName("roleSpecificIndicators")[0];
		var formBase = document.getElementsByClassName("roleSpecificIndicators")[0].innerHTML;

		form.innerHTML = formBase;
		form.onsubmit = this.eventHandlers[0];

		var identSection = form.getElementsByClassName("identSection")[0];
		var targetSection = form.getElementsByClassName("targetSection")[0];

		this.viewElement.getElementsByClassName("roleToWakeUpIndicator")[0].innerText = currentRole.roleName;

		//Checks if rols is fake
		if (!currentRole.amount) {
			this.viewElement.getElementsByClassName("roleToWakeUpIndicator")[0].innerText += " (Fake)";
			return;
		}

		this.#addPlayerIdent(currentRole, identSection);

		//On Bard, Constructor and ToughGuy nothing more happens
		if (currentRole instanceof Amor) {
			this.#addPlayerTarget(currentRole.targetText, targetSection, 2);
		}
		else if (currentRole instanceof Werewolf) {
			var targetAmount = 1;
			if (this.model.pupKilled == 1) {
				targetSection.innerHTML += "Das Wolfsjunge wurde getötet. Also heute sterben 2?<br>";
				targetAmount = 2;
			}

			if (this.model.leperKilled == 1) {
				targetSection.innerHTML += "Die Aussätzige wurde letzte Nacht von den Werwölfen getötet. Also heute keine Opfer?<br>";
			}
			this.#addPlayerTarget(currentRole.targetText, targetSection, targetAmount);
			try {
				var puppyRoleIndex = this.model.getRoleIndexByName("Wolfsjunges");
				this.#addPlayerIdent(this.model.roles[puppyRoleIndex], identSection);
			}
			catch (e) {
				if (!(e instanceof ReferenceError) || !e.message.endsWith(" does not exist.")) {
					throw e;
				}
			}
			//TODO getting pup name (or did I already?)
		}
		else if (
			currentRole instanceof Priest ||
			currentRole instanceof Guardian ||
			currentRole instanceof Pleasuregirl ||
			currentRole instanceof Vampire ||
			currentRole instanceof CrocodileAndy ||
			currentRole instanceof OldVettel
		) {
			this.#addPlayerTarget(currentRole.targetText, targetSection);
		}
		else if (currentRole instanceof Witch) {
			if (currentRole.canHeal) {
				targetSection.innerText += "Wen heilen?";
				targetSection.appendChild(document.createElement("br"));

				var attackVictimLabels = ["Niemand"];
				var attackVictimNames = ["Niemand"];
				for (var target of this.model.targets) {
					if (!(target[1] instanceof Werewolf) && !(target[1] instanceof Vampire) && !(target[1] instanceof ToughGuy) && !(target[1] instanceof CrocodileAndy)) {
						continue;
					}

					var indexOfPlayerLabel = attackVictimNames.indexOf(target[0].playerName);
					if (indexOfPlayerLabel != -1) {
						attackVictimLabels[indexOfPlayerLabel] += " und " + target[1].roleName;
						continue;
					}

					var attackLabel = target[0].playerName + " (Rolle: ";
					if (target[0].role == null) {
						attackLabel += "Unbekannt";
					} else {
						attackLabel += target[0].role.roleName;
					}
					attackLabel += ", Angreifer: " + target[1].roleName;
					attackVictimLabels.push(attackLabel);
					attackVictimNames.push(target[0].playerName);
				}

				for (var i = 1; i < attackVictimLabels.length; i++) {
					attackVictimLabels[i] += ")";
				}

				var radioButtons = this.#generateRadioButtons(attackVictimLabels, "healTargets", attackVictimNames, 0);

				for (var element of radioButtons) {
					targetSection.appendChild(element);
				}
			}
			if (currentRole.canPoison) {
				this.#addPlayerTarget(currentRole.targetText, targetSection);
			}
		}
		else if (currentRole instanceof Rioter) {
			if (this.model.riot == 2) {
				targetSection.innerHTML = "Bereits für Unruhe gesorgt.";
				return;
			}

			var radioButtons = this.#generateRadioButtons(["Unruhe", "Keine Unruhe"], "causeRiot", ["yes", "no"], 1);

			for (var element of radioButtons) {
				targetSection.appendChild(element);
			}
		}
		else if (currentRole instanceof Seer) {
			var list = [];
			for (var player of this.model.identifiedPlayers) {
				if (!player.role || !player.role.evil) continue;
				list.push(player.playerName + " (Rolle: " + player.role.roleName + ")");
			}
			super._generateUlFromArray(list, targetSection);
		}
		else if (
			currentRole instanceof Bard ||
			currentRole instanceof Constructor ||
			currentRole instanceof ToughGuy
		) { /*prevent the else warning from showing, but actually do nothing*/ }
		else {
			alert(currentRole.roleName + " noch nicht implementiert");
		}

		/*switch (currentRole.roleName) {
			//Rollen, welche einfach nur identifiziert werden müssen
			case "Barde":
			case "Freimaurer":
			case "Harter Bursche":
				//Für die wurde das nötige bereits gemacht, weshalb bei denen einfach nur
				//der default Case verhindert wird.
				break;
			//Rollen, welche ein ziel haben und nichts anderes:
			case "Amor":
				this.#addPlayerTarget(currentRole.targetText, targetSection, 2);
				break;
			case "Werwolf":
				if (this.model.pupKilled == 1) {
					this.#addPlayerTarget(currentRole.targetText, targetSection, 2);
				}
			//TODO implement getting pup name
			case "Priester":
			case "Leibwächter":
			case "Freudenmädchen":
			case "Vampir":
			case "Crocodile Andy":
			case "Alte Vettel":
				this.#addPlayerTarget(currentRole.targetText, targetSection);
				break;
			case "Hexe":
				if (currentRole.canHeal) {
					targetSection.innerText += "Wen heilen?";
					targetSection.appendChild(document.createElement("br"));

					var attackVictimLabels = ["Niemand"];
					var attackVictimNames = ["Niemand"];
					for (var target of this.model.targets) {
						if (!(target[1] instanceof Werewolf) && !(target[1] instanceof Vampire) && !(target[1] instanceof ToughGuy) && !(target[1] instanceof CrocodileAndy)) {
							continue;
						}

						var indexOfPlayerLabel = attackVictimNames.indexOf(target[0].playerName);
						if (indexOfPlayerLabel != -1) {
							attackVictimLabels[indexOfPlayerLabel] += " und " + target[1].roleName;
							continue;
						}

						var attackLabel = target[0].playerName + " (Rolle: ";
						if (target[0].role == null) {
							attackLabel += "Unbekannt";
						} else {
							attackLabel += target[0].role.roleName;
						}
						attackLabel += ", Angreifer: " + target[1].roleName;
						attackVictimLabels.push(attackLabel);
						attackVictimNames.push(target[0].playerName);
					}

					for (var i = 1; i < attackVictimLabels.length; i++) {
						attackVictimLabels[i] += ")";
					}

					var radioButtons = this.#generateRadioButtons(attackVictimLabels, "healTargets", attackVictimNames, 0);

					for (var element of radioButtons) {
						targetSection.appendChild(element);
					}
				}
				if (currentRole.canPoison) {
					this.#addPlayerTarget(currentRole.targetText, targetSection);
				}
				break;
			case "Unruhestifterin":
				if (this.model.riot == 2) {
					targetSection.innerHTML = "Bereits für Unruhe gesorgt.";
					break;
				}
				var radioButtons = this.#generateRadioButtons(["Unruhe", "Keine Unruhe"], "causeRiot", ["yes", "no"], 1);

				for (var element of radioButtons) {
					targetSection.appendChild(element);
				}
				break;
			case "Seherin":
				var list = [];
				for (var player of this.model.identifiedPlayers) {
					if (!player.role || !player.role.evil) continue;
					list.push(player.playerName + " (Rolle: " + player.role.roleName + ")");
				}
				super._generateUlFromArray(list, targetSection);
				break;
			default:
				alert("noch nicht implementiert");
		}*/

		if (firstDraw) {
			identSection.getElementsByTagName("input")[0].focus();
		}

	}

	#addPlayerIdent(currentRole, addTo) {
		var nameInputFields = this._generatePlayerNameInputFromRole(currentRole);
		for (var inputField of nameInputFields) {
			inputField.required = inputField.getAttribute("oldIndex") != "-1";
			addTo.appendChild(inputField);
		}
	}
	#addPlayerTarget(targetText, addTo, amount = 1) {
		var targetInputFields = this._generateTargetNameInput(targetText, amount);
		for (var inputField of targetInputFields) {
			addTo.appendChild(inputField);
		}
	}

	#generateRadioButtons(labels, name, values, defaultOptionIndex) {
		var output = [];
		for (var i in labels) {
			var radio = document.createElement("input");
			radio.type = "radio";
			radio.name = name;
			radio.value = values[i];
			radio.id = "radioElement" + values[i];

			radio.checked = (i == defaultOptionIndex);

			output.push(radio);

			var label = document.createElement("label");
			label.innerText = labels[i];
			label.setAttribute("for", "radioElement" + values[i]);
			output.push(label);

			output.push(document.createElement("br"));
		}
		return output;
	}
}

class DayView extends View {
	constructor(model, viewElement, eventHandlers) {
		super(model, viewElement, eventHandlers);
		var htmlBase = document.getElementById("dayView").innerHTML;
		this.viewElement.innerHTML = htmlBase;
		this.viewElement.querySelector(".newMayorName").addEventListener("change", this.eventHandlers[0]);
		this.viewElement.querySelector("form").addEventListener("submit", this.eventHandlers[1]);
		for (var proposal of this.model.killProposals) {
			proposal.setProposalAcceptedToDefault();
		}
		//Set mayor name event handler
		this.redraw();
	}

	redraw() {
		var element = this.viewElement;

		//Mayor section:
		var mayorSection = element.getElementsByClassName("mayorSection")[0];
		this.redrawMayorSection(mayorSection);

		//New mayor section:
		this.redrawNewMayorSection(mayorSection);

		//Kill proposals section
		var rolesWithoutPlayers = model.getRolesWithoutPlayers();
		var killProposalSection = element.getElementsByClassName("killProposalSection")[0];
		var killProposalTbody = killProposalSection.getElementsByTagName("tbody")[0];
		this.redrawKillProposalSection(killProposalTbody, rolesWithoutPlayers);

		//Kill new player section
		let killNewPlayerButton = element.querySelector(".killNewPlayerButton");
		this.redrawKillNewPlayerButton(killNewPlayerButton);

		//protected players section
		var protectedPlayerSection = element.querySelector(".protectedPlayersSection");
		var protectedPlayerTbody = protectedPlayerSection.querySelector("tbody");
		this.redrawProtectedPlayersSection(protectedPlayerTbody, rolesWithoutPlayers);

		//Hunter target section
		var hunterTargetSection = element.querySelector(".hunterTargetSection");
		this.redrawHunterTargetSection(hunterTargetSection);

		//Player overview section
		// var playerListSection = element.querySelector(".playersInGame");
		// var playerListTbody = playerListSection.querySelector("tbody");
		// this.redrawPlayerOverviewSection(playerListTbody, rolesWithoutPlayers);

		//Add player section
		// var playerButton = element.querySelector(".addPlayerButton");
		// this.redrawAddPlayerSection(playerButton);


		//Unidentified roles section
		var rolesListSection = element.querySelector(".unidentifiedRoles");
		this.redrawUnidentifiedRolesSection(rolesListSection, rolesWithoutPlayers);

		//Problems section
		var problemsSection = element.querySelector(".problems");
		var amountOfWarningsShown = this.redrawProblemsSection(problemsSection);

		this.viewElement.querySelector(".submit > input[type=submit]").disabled = amountOfWarningsShown;
	}

	redrawMayorSection(mayorSection) {
		if (this.model.mayor != null) {
			mayorSection.querySelector(".mayorName").innerText = this.model.mayor.playerName;
			if (this.model.mayor.role != null) {
				mayorSection.querySelector(".mayorRole").innerText = this.model.mayor.role.roleName;
			}
		}
	}

	redrawNewMayorSection(mayorSection) {
		var nonDefaultNames = [];
		var defaultName = "Auswählen";
		mayorSection.querySelector(".newMayorName").innerHTML = "";

		for (var player of this.model.identifiedPlayers) {
			if (player == this.model.nextMayor) {
				if (player.playerName) defaultName = player.playerName;
				continue;
			}

			if (player.playerName) {
				nonDefaultNames.push(player.playerName);
			}
		}

		nonDefaultNames = [defaultName].concat(nonDefaultNames);

		for (var name of nonDefaultNames) {
			var optionElement = this._addOptionToDataList(mayorSection.querySelector(".newMayorName"), name);
			optionElement.innerText = name;
		}

		var newMayorName = mayorSection.querySelector(".newMayorName").value;
		var newMayorPlayer = this.model.findPlayerByName(newMayorName, false, null, false);

		var newMayorRole = "Unbekannt";

		if (newMayorPlayer != null && newMayorPlayer.role != null) {
			newMayorRole = newMayorPlayer.role.roleName;
		}

		mayorSection.querySelector(".newMayorRole").innerText = newMayorRole;
	}

	redrawKillProposalSection(killProposalTbody, rolesWithoutPlayers) {
		var rolesWithoutPlayersNames = [];
		killProposalTbody.innerHTML = "";

		for (let role of rolesWithoutPlayers) {
			rolesWithoutPlayersNames.push(role.roleName);
		}

		for (let i in this.model.identifiedPlayers) {
			let player = this.model.identifiedPlayers[i];
			let tr = this._generateTableRows(7);
			let trChildren = tr.children;
			let proposalAcceptedCheckbox = trChildren[0].appendChild(this.#generateCheckbox(player.dyingTonight, false));
			proposalAcceptedCheckbox.addEventListener("change", this.eventHandlers[4]);

			// let playerIndex = this.model.findPlayerIndexByName(player.player.playerName, false);
			let playerIndex = i;

			let inputElement = this._generatePlayerNameInput(playerIndex);
			inputElement.placeholder = "Spieler " + playerIndex;
			inputElement.required = true;
			inputElement.addEventListener("focusout", this.eventHandlers[3]);
			trChildren[1].appendChild(inputElement);

			this.#generateRoleSelector(rolesWithoutPlayers, player, trChildren[2], this.eventHandlers[2]);

			for (let killer of player.getKillersAsString()) {
				trChildren[3].innerText += killer + "; ";
			}

			for (let protector of player.getProtectorsAsString()) {
				trChildren[4].innerText += protector + "; ";
			}

			//TODO continue here
			let protectedCheckbox = this.#generateCheckbox(player.isProtected(), true);
			trChildren[5].appendChild(protectedCheckbox);

			let acceptCheckbox = this.#generateCheckbox(!player.isProtected(), true, null);
			trChildren[6].appendChild(acceptCheckbox);

			killProposalTbody.appendChild(tr);
		}
	}

	redrawKillNewPlayerButton(killNewPlayerButton) {
		let lockKillPlayerButton = false;

		for (let player of this.model.identifiedPlayers) {
			if (player.playerName != "") continue;
			lockKillPlayerButton = true;
			break;
		}

		if (this.model.playerAmountByRolesSum == this.model.identifiedPlayers.length || lockKillPlayerButton) {
			killNewPlayerButton.disabled = true;
		} else {
			killNewPlayerButton.disabled = false;
			killNewPlayerButton.addEventListener("click", this.eventHandlers[6]);
		}
	}

	redrawProtectedPlayersSection(protectedPlayerTbody, rolesWithoutPlayers) {
		protectedPlayerTbody.innerHTML = "";
		var playersWithProtection = [];

		//Finding players that have protection;
		for (let i in this.model.protectedPlayers) {
			let player = this.model.protectedPlayers[i];
			let playerIndex = this.model.identifiedPlayers.indexOf(player);
			let protectedPlayersIndex;
			let tr;
			if (!playersWithProtection.includes(player)) {
				protectedPlayersIndex = playersWithProtection.length;
				playersWithProtection.push(player);
				tr = this._generateTableRows(3);

				let inputElement = this._generatePlayerNameInput(playerIndex);
				inputElement.placeholder = "Spieler " + i;
				inputElement.required = true;
				inputElement.addEventListener("focusout", this.eventHandlers[3]);
				tr.children[0].appendChild(inputElement);

				this.#generateRoleSelector(rolesWithoutPlayers, player, tr.children[1], this.eventHandlers[2]);

				protectedPlayerTbody.appendChild(tr);
			}
			else {
				protectedPlayersIndex = playersWithProtection.indexOf(player);
				tr = protectedPlayerTbody.children[protectedPlayersIndex];
			}


			tr.children[2].innerText += (this.model.protectionReasons[i] instanceof Role ? this.model.protectionReasons[i].roleName : this.model.protectionReasons[i]) + "; ";
		}
	}

	/**
	 * Redraws the hunter target section
	 * @todo test this (hiding this field certainly works)
	 * @param {Element} hunterTargetSection The section in which the hunter target section should be placed
	 */
	redrawHunterTargetSection(hunterTargetSection) {

		let dyingHunters = [];
		//key: killer's name, value: victim's name
		let killingHunters = {};

		for (let player of this.modell.identifiedPlayers) {
			if (player.role instanceof Hunter && player.dyingTonight) {
				dyingHunters.push(player);
			}
			for (let killer of player.getKillers()) {
				if (!(killer instanceof Player)) continue;
				if (!(killer.role instanceof Hunter)) continue;
				killingHunters[killer.playerName] = player.playerName;
			}
		}

		if (dyingHunters.length == 0) {
			hunterTargetSection.innerHTML = "";
			return;
		}
		hunterTargetSection.innerHTML = document.querySelector(".hunterTargetSection").innerHTML;
		let tbody = hunterTargetSection.querySelector("tbody");

		for (let hunter of dyingHunters) {
			let tr = this._generateTableRows(2);
			let trChildren = tr.children;
			let hunterIndex = this.model.findPlayerIndexByName(hunter.playerName);

			let inputElement = this._generatePlayerNameInput(hunterIndex);
			inputElement.required = true;
			inputElement.addEventListener("focusout", this.eventHandlers[3]);
			trChildren[0].appendChild(inputElement);

			let namesForList = [];
			let defaultName = killingHunters[hunter.playerName];
			if (defaultName == null) defaultName = "Auswählen";

			for (let player of this.model.identifiedPlayers) {
				if (player.playerName == null) continue;
				if (dyingHunters.includes(player)) continue;
				if (player.playerName == defaultName) continue;
				if (Object.values(killingHunters).includes(player.playerName)) continue;
				namesForList.push(player.playerName);
				//TODO figure out reasons why the player does not need to be listed for being killed by hunter
				// for (let proposal of this.model.killProposals) {
				// 	if (proposal.player != player) continue;
				// 	if (proposal.proposalAccepted && (proposal.getKillers().includes(Werewolf) || proposal.getKillers().includes(Vampire)))
				// }
			}

			// namesForList = [defaultName].concat(namesForList);

			let dropdown = super._generateDropDownFromArray(namesForList, trChildren[1], defaultName);
			dropdown.onchange = this.eventHandlers[8];
			tbody.appendChild(tr);
		}
	}

	redrawUnidentifiedRolesSection(rolesListSection, rolesWithoutPlayers) {
		rolesListSection.innerHTML = document.querySelector(".unidentifiedRoles").innerHTML;
		var stringsForList = [];

		for (var role of rolesWithoutPlayers) {
			stringsForList.push(role.roleName + ": " + (role.amount - role.amountIdentified));
		}

		super._generateUlFromArray(stringsForList, rolesListSection);
	}

	redrawProblemsSection(problemsSection) {
		problemsSection.innerHTML = document.querySelector(".problems").innerHTML;

		//Current problems that get listed:
		//No mayor is set or is getting killed tonight
		var listOfWarningBooleans = [
			// There is no mayor
			// TODO add detection for mayor candidate
			this.model.mayor == null && this.model.nextMayor == null,
			// Mayor dies tonight
			false,
			// New mayor dies tonight
			false,
			// There are players with no name
			false,
			//There are dying players without a role
			false
		];

		var listOfWarnings = [
			"Es gibt keinen Bürgermeister!",
			"Der Bürgermeister stirbt heute Nacht und hat noch keinen Nachfolger bestimmt",
			"Der neue Bürgermeister stirbt heute Nacht!",
			"Es gibt Spieler ohne Namen.",
			"Die Rolle von einem toten Spieler ist noch nicht bekannt."
		];

		if (!this.model.nextMayor) {
			listOfWarningBooleans[1] = this.model.mayor.dyingTonight;
		} else {
			listOfWarningBooleans[2] = this.model.nextMayor.dyingTonight;
		}

		for (var player of this.model.identifiedPlayers) {
			if (player.playerName) continue;
			listOfWarningBooleans[3] = true;
			break;
		}

		for (let player of this.model.identifiedPlayers) {
			if (!player.dyingTonight) continue;
			if (player.role) continue;
			listOfWarningBooleans[4] = true;
			break;
		}

		var listOfWarningsToShow = [];

		for (var i in listOfWarningBooleans) {
			if (listOfWarningBooleans[i]) {
				listOfWarningsToShow.push(listOfWarnings[i]);
			}
		}

		var problemsUL = this._generateUlFromArray(listOfWarningsToShow, problemsSection);
		problemsUL.class = "listOfProblems";
		return listOfWarningsToShow.length;
	}

	#generateCheckbox(checked, disabled, onchange = null) {
		var output = document.createElement("input");
		output.type = "checkbox";
		output.checked = checked;
		output.disabled = disabled;
		output.onchange = onchange;
		return output;
	}

	#generateButton(text, onclick = null, disabled = false) {
		var output = document.createElement("button");
		output.innerText = text;
		output.onclick = onclick;
		output.disabled = disabled;

		return output;
	}

	#generateRoleSelector(leftoverRoles, player, parentObject, eventHandler) {
		var dropdownDefaultEntry = "Unbekannt";
		var stringsForDropdown = [];

		if (player.role != null) {
			stringsForDropdown.push(dropdownDefaultEntry);
			dropdownDefaultEntry = player.role.roleName;
		}

		for (var role of leftoverRoles) {
			if (role.roleName == dropdownDefaultEntry) continue;
			stringsForDropdown.push(role.roleName);
		}

		var dropdown = super._generateDropDownFromArray(stringsForDropdown, parentObject, dropdownDefaultEntry);
		dropdown.classList.add("roleSelector");
		dropdown.addEventListener("change", eventHandler);
	}
}

function oneofeach() {
	enterRoles(Object.keys(Role.roleList));
}

function aplwvbb() {
	enterRoles(["Amor", "Priester", "Leibwächter", "Werwolf", "Vampir", "Barde"], [, , , , , 2]);
}

function defaultDrama() {
	document.querySelector("#view > button").click();

	var viewElement = document.querySelector("#view");

	//Amor
	var form = viewElement.querySelector("form");
	var inputFields = form.querySelectorAll("input[type=text]");
	var submitButton = form.querySelector("input[type=submit]");
	inputFields[0].value = "a";
	inputFields[1].value = "b1";
	inputFields[2].value = "b2";
	submitButton.click();

	//Priester
	form = viewElement.querySelector("form");
	inputFields = form.querySelectorAll("input[type=text]");
	submitButton = form.querySelector("input[type=submit]");

	inputFields[0].value = "p";
	inputFields[1].value = "b1";
	submitButton.click();

	//Leibwächter
	form = viewElement.querySelector("form");
	inputFields = form.querySelectorAll("input[type=text]");
	submitButton = form.querySelector("input[type=submit]");

	inputFields[0].value = "l";
	inputFields[1].value = "b1";
	submitButton.click();

	//Werwolf
	form = viewElement.querySelector("form");
	inputFields = form.querySelectorAll("input[type=text]");
	submitButton = form.querySelector("input[type=submit]");

	inputFields[0].value = "w";
	inputFields[1].value = "b2";
	submitButton.click();

	//Vampir
	form = viewElement.querySelector("form");
	inputFields = form.querySelectorAll("input[type=text]");
	submitButton = form.querySelector("input[type=submit]");

	inputFields[0].value = "v";
	inputFields[1].value = "b2";
	submitButton.click();

	//Barden
	form = viewElement.querySelector("form");
	inputFields = form.querySelectorAll("input[type=text]");
	submitButton = form.querySelector("input[type=submit]");

	inputFields[0].value = "b1";
	inputFields[1].value = "b2";
	submitButton.click();
}

function enterRoles(roleNames, roleAmounts = []) {
	var inputField = document.querySelector("#view > form > input[type=text]:nth-child(1)");
	var amountField = document.querySelector("#view > form > input[type=number]:nth-child(2)");
	var submitButton = document.querySelector("#view > form > input[type=submit]:nth-child(3)");

	for (var i in roleNames) {
		inputField.value = roleNames[i];
		amountField.value = roleAmounts[i] == null ? "1" : roleAmounts[i];
		submitButton.click();
	}
}
