if (typeof Role === "undefined") {
	require("./roles").setAsGlobal();
}

class Model {
	// The different phases the game can be in.
	phases = {
		// Roles getting entered
		SETUP: 0,
		NIGHTTIME: 1,
		DAYTIME: 2
	};
	//The roles that are in the game, listed in picking order
	roles = [];
	playerAmountByRolesSum = 0;
	#useDefaultRoleSorting = true;
	currentRoleToWakeUp = 0;
	//The players that are in the game
	identifiedPlayers = [];

	//The targets (contains another array with first element being a player object and second element being the role that targets the player. If the role is witch, a third element indicates whether it is for healing or not)
	targets = []
	//The protected players
	protectedPlayers = [];
	//The reasons they were protected
	protectionReasons = [];

	//The attacked players
	attackedPlayers = [];
	//Who attacked them
	attackers = [];

	// Some things that can be set off by a role that does not have an
	// immediate effect
	// 0 means the event hasn't happened yet, 1 means the event happened today,
	// 2 means it will not happen during this game, for example because it
	// already has or the relevant role never existed in the first place.
	riot = 2;
	toughGuyAttacked = 2;
	pupKilled = 2;
	leperKilled = 2; // Aussätzige

	// The two people who are in love.
	// TODO test if this is really needed and insert into finishProposals if it is
	lovers = [];

	// The player the pleasuregirl stays at
	pleasureGirlHost = null;

	//Player that is blessed by the priest
	blessedPlayer = null;

	// The mayor that decides who dies in case of a draw
	mayor = null;
	nextMayor = null;

	// The person the old Vettel banned
	bannedByOldVettel = null;

	nightNumber = 0;

	// The players that die today. Will be populated after the night taking
	// into account the protection status of the player
	killProposals = [];

	// The kill proposals that were falsely assessed, to be sent to me by the
	// moderator
	falselyAssessedKillProposals = [];

	constructor() {

	}


	addRole(roleName, amount = 1) {
		if (isNaN(amount)) amount = 1;
		for (var i in Object.keys(Role.roleList)) {
			var iRoleName = Object.keys(Role.roleList)[i];
			if (iRoleName != roleName) {
				continue;
			}

			var roleClass = Role.roleList[roleName];

			if (roleClass.onlyOneAllowed && amount > 1) {
				throw new RangeError("Diese Rolle " + roleName + " darf es nur einmal geben.");
			}

			//See if there is already an entry for this role just update it
			for (var role of this.roles) {
				if (!(role instanceof roleClass)) {
					continue;
				}

				var amountDifference = amount - role.amount;
				role.amount = amount;
				this.playerAmountByRolesSum += amountDifference;
				return;
			}
			var newRole = new roleClass(amount);

			if (newRole instanceof Rioter) {
				this.riot = 0;
			} else if (newRole instanceof ToughGuy) {
				this.toughGuyAttacked = 0;
			} else if (newRole instanceof Puppy) {
				this.pupKilled = 0;
			} else if (newRole instanceof Leper) {
				this.leperKilled = 0;
			}

			if (this.useDefaultRoleSorting) {
				this.roles[i] = newRole;
			} else {
				this.roles.push(newRole);
			}

			this.playerAmountByRolesSum += amount;
			return;
		}

		throw new ReferenceError("Ich kenne die Rolle " + roleName + " nicht.");
	}

	//Returns true if the role was found and removed
	//Returns false if the role was never on the list
	removeRole(roleName, resetRoleVariable = true) {
		for (var i in this.roles) {
			if (this.roles[i] == null) continue;
			if (this.roles[i].roleName != roleName) {
				continue;
			}

			this.playerAmountByRolesSum -= this.roles[i].amount;

			if (!resetRoleVariable) {
				this.roles[i] = null;
				return true;
			}

			if (this.roles[i] instanceof Rioter) {
				this.riot = 2;
			} else if (this.roles[i] instanceof ToughGuy) {
				this.toughGuyAttacked = 2;
			}
			//TODO: reconsider these two
			else if (this.roles[i] instanceof Puppy) {
				this.pupKilled = 2;
			} else if (this.roles[i] instanceof Leper) {
				this.leperKilled = 2;
			}

			this.roles[i] = null;
			return true;
		}
		return false;
	}

	moveUpRole(roleName) {
		//Setting this will clean up any empty spaces
		this.useDefaultRoleSorting = false;

		var roleIndex = this.getRoleIndexByName(roleName);

		//role is already on top of the list
		if (roleIndex == 0) {
			return;
		}


		var temp = this.roles[roleIndex - 1];
		this.roles[roleIndex - 1] = this.roles[roleIndex];
		this.roles[roleIndex] = temp;
	}

	moveDownRole(roleName) {
		this.useDefaultRoleSorting = false;

		var roleIndex = this.getRoleIndexByName(roleName);

		//role is already on bottom of the list
		if (roleIndex == this.roles.length - 1) {
			return;
		}


		var temp = this.roles[roleIndex + 1];
		this.roles[roleIndex + 1] = this.roles[roleIndex];
		this.roles[roleIndex] = temp;
	}

	getRoleIndexByName(roleName) {
		var output;

		for (var i in this.roles) {
			if (this.roles[i] == null) continue;

			if (this.roles[i].roleName == roleName) {
				output = i;
				break;
			}

			//Search has reached the end of the list without a result
			if (i == this.roles.length - 1) {
				throw new ReferenceError(roleName + " does not exist.");
			}
		}

		return parseInt(output);
	}

	getRoleData() {
		var output = [];
		for (var role of this.roles) {
			if (role == null) continue;
			output.push([role.roleName, role.amount]);
		}
		return output;
	}

	getRoleNamesInGame() {
		var output = [];
		for (var role of this.roles) {
			if (role == null) continue;
			output.push(role.roleName);
		}
		return output;
	}

	//Returns a list of roles where not all players have been identified yet
	//TODO turn into multidimensional array
	getRolesWithoutPlayers() {
		var output = [];
		for (var role of this.roles) {
			if (role.amountIdentified == role.amount) continue;
			output.push(role);
		}
		return output;
	}

	startFirstNight() {
		//Doing this to get rid of null entries in this.roles
		this.useDefaultRoleSorting = false;
		this.startNight();
	}

	startNight() {
		this.mayor = this.nextMayor;
		this.nextMayor = null;
		this.bannedByOldVettel = null;
		this.pleasureGirlHost = null;


		this.targets = [];
		this.protectedPlayers = [];
		this.protectionReasons = [];

		this.attackedPlayers = [];
		this.attackers = [];

		if (this.toughGuyAttacked == 1) {
			var toughGuy = null;

			for (var player of this.identifiedPlayers) {
				if (!(player.role instanceof ToughGuy)) continue;
				toughGuy = player;
				break;
			}

			var i = 0;

			for (; !(this.roles[i] instanceof ToughGuy); i++);

			this.currentRoleToWakeUp = i;
			this.enterTarget(toughGuy.playerName);
		}

		this.currentRoleToWakeUp = -1;
		this.nightNumber++;
		this.wakeUpNextRole();
	}

	wakeUpNextRole() {
		var getsCalled = 1;
		if (this.nightNumber != 1) getsCalled++;
		do {
			this.currentRoleToWakeUp++;
			if (this.currentRoleToWakeUp >= this.roles.length) {
				throw new RangeError("Finished with the roles");
			}
		} while (this.roles[this.currentRoleToWakeUp] == null || this.roles[this.currentRoleToWakeUp].calledAtNight < getsCalled);
	}

	identifyPlayers(names, indexes, currentRole = this.roles[this.currentRoleToWakeUp]) {
		for (var i = 0; i < indexes.length; i++) {
			indexes[i] = parseInt(indexes[i]);
		}

		for (var i in names) {
			this.addPlayer(names[i], currentRole);
		}
	}

	enterTarget(...names) {
		var currentRole = this.roles[this.currentRoleToWakeUp];
		if (currentRole instanceof Witch) {
			for (var i = 0; i < names.length; i += 2) {
				this.targets.push([this.findPlayerByName(names[i]), currentRole, names[i + 1]]);
			}
			return;
		}
		for (var name of names) {
			this.targets.push([this.findPlayerByName(name), currentRole]);
		}
	}

	findPlayerByName(name, addIfNone = true, role = null) {
		for (var player of this.identifiedPlayers) {
			if (player.playerName != name) continue;
			return player;
		}
		if (addIfNone) {
			return this.addPlayer(name, null);
		}
		return null;
	}


	findPlayerIndexByName(name, addIfNone = true, role = null) {
		for (var index in this.identifiedPlayers) {
			var player = this.identifiedPlayers[index];
			if (player.playerName != name) continue;
			if (role != null && player.role != role) player.role = role;
			return index;
		}
		if (addIfNone) {
			var output = this.findPlayerIndexByName(this.addPlayer(name, role).playerName, false);
			if (output == null) throw new Error("Player creation failed.");
			return output;
		}
		return null;
	}

	addPlayer(name, role) {
		var output;
		for (var player of this.identifiedPlayers) {
			if (player.playerName != name) {
				continue;
			}
			player.role = role;
			output = player;
			break;
		}

		if (output == null) {
			output = new Player(name, role);
			this.identifiedPlayers.push(output);
		}

		return output;
	}

	calculateKillProposalsFromTargets() {
		this.protectedPlayers = [];
		this.protectionReasons = [];
		this.attackedPlayers = [];
		this.attackers = [];
		this.killProposals = [];

		this.processTargets();

		this.calculatePermanentProtections();

		//Find protected players from the killProposals, handle lovers and pleasureGirlHost
		var doneWithLovers = false;
		var hunterTargetsNeeded = 0;
		var hunterTargetsFound = 0;
		//The instance of the hunter role that is used in game, for the killProposalReason
		var hunterInstance;
		for (var proposal of this.killProposals) {
			for (var killer of proposal.getKillers()) {
				if (!(killer instanceof Hunter)) continue;
				hunterTargetsFound++;
				break;
			}

			if (proposal.player == null) continue;

			for (var i in this.protectedPlayers) {
				if (this.protectedPlayers[i] == proposal.player) {
					proposal.addProtector(this.protectionReasons[i]);
				}
			}

			if (proposal.player.inLove && !doneWithLovers) {
				for (var player of this.identifiedPlayers) {
					if (!player.inLove || player == proposal.player) {
						continue;
					}

					this.addKillerToProposal(player, "Verliebt in " + proposal.player.playerName);
					doneWithLovers = true;
					break;
				}
			}

			if (proposal.player == this.pleasureGirlHost) {
				for (var player of this.identifiedPlayers) {
					if (!(player.role instanceof Pleasuregirl)) continue;
					if (proposal.protectionHolds()) break;
					this.addKillerToProposal(player, "Freudenmädchen bei " + proposal.player.playerName);
					break;
				}
			}

			if (proposal.player.role instanceof Hunter) {
				hunterInstance = proposal.player.role;
				if (!proposal.protectionHolds) hunterTargetsNeeded++;
			}
		}

		// TODO show need for hunter targets on dayview screen
		// for (var i = 0; i < hunterTargetsNeeded - hunterTargetsFound; i++) {
		// 	this.addKillerToProposal(null, hunterInstance);
		// }
	}

	processTargets() {
		for (var target of this.targets) {
			//Attacking targets
			if (target[1] instanceof Werewolf || target[1] instanceof CrocodileAndy || target[1] instanceof Vampire || target[1] instanceof ToughGuy) {
				this.addKillerToProposal(target[0], target[1]);
			}
			else if (target[1] instanceof Amor) {
				this.lovers.push(target[0]);
				target[0].inLove = true;
			}
			else if (target[1] instanceof Priest) {
				if (target[0] instanceof Vampire) {
					this.addKillerToProposal(target[0], target[1]);
				}
				else {
					this.blessedPlayer = target[0];
				}
			}
			else if (target[1] instanceof Guardian) {
				this.protectedPlayers.push(target[0]);
				this.protectionReasons.push(target[1]);
			}
			else if (target[1] instanceof OldVettel) {
				this.bannedByOldVettel = target[0];
				this.protectedPlayers.push(target[0]);
				this.protectionReasons.push(target[1]);
			}
			else if (target[1] instanceof Pleasuregirl) {
				this.pleasureGirlHost = target[0];
			}
			else if (target[1] instanceof Witch) {
				if (target[2]) {
					this.protectedPlayers.push(target[0]);
					this.protectionReasons.push(target[1]);
					target[1].canHeal = false;
				}
				else {
					this.addKillerToProposal(target[0], target[1]);
					target[1].canPoison = false;
				}
			}
		}
	}

	calculatePermanentProtections() {
		if (this.blessedPlayer != null) {
			this.protectedPlayers.push(this.blessedPlayer);
			var priestIndex = 0;
			//Find the index of the priest
			for (; !(this.roles[priestIndex] instanceof Priest) && priestIndex < this.roles.length; priestIndex++);

			this.protectionReasons.push(this.roles[priestIndex]);
		}

		for (var player of this.identifiedPlayers) {
			if (!(player.role instanceof Pleasuregirl)) {
				continue;
			}

			this.protectedPlayers.push(player);
			this.protectionReasons.push(player.role);
		}
	}

	//TODO add hunter target proposals

	addKillerToProposal(player, killer) {
		var proposal;


		if (player != null) {
			for (var proposalEntry of this.killProposals) {
				if (proposalEntry.player != player) continue;
				proposal = proposalEntry;
			}
		}

		if (proposal == null) {
			proposal = new KillProposal(player);
			this.killProposals.push(proposal);
		}

		proposal.addKiller(killer);

	}

	finishProposals() {
		for (var proposal of this.killProposals) {
			if (!proposal.proposalAccepted) {
				continue;
			}

			if (proposal.player.role == null) {
				throw new Error(`The role of ${proposal.player.playerName} is not set.`);
			}

			//TODO: Add ignore of role-death-related variables
			if (proposal.player.role instanceof Rioter) {
				//TODO why did I do this? (Start a riot if rioter dies instead of when she decides it)
				this.riot = 1;
			} else if (proposal.player.role instanceof ToughGuy) {
				//QUESTION : If a werewolf attacks a tough guy, does the visiting hokker also die?
				//Does she die if the pleasuregirl visits the night he bleeds out?
				this.toughGuyAttacked += 1;
				if (this.toughGuyAttacked == 1) continue;
			} else if (proposal.player.role instanceof Puppy) {
				// QUESTION : Do the werewolves only kill two if puppy gets
				// killed by humans or do killers like vampires also count
				this.pupKilled = 1;
			} else if (proposal.player.role instanceof Leper) {
				for (var reason of proposal.getKillers) {
					if (!(reason instanceof Werewolf)) continue;
					this.leperKilled = 1;
					break;
				}
			}

			proposal.player.role.amount--;

			if (proposal.player.role.amount == 0) {
				let resetRoleVariable = !(proposal.player.role instanceof Puppy || proposal.player.role instanceof Leper);
				this.removeRole(proposal.player.role.roleName, resetRoleVariable);
			}

			proposal.player.role = null;

			if (this.pleasureGirlHost == proposal.player) {
				this.pleasureGirlHost = null;
			}
			if (this.blessedPlayer == proposal.player) {
				this.blessedPlayer = null;
			}
			if (this.bannedByOldVettel == proposal.player) {
				this.bannedByOldVettel = null;
			}

			var playerIndex = this.findPlayerIndexByName(proposal.player.playerName);
			this.identifiedPlayers.splice(playerIndex, 1);
		}

		this.killProposals = [];
	}

	get useDefaultRoleSorting() {
		return this.#useDefaultRoleSorting;
	}

	set useDefaultRoleSorting(value) {
		if (value == this.#useDefaultRoleSorting) return;

		this.#useDefaultRoleSorting = value;

		if (value) {
			for (var i = 0; i < this.roles.length; i++) {
				if (this.roles[i] == null) continue;
				var intendedIndex = Object.values(Role.roleList).indexOf(this.roles[i].constructor);

				if (i == intendedIndex) continue;

				var temp = this.roles[i];
				this.roles[i] = this.roles[intendedIndex];
				this.roles[intendedIndex] = temp;

				if (this.roles[i] != null) i--;
			}
		} else {
			for (var i = 0; i < this.roles.length; i++) {
				while (this.roles[i] == null) {
					this.roles.splice(i, 1);
				}
			}
		}
	}
}

//Copy/pasted from legacy codebase, has optimizations
class Player {
	playerName;
	#role;
	inLove = false;
	dead = false;
	static totalPlayersIdentified = 0;
	constructor(playerName, role) {
		this.playerName = playerName;
		this.role = role;
		this.constructor.totalPlayers++;
	}

	get role() {
		return this.#role;
	}
	set role(value) {
		if (this.#role == value) return;
		if (this.#role != null) {
			this.#role.amountIdentified--;
		}
		this.#role = value;
		if (value != null) {
			this.#role.amountIdentified++;
		}
	}
}

class KillProposal {
	// The player that is to be killed
	player;
	// The reason for the kill. Described with an array of strings like werewolf or lover
	// of x
	#killers = [];
	// Is the player under someone's protection?
	#protectors = [];
	// Protection valid
	protectionHolds = false;
	// Kill proposal is accepted
	proposalAccepted = false;

	constructor(player) {
		this.player = player;
	}

	getKillers() {
		return this.#killers;
	}

	getKillersAsString() {
		var output = [];
		for (var killer of this.#killers) {
			if (killer instanceof Role) {
				output.push(killer.roleName);
				continue;
			}
			output.push(killer);
		}
		return output;
	}

	addKiller(killer) {
		this.#killers.push(killer);
	}

	getProtectorsAsString() {
		var output = [];
		for (var protector of this.#protectors) {
			if (protector instanceof Role) {
				output.push(protector.roleName);
				continue;
			}
			output.push(protector);
		}
		return output;
	}

	addProtector(protector) {
		for (var killer of this.#killers) {
			if (killer instanceof CrocodileAndy || !(killer instanceof Role) || protector == null) {
				this.protectionHolds = false;
				break;
			}
			this.protectionHolds = true;
		}

		this.#protectors.push(protector);
	}

	isProtected() {
		if (this.#protectors.length == 0) return false;
		//If Andy or Hunter are among the attackers or the attacker is no role, no protection holds up
		for (var killer of this.#killers) {
			if (killer instanceof CrocodileAndy || killer instanceof Hunter || !(killer instanceof Role)) {
				return false;
			}
		}

		//If none of the previous checks ended the function, the player's protection is holding up.
		return true;
	}

	setProposalAcceptedToDefault() {
		this.proposalAccepted = this.acceptByDefault();
	}

	acceptByDefault() {
		for (var killer of this.#killers) {
			if (killer instanceof CrocodileAndy)
				return false;
		}
		return !this.isProtected();
	}
}

try {
	module.exports.Model = Model;
	module.exports.Player = Player;
	module.exports.KillProposal = KillProposal;
}
catch (e) {
	if (!(e instanceof ReferenceError) || e.message != "module is not defined") throw e;
}