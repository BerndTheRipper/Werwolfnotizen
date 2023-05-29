/*
Possible additions:
- customize order
- change role amount without removing
- remove roles from datalist when added
- improve test case creation
- whitch who to heal connect nobody label to button
*/

class Role {
	//0 Not at all, 1: first night, 2: every night
	calledAtNight;
	amount;
	evil;
	//0 Can't, 1 once, 2 anytime morning, 3 anytime evening, 4 andy
	canKill;
	constructor(amount, calledAtNight, evil, canKill = 0){
		this.amount = amount;
		this.calledAtNight = calledAtNight;
		this.evil = evil;
		this.canKill = canKill;
	}
}

//Roles that are called at night for their ability
class Amor extends Role {
	static roleName = "Amor";
	constructor(amount){
		super(amount, 1, false);
	}
}

class Priest extends Role {
	static roleName = "Priester";
	constructor(amount){
		super(amount, 1, false);
	}
}

class Guardian extends Role {
	static roleName = "Leibwächter";
	constructor(amount){
		super(amount, 2, false);
	}
}

class OldVettel extends Role {
	static roleName = "Alte Vettel";
	constructor(amount){
		super(amount, 2, false);
	}
}

class Pleasuregirl extends Role {
	static roleName = "Freudenmädchen";
	constructor(amount){
		super(amount, 2, false);
	}
}

class Werewolf extends Role {
	static roleName = "Wehrwolf";
	constructor(amount){
		super(amount, 2, true, 2);
	}
}

class Puppy extends Werewolf {
	static roleName = "Wolfsjunges";
	constructor(amount){
		super(amount);
	}
}

class Vampire extends Role {
	static roleName = "Vampir";
	constructor(amount){
		super(amount, 2, true, 3);
	}
}

class CrocodileAndy extends Role {
	static roleName = "Crocodile Andy";
	constructor(amount){
		super(amount, 2, true, 4);
	}
}

class Witch extends Role {
	static roleName = "Hexe";
	canHeal = true;
	canPoison = true;
	constructor(amount){
		super(amount, 2, false, 1);
	}
}

class Rioter extends Role {
	static roleName = "Unruhestifterin";
	constructor(amount){
		super(amount, 2, false);
		riot = 0;
	}
}

class Seer extends Role {
	static roleName = "Seherin";
	constructor(amount){
		super(amount, 2, false);
	}
}

//Roles that may be called optionally
class ToughGuy extends Role {
	static roleName = "Harter Bursche";
	constructor(amount){
		super(amount, 1, false);
		toughGuyAttacked = 0;
	}
}

class Bard extends Role {
	static roleName = "Barde";
	constructor(amount){
		super(amount, 0, false);
	}
}

class Constructor extends Role {
	static roleName = "Freimaurer";
	constructor(amount){
		super(amount, 1, false);
	}
}

class Idiot extends Role {
	static roleName = "Idiot";
	constructor(amount){
		super(amount, 0, false);
	}
}

//Hinterwäldler
class Dumbass extends Role {
	static roleName = "Hinterwäldler";
	constructor(amount){
		super(amount, 0, false);
	}
}

//Aussätzige
class Leper extends Role {
	static roleName = "Aussätzige";
	constructor(amount){
		super(amount, 0, false);
	}
}

class Prince extends Role {
	static roleName = "Prinz";
	constructor(amount){
		super(amount, 0, false);
	}
}

class Hunter extends Role {
	static roleName = "Jäger";
	constructor(amount){
		super(amount, 0, false);
	}
}

class Mime extends Role {
	static roleName = "Pantomime";
	constructor(amount){
		super(amount, 0, false);
	}
}

class Player{
	playerName;
	role;
	inLove = false;
	static totalPlayers;
	constructor(playerName, role){
		this.playerName = playerName;
		this.role = role;
	}
}

var roles = {
	"Barde": Bard,
	"Freimaurer": Constructor,
	"Harter Bursche": ToughGuy,
	"Amor": Amor,
	"Priester": Priest,
	"Leibwächter": Guardian,
	"Alte Vettel": OldVettel,
	"Freudenmädchen": Pleasuregirl,
	"Wehrwolf": Werewolf,
	"Wolfsjunges": Puppy,
	"Vampir": Vampire,
	"Crocodile Andy": CrocodileAndy,
	"Hexe": Witch,
	"Unruhestifterin": Rioter,
	"Seherin": Seer,
	"Idiot": Idiot,
	"Hinterwäldler": Dumbass,
	"Aussätzige": Leper,
	"Prinz": Prince,
	"Jäger": Hunter,
	"Pantomime": Mime
}

//Role, int (amount)
var rolesInGame = [];
var playersInGame = [];

var protectedPlayers = [];
var protectionReasons = [];
var attackedPlayers = [];
var attackedBy = [];

// 0 hasn't happened, 1 happening today, 2 happened already/doesn't exist
var riot = 2;
// 0 hasn't happened, 1 happened today, 2 dead/doesn't exist
var toughGuyAttacked = 2;
// 0 hasn't happened, 1 happened today, 2 dead/died@night/doesn't exist
var pupKilled = 2;
// None or dead if empty
var lovers = [];
// The person banned by the old Vettel
var bannedByOldVettel;
// Visited by Pleasuregirl
var pleasureGirlHost = null;

var nightNumber = 1;

//TODO test code, remove before calling it done
var namelist = [];
loadNameListData();

window.addEventListener("load", function(){
	for (var i of Object.keys(roles)){
		var optionElement = document.createElement("option");
		optionElement.innerText = i;
		rolenames.appendChild(optionElement);
	}
	//this.document.getElementsByTagName("button")[0].addEventListener("click", addRole)
	createTestcaseAllRoles();
})

function addRole(e){
	var amountInputField = e.previousElementSibling;
	var amount = parseInt(amountInputField.value);
	var roleNameInputField = amountInputField.previousElementSibling;
	var givenRole = roleNameInputField.value;
	
	if(!Object.keys(roles).includes(givenRole)){
		alert("Ich kenne die Rolle " + givenRole + " nicht.");
		return;
	}
	//console.log(e);
	var row = document.createElement("tr");
	row.setAttribute("role", givenRole);
	var cells = [];

	cells.push(document.createElement("td"));
	cells[0].innerText = givenRole;

	cells.push(document.createElement("td"));
	cells[1].innerText = amount;

	// cells.push(document.createElement("td"));
	// cells[2].innerText = "Maybe soon";

	cells.push(document.createElement("td"));
	removeRoleButton = document.createElement("button");
	removeRoleButton.innerText = "Entfernen";
	removeRoleButton.setAttribute("onclick", "removeRole(this)");
	cells[2].appendChild(removeRoleButton);

	for (i of cells){
		row.appendChild(i);
	}

	roleOverview.appendChild(row);
	
	amountInputField.value = "";
	roleNameInputField.value = "";

	rolesInGame[Object.keys(roles).indexOf(givenRole)] = new roles[givenRole](amount);

	updatePlayerAmount();
	roleNameInputField.focus();

}

function doneWithRoles(){
	rolesInGame = rolesInGame.filter(n => n != null);
	for(var role of rolesInGame){
		if(!role.amount){
			role.fake = true;
		}
	}
	// alert("Bitte verteile nun die Karten.");
	getBards();
}

function removeRole(e){
	var row = e.parentElement.parentElement;
	var roleToBeRemoved = row.getAttribute("role");
	var removeIndex = Object.keys(roles).indexOf(roleToBeRemoved);
	rolesInGame[removeIndex] = null;
	row.remove();
}



function updatePlayerAmount(){
	var totalPlayers = 0;
	for(var i of rolesInGame){
		if (i != null){
			totalPlayers += i.amount;
		}
	}
	totalPlayerAmountIndicator.innerText = totalPlayers;
}

function getBards(){
	var gameHasBard = false;
	for(var role of rolesInGame){
		if(role instanceof Bard){
			gameHasBard = true;
			//Draw Bard query
			var stuffToAdd = "<p>Bitte gib hier die Namen der Barden ein.</p>";
			stuffToAdd += "<form>";
			for(var i = 0; i < role.amount; i++){
				stuffToAdd += "<input type=\"text\" placeholder=\"Barde " + (i + 1) + "\" required><br>";
			}
			stuffToAdd += "<input type=\"submit\"></form>";
			content.innerHTML = stuffToAdd;
			document.getElementsByTagName("input")[0].focus();
			document.getElementsByTagName("form")[0].addEventListener("submit", bardsEntered);
			return;
		}
	}
	drawNightSetup(true);
	//Continue rest of game
}

function bardsEntered(e){
	for(var role of rolesInGame){
		if (role instanceof Bard){
			for(nameInput of document.getElementsByTagName("input")){
				if(nameInput.type == "text")
					playersInGame.push(new Player(nameInput.value, role));
			}
			console.log("hello");
			e.preventDefault();
			drawNightSetup(true);
		}
	}
	
}

function drawNightSetup(forFirstNight, roleIndex = 0){
	content.innerHTML = "<p>Rolle zum Aufwecken: <span id=\"roleToWakeUpIndicator\"></span></p>";
	content.innerHTML += "<div id=\"roleSpecificIndicators\"></div>";
	//content.innerHTML += "<button>Weiter</button>";
	
	if (forFirstNight)
		firstNight(roleIndex);
	else
		otherNights(roleIndex);
}

function firstNight(roleIndex){
	roleToWakeUp = roleIndex;
	console.log("Starting firstNight")
	roleSpecificIndicators.innerHTML = "";
	try{
		for(roleToWakeUp; !rolesInGame[roleToWakeUp].calledAtNight; roleToWakeUp++);
		console.log("Role to wake up after for loop: " + roleToWakeUp);
		roleToWakeUpIndicator.innerText = rolesInGame[roleToWakeUp].constructor.roleName;
		console.log("Role to wake up name: " + rolesInGame[roleToWakeUp].constructor.roleName);
		
		if(!rolesInGame[roleToWakeUp].amount){
			roleToWakeUpIndicator.innerText += " (Fake)";
			roleSpecificIndicators.innerHTML = "<button onclick=\"firstNight(" + (roleToWakeUp + 1) + ")\">Weiter</button>"
		} else if(rolesInGame[roleToWakeUp].constructor.roleName == "Wolfsjunges"){
			firstNight(roleIndex + 1);
		}
		else{
			roleSpecificIndicators.appendChild(createSkippingButton());
			var form = roleSpecificIndicators.appendChild(getNameGivingForm(roleToWakeUp));
			switch(rolesInGame[roleToWakeUp].constructor.roleName){
				case "Freimaurer":
				case "Harter Bursche":
					//Take no additional action, just prevent default action
					break;
				case "Wolfsjunges":
					form.onsubmit();
					break;
				case "Amor":
					form.onsubmit = enterLovers;
					for(var i = 0; i < 2; i++){
						var inputElement = getPlayerNameField(true, "Verliebter " + (2 - i));
						inputElement.className = "loversInputField";
						form[0].after(inputElement);
						inputElement.before(document.createElement("br"));
					}
					// if(form[0].nextElementSibling.tagName.toLowerCase() != "br")
					// 	form[0].after(document.createElement("br"));
					
					
					break;
				case "Priester":
					form.onsubmit = enterPriest;
					var inputElement = getPlayerNameField(true, "Schützling");
					inputElement.name = "priestProtectInputField";
					form[0].after(inputElement);
					inputElement.before(document.createElement("br"));
					break;
				case "Leibwächter":
					form.onsubmit = enterGuardian;
					var inputElement = getPlayerNameField(true, "Schützling");
					inputElement.name = "guardianProtectInputField";
					form[0].after(inputElement);
					inputElement.before(document.createElement("br"));
					break;
				case "Alte Vettel":
					form.onsubmit = enterVettel;
					var inputElement = getPlayerNameField(true, "Wen verbannen?");
					inputElement.name = "vettelBanInputField";
					form[0].after(inputElement);
					inputElement.before(document.createElement("br"));
					break;
				case "Freudenmädchen":
					form.onsubmit = enterPleasuregirl;
					var inputElement = getPlayerNameField(true, "Wohin geht sie?");
					inputElement.name = "pleasuregirlInputField";
					form[0].after(inputElement);
					inputElement.before(document.createElement("br"));
					break;
				case "Wehrwolf":
					form.onsubmit = enterWerewolves;
					var inputElement = getPlayerNameField(true, "Wer stirbt?");
					inputElement.name = "werewolfAttackInputField";
					form.lastChild.before(inputElement);
					inputElement.after(document.createElement("br"));
					for(var i = 0; i < rolesInGame.length; i++){
						if(rolesInGame[i] instanceof Puppy){
							inputElement.before(document.createElement("br"));
							var puppyInputElement = getPlayerNameField(true, "Wolfsjunges");
							puppyInputElement.name = "puppyNameInputField";
							inputElement.previousElementSibling.before(puppyInputElement);
							puppyInputElement.after(createHiddenInput("puppyAtIndex", i));
							break;
						}
					}
					break;
				//NEXT Vampir, Andy, weitere Rollen
				case "Vampir":
					form.onsubmit = enterVampire;
					var inputElement = getPlayerNameField(true, "Wen beißen?");
					inputElement.name = "vampireBiteInputField";
					form[0].after(inputElement);
					inputElement.before(document.createElement("br"));
					break;
				case "Crocodile Andy":
					form.onsubmit = enterAndy;
					var inputElement = getPlayerNameField(true, "Wen beißen?");
					inputElement.name = "andyAttackInputField";
					form[0].after(inputElement);
					inputElement.before(document.createElement("br"));
					break;
				case "Hexe":
					form.onsubmit = enterWitch;
					var currentRole = rolesInGame[roleToWakeUp];
					form.submitButton.before("Wen heilen?");
					form.submitButton.before(document.createElement("br"));

					var inputElement = document.createElement("input");
					inputElement.type = "radio";
					inputElement.name = "playerToHeal";
					inputElement.value = "nobody";
					inputElement.id = "radioinputnobody";
					
					form.submitButton.before(inputElement);
					inputElement.after(document.createElement("br"));
					//inputElement.before(document.createElement("br"));
					inputElement.after("Niemand");
					if(currentRole.canHeal){
						for(var i = 0; i < attackedPlayers.length; i++){
							var radioInputElement = inputElement.cloneNode();
							radioInputElement.value = attackedPlayers[i].playerName;
							radioInputElement.id = "radioinput" + attackedPlayers[i].playerName.toLowerCase();
	
							var labelElement = document.createElement("label");
							labelElement.setAttribute("for", "radioinput" + attackedPlayers[i].playerName.toLowerCase());
							labelElement.innerText = `${attackedPlayers[i].playerName} (Rolle: `;
						
							if(!attackedPlayers[i].role){
								labelElement.innerText += "unbekannt; ";
							} else {
								labelElement.innerText += attackedPlayers[i].role.constructor.roleName + "; ";
							}
							labelElement.innerText += "Angreifer: " + attackedBy[i] + ")";
						
							form.submitButton.before(radioInputElement);
							radioInputElement.after(labelElement);
							labelElement.after(document.createElement("br"));
						}
					}
					if(currentRole.canPoison){
						var poisonedPlayerInputField = getPlayerNameField(false, "Wen vergiften?");
						poisonedPlayerInputField.name = "playerToPoison";
						form.submitButton.before(poisonedPlayerInputField);
						form.submitButton.before(document.createElement("br"));
					}
					inputElement.checked = true;
					break;
				case "Unruhestifterin":
					form.onsubmit = enterRioter;
					if(!riot){
						form.submitButton.before("Unruhe stiften?");
						form.submitButton.before(document.createElement("br"));
						var buttonTexts = ["Ja", "Nein"];
						for(var text of buttonTexts){
							var radioButton = document.createElement("input");
							radioButton.type = "radio";
							radioButton.name = "startRiotQuestion";
							radioButton.value = text;
							radioButton.id = "startRiotQuestion" + text;

							form.submitButton.before(radioButton);
							radioButton.checked = true;

							var labelElement = document.createElement("label");
							labelElement.setAttribute("for", "startRiotQuestion" + text);
							labelElement.innerText = text;
							
							form.submitButton.before(labelElement);
							form.submitButton.before(document.createElement("br"));
						}
					}
					break;
				case "Seherin":
					form.onsubmit = savePlayer;
					form.submitButton.before("Bösewichte:")
					form.submitButton.before(document.createElement("br"));

					var ul = document.createElement("ul");
					form.submitButton.before(ul);
					for(var player of playersInGame){
						try{
							if(player.role.evil){
								var li = document.createElement("li");
								li.innerText = `${player.playerName} (Rolle: ${player.role.constructor.roleName})`;
								ul.appendChild(li);
							}
						} catch(TypeError){

						}
					}
					break;
				default:
					roleSpecificIndicators.innerHTML = "Noch nicht implementiert.<br><button onclick=\"firstNight(" + (roleToWakeUp + 1) + ")\">Weiter</button>"
			}
			form[0].focus();
		}
	}
	catch (TypeError){
		//Night is over
		return;
	}
		
}

function enterLovers(e){
	console.log("entering lovers");
	for(var entry of document.getElementsByClassName("loversInputField")){
		var loverFound = false;
		for(var player of playersInGame){
			if (player.playerName == entry.value){
				player.inLove = true;
				loverFound = true;
				break;
			}
		}
		if (!loverFound){
			var newPlayerIndex = playersInGame.push(new Player(entry.value, null)) - 1;
			playersInGame[newPlayerIndex].inLove = true;
		}
	}
	savePlayer(e);
}

function enterPriest(e){
	var form = e.target;
	var entry = form.priestProtectInputField;
	var protecteeFound = false;
	for(var player of playersInGame){
		if (player.playerName == entry.value){
			protectedPlayers = [player];
			protectionReasons = ["Priester"];
			protecteeFound = true;
			break;
		}
	}
	if (!protecteeFound){
		var newPlayerIndex = playersInGame.push(new Player(entry.value, null)) - 1;
		protectedPlayers = [playersInGame[newPlayerIndex]];
		protectionReasons = ["Priester"];
	}

	savePlayer(e);
}

function enterGuardian(e){
	var form = e.target;
	var entry = form.guardianProtectInputField;
	var protecteeFound = false;
	for(var player of playersInGame){
		if (player.playerName == entry.value){
			protectedPlayers.push(player);
			protectionReasons.push("Leibwächter");
			protecteeFound = true;
			break;
		}
	}
	if (!protecteeFound){
		var newPlayerIndex = playersInGame.push(new Player(entry.value, null)) - 1;
		protectedPlayers.push(playersInGame[newPlayerIndex]);
		protectionReasons.push("Leibwächter");
	}

	if(e.target.forFirstNight)
		savePlayer(e);
	else
		e.preventDefault();
}

function enterVettel(e){
	var form = e.target;
	var entry = form.vettelBanInputField;
	var banishedPlayer = null;
	for(var player of playersInGame){
		if (player.playerName == entry.value){
			banishedPlayer = player;
			break;
		}
	}
	if (!banishedPlayer){
		var newPlayerIndex = playersInGame.push(new Player(entry.value, null)) - 1;
		banishedPlayer = playersInGame[newPlayerIndex];
	}
	protectedPlayers.push(banishedPlayer);
	protectionReasons.push("Alte Vettel");
	bannedByOldVettel = banishedPlayer;

	if(e.target.forFirstNight)
		savePlayer(e);
	else
		e.preventDefault();
}

function enterPleasuregirl(e){
	var form = e.target;
	var entry = form.pleasuregirlInputField;
	var visitedPlayer = null;
	for(var player of playersInGame){
		if (player.playerName == entry.value){
			visitedPlayer = player;
			break;
		}
	}
	if (!visitedPlayer){
		var newPlayerIndex = playersInGame.push(new Player(entry.value, null)) - 1;
		visitedPlayer = playersInGame[newPlayerIndex];
	}
	
	pleasureGirlHost = visitedPlayer;

	if(e.target.forFirstNight)
		savePlayer(e);
	else
		e.preventDefault();
}

//TODO test puppy's death functionality
function enterWerewolves(e){
	var form = e.target;
	var entry = form.werewolfAttackInputField;
	var attackedPlayer = null;
	for(var player of playersInGame){
		if (player.playerName == entry.value){
			attackedPlayer = player;
			break;
		}
	}
	if (!attackedPlayer){
		var newPlayerIndex = playersInGame.push(new Player(entry.value, null)) - 1;
		attackedPlayer = playersInGame[newPlayerIndex];
	}
	
	attackedPlayers.push(attackedPlayer);
	attackedBy.push("Wehrwolf");

	if(e.target.forFirstNight){
		if(form.puppyNameInputField){
			var puppyFound = false;
			var puppyIndex = parseInt(form.puppyAtIndex.value);
			for(var player of playersInGame){
				if (player.playerName == form.puppyNameInputField.value){
					player.role = rolesInGame[puppyIndex];
					puppyFound = true;
					break;
				}
			}
			if(!puppyFound){
				playersInGame.push(new Player(form.puppyNameInputField.value, rolesInGame[puppyIndex]));
			}
		}
		savePlayer(e);
	}
	else {
		e.preventDefault();
	}
}

function enterVampire(e){
	var form = e.target;
	var entry = form.vampireBiteInputField;
	var attackedPlayer = null;
	for(var player of playersInGame){
		if (player.playerName != entry.value){
			continue;
		}
		attackedPlayer = player;
		break;
	}
	if (!attackedPlayer){
		var newPlayerIndex = playersInGame.push(new Player(entry.value, null)) - 1;
		attackedPlayer = playersInGame[newPlayerIndex];
	}
	attackedPlayers.push(attackedPlayer);
	attackedBy.push("Vampir");
			
	if(e.target.forFirstNight)
		savePlayer(e);
	else
		e.preventDefault();
}

function enterAndy(e){
	var form = e.target;
	var entry = form.andyAttackInputField;
	var attackedPlayer = null;
	for(var player of playersInGame){
		if (player.playerName != entry.value){
			continue;
		}
		attackedPlayer = player;
		break;
	}
	if (!attackedPlayer){
		var newPlayerIndex = playersInGame.push(new Player(entry.value, null)) - 1;
		attackedPlayer = playersInGame[newPlayerIndex];
	}
	attackedPlayers.push(attackedPlayer);
	attackedBy.push("Crocodile Andy");
			
	if(e.target.forFirstNight)
		savePlayer(e);
	else
		e.preventDefault();
}

function enterWitch(e){
	var form = e.target;
	var roleIndex = parseInt(form.roleIndexOnSite.value);
	var witchRole = rolesInGame[roleIndex];

	if(witchRole.canHeal && form.playerToHeal.value != "nobody"){
		var playerToHeal = findPlayerByName(form.playerToHeal.value, false);
		
		protectedPlayers.push(playerToHeal);
		protectionReasons.push("Hexe");

		witchRole.canHeal = false;
	}
	if(witchRole.canPoison && form.playerToPoison.value != ""){
		var playerToKill = findPlayerByName(form.playerToPoison.value);
		
		attackedPlayers.push(playerToKill);
		attackedBy.push("Hexe");

		witchRole.canKill = false;
	}
	
	if(e.target.forFirstNight)
		savePlayer(e);
	else
		e.preventDefault();
}

function enterRioter(e){
	var form = e.target;
	if(!riot && form.startRiotQuestion.value == "Ja")
		riot = 1;
	if(e.target.forFirstNight)
		savePlayer(e);
	else
		e.preventDefault();
}

// save as in "Speichern", not "retten"
//TODO add detection for player already existing
function savePlayer(e){
	// console.log("saving player");
	e.preventDefault();
	var form = e.target;
	// console.log(form);
	var roleIndex = parseInt(form.roleIndexOnSite.value);
	// console.log("Role index" + roleIndex);
	for(var entry of document.getElementsByClassName("nameInputForm")){
		var playerFound = false;
		for(var player of playersInGame){
			if(entry == player.playerName){
				player.role = rolesInGame[roleIndex];

			}
		}
		if(playerFound) continue;
		playersInGame.push(new Player(entry.value, rolesInGame[roleIndex]));
	}
	if(form.forFirstNight)
		firstNight(roleIndex + 1);
	else
		otherNights(roleIndex + 1);
}

function findPlayerByName(name, createIfNoMatch = true, role = null){
	// TODO could be more readable alternative for future
	// var roleIndex = 0;
	// for(; playersInGame[roleIndex].playerName != name && roleIndex < playersInGame.length; roleIndex++);
	for(var player of playersInGame){
		if(player.playerName == name){
			if(role instanceof Role){
				player.role = role;
			}
			return player;
		}
	}
	console.log("Player not found.");
	if(!createIfNoMatch){
		console.log("Not creating new player");
		return null;
	}

	var output = new Player(name, role);
	playersInGame.push(output);
	return output;
}

function otherNights(roleIndex){
	console.log("Other nights called");
}

function createTestcase(){
	var button = document.getElementsByTagName("button")[0];
	var rolename = document.querySelector("#content > input[type=text]:nth-child(1)");
	var amount = document.querySelector("#content > input[type=number]:nth-child(2)");
	
	//rolename.value = "Barde";
	//amount.value = "3";
	//addRole(button);
	
	rolename.value = "Amor";
	amount.value = "1";
	addRole(button);
	
	rolename.value = "Harter Bursche";
	amount.value = "1";
	addRole(button);
	
	rolename.value = "Priester";
	amount.value = "1";
	addRole(button);

	rolename.value = "Wehrwolf";
	amount.value = "6";
	addRole(button);

	rolename.value = "Pantomime";
	amount.value = "4";
	addRole(button);

	rolename.value = "Leibwächter";
	amount.value = "1";
	addRole(button);

	rolename.value = "Hexe";
	amount.value = "1";
	addRole(button);

	rolename.value = "Freimaurer";
	amount.value = "0";
	addRole(button);

	rolename.value = "Alte Vettel";
	amount.value = "1";
	addRole(button);

	rolename.value = "Freudenmädchen";
	amount.value = "1";
	addRole(button);

	rolename.value = "Vampir";
	amount.value = "1";
	addRole(button);

	rolename.value = "Crocodile Andy";
	amount.value = "1";
	addRole(button);

	rolename.value = "Idiot";
	amount.value = "2";
	addRole(button);
	//alert("loaded testcase");
}

function createTestcaseAllRoles(){
	var button = document.getElementsByTagName("button")[0];
	var rolename = document.querySelector("#content > input[type=text]:nth-child(1)");
	var amount = document.querySelector("#content > input[type=number]:nth-child(2)");
	for(i of Object.keys(roles)){
		rolename.value = i;
		amount.value = "1";
		addRole(button);
	}
}

function getNameGivingForm(roleIndex){
	var roleToWakeUp = roleIndex;
	var inputAmount = rolesInGame[roleToWakeUp].amount;
	var roleName = rolesInGame[roleToWakeUp].constructor.roleName;
	//Place to maybe add handling for different roleIndex types later
	var output = document.createElement("form");
	output.id = "roleSpecificForm";
	for(var i = 0; i < inputAmount; i++){
		output.innerHTML += "<input type=\"text\" placeholder=\"" + roleName + " " + (i + 1) + "\" class=\"nameInputForm\" required> <br>";
	}
	output.innerHTML += "<input type=\"hidden\" value=\"" + roleToWakeUp + "\" name=\"roleIndexOnSite\">";
	output.innerHTML += "<input type=\"hidden\" name=\"forFirstNight\">";
	output.innerHTML += "<input type=\"submit\" name=\"submitButton\"></form>";
	output.onsubmit = savePlayer;
	return output;
}

function getPlayerNameField(required = false, placeholder = "Spielername", customList="playernames",  matchRequired = false){
	if(matchRequired){
		console.warn("Parameter \"matchRequired\" set to true. Enforcing this is not implemented yet and may never be.");
	}
	var output = getTextInputField(required, placeholder);
	output.list = customList;
	// output.after(document.createElement("br"));
	return output;
}

function getTextInputField(required = false, placeholder = "Spielername"){
	var output = document.createElement("input");
	output.type = "text";
	output.placeholder = placeholder;
	output.required = required;
	return output;
}

function createHiddenInput(name, value){
	var output = document.createElement("input");
	output.type = "hidden";
	output.name = name;
	output.value = value;
	return output;
}

function loadNameListData(){
	var request = new XMLHttpRequest();
	request.onreadystatechange = ()=>{
		if(request.readyState == 4){
			namelist = JSON.parse(request.responseText);
		}
	};
	request.open("GET", "names.json");
	request.send();
	
}

async function loadNames(){
	var request = await fetch("names.json");
	var json = await request.json();
	return json;
}

function createSkippingButton(){
	var x = document.createElement("button");
	x.innerText = "Skip with random names";
	x.onclick = skipButtonPressed;
	
	return x;
}

function skipButtonPressed(e){
	var submitButton;
	for(var o of document.getElementsByTagName("input")){
		if(o.type == "text"){
			o.value = namelist[Math.round(Math.random()*namelist.length) % namelist.length];
		}
		else if (o.type == "submit") {
			submitButton = o;
		}
	}
	submitButton.click();
}
