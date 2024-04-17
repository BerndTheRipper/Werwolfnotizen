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
	// TODO test if it works without this
	// lovers = [];

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

	// hunterTargetsToday = 0;

	constructor() {

	}

	/**
	 * Adds a role to the game. If [useDefaultRoleSorting]{@link useDefaultRoleSorting} is true, it will be added to the spot where the
	 * role can be found in [Role.roleList]{@link Role#roleList}, otherwise it will be added ad the end of the list.
	 * @access public
	 * @todo figure out if I did the above link right
	 * @param {string} roleName the name of the role that is to be added
	 * @param {number} [amount=1] the amount of people that can have this role
	 * @returns {Role} the role that was created
	 * @throws {RangeError} When it is attempted to add a role with more than one member but it only allows one member
	 * @throws {ReferenceError} When the role that is returned is unknown
	 */
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
				return role;
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
			return newRole;
		}

		throw new ReferenceError("Ich kenne die Rolle " + roleName + " nicht.");
	}

	/**
	 * 
	 * @param {string} roleName the name of the role that should be removed
	 * @param {boolean} [resetRoleVariable=true] Whether or not related variables like {@link leperKilled} for the {@link Leper} should be reset
	 * @returns true if the role was found and removed, false if the role was never on the list or doesn't exist
	 */
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
			//TODO: reconsider these two why again?
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

	/**
	 * Moves a role up or down on the list of roles. Also automatically disables {@link useDefaultRoleSorting}
	 * @param {string} roleName the name of the role that should be moved up or down
	 */
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
		}

		output = parseInt(output);
		if (isNaN(output)) {
			throw new ReferenceError(roleName + " does not exist.");
		} else {
			return parseInt(output);
		}
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
			if (role == null || role.amountIdentified == role.amount) continue;
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
		//TODO test if this fixes it and also was this even a bug?
		// if (this.nextMayor instanceof Player) {
		this.mayor = this.nextMayor;
		this.nextMayor = null;
		// }
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
			if (this.identifiedPlayers[indexes[i]] instanceof Player) {
				this.identifiedPlayers[indexes[i]].playerName = names[i];
			}
		}

		for (var i in names) {
			this.addPlayer(names[i], currentRole);
		}
	}

	enterTarget(...names) {
		for (name in names) {
			if (typeof name != "string") throw new TypeError("One of the items in the list of names is not a string!");
		}
		var currentRole = this.roles[this.currentRoleToWakeUp];
		if (currentRole instanceof Witch) {
			//TODO why +2? Why even a loop? how is this not going wrong miserably? test this further
			//ANSWER: because there is always a name being passed and then whether it is healing or not
			for (var i = 0; i < names.length; i += 2) {
				let playerObject = this.findPlayerByName(names[i]);
				let isHealing = names[i + 1];
				this.targets.push([playerObject, currentRole, isHealing]);
			}
			return;
		}
		for (var name of names) {
			this.targets.push([this.findPlayerByName(name), currentRole]);
		}
	}

	/**
	 * 
	 * @param {string} name the name of the player to find
	 * @param {boolean} addIfNone whether the player should be added if he is not found
	 * @param {Role|number|null} role If it is an instance of Role, gives that role to the player,
	 * 	if it is -1, the role gets removed, if it is null, nothing changes
	 * @param {boolean} [throwIfNone=true] How to handle if no player was found and none should be added. Returns null if that's the case and throwIfNone is false
	 * @throws {ReferenceError} if the player was not found, addIfNone is false and throwIfNone is true
	 * @returns The player that was found/added, or null if no player found and if addIfNone and throwIfNone are false
	 */
	findPlayerByName(name, addIfNone = true, role = null, throwIfNone = true) {
		for (var player of this.identifiedPlayers) {
			if (player.playerName != name) continue;
			if (role == -1) player.role = null;
			else if (role != null) player.role = role;
			return player;
		}
		if (addIfNone) {
			return this.addPlayer(name, role);
		}
		if (throwIfNone) {
			throw new ReferenceError(name + " is not ingame and could not be added because addIfNone is false");
		}
		return null;
	}

	/**
	 * 
	 * @param {string} name The name of the wanted player
	 * @param {boolean} addIfNone Whether or not to add the player if no player is found. Will add the player if true.
	 * @param {Role|null} role If set, will assign this role to the player that was found
	 * @returns The index of the player that was found/added, or null if no player was found and addIfNone is false
	 */
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

	addPlayer(name, role = null) {
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
		this.processSubsequentTargets();

		// TODO show need for hunter targets on dayview screen
	}

	processSubsequentTargets() {
		var doneWithLovers = false;
		var hunterTargetsNeeded = 0;
		let hunterTargetsFound = 0;
		let killerAdded = false;

		//The instance of the hunter role that is used in game, for the killProposalReason
		// var hunterInstance;
		for (let player of this.identifiedPlayers) {
			let killers = player.getKillers();
			if (killers.length == 0) continue;
			for (let killer of killers) {
				if (!(killer instanceof Hunter) || !(killer instanceof Player && killer.role instanceof Hunter)) continue;
				hunterTargetsFound++;
				break;
			}

			if (player == this.pleasureGirlHost && player.diesTonight) {
				for (let pleasureGirl of this.identifiedPlayers) {
					if (pleasureGirl == null) continue;
					if (!(pleasureGirl.role instanceof Pleasuregirl)) continue;
					this.addKillerToPlayer(pleasureGirl, "Freudenmädchen bei " + player.playerName);
					break;
				}
			}

			if (player.inLove && !doneWithLovers && !player.isProtected() && (player.diesTonight || !player.isProtected())) {
				for (let lover of this.identifiedPlayers) {
					if (!lover.inLove || lover == player) continue;
					let killerToAdd = "Verliebt in " + player.playerName;

					if (!player.getKillers().includes(killerToAdd)) {
						player.addKiller(killerToAdd);

						//TODO figure out why we have this
						killerAdded = true;
					}

					doneWithLovers = true;
					break;
				}
			}

			if (player.role instanceof Hunter) {
				if (!player.isProtected) hunterTargetsNeeded++;
			}
		}
		// this.hunterTargetsToday = hunterTargetsNeeded;
	}

	processTargets() {
		for (var target of this.targets) {
			//Attacking targets
			if (target[1] instanceof Werewolf || target[1] instanceof CrocodileAndy || target[1] instanceof Vampire || target[1] instanceof ToughGuy) {
				target[0].addKiller(target[1]);
			}
			else if (target[1] instanceof Amor) {
				// this.lovers.push(target[0]);
				target[0].inLove = true;
			}
			else if (target[1] instanceof Priest) {
				if (target[0].role instanceof Vampire) {
					target[0].addKiller(target[1]);
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
					target[0].addKiller(target[1]);
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

	addKillerToPlayer(player, attacker) {
		player.addKiller(attacker);
	}

	finishProposals() {
		for (var proposal of this.killProposals) {
			if (!proposal.proposalAccepted) {
				continue;
			}

			if (proposal.player.role == null) {
				throw new Error(`The role of ${proposal.player.playerName} is not set.`);
			}

			let resetRoleVariable = !(proposal.player.role instanceof Puppy || proposal.player.role instanceof Leper);

			//TODO: Add ignore of role-death-related variables
			// if (proposal.player.role instanceof Rioter) {
			//TODO why did I do this? (Start a riot if rioter dies instead of when she decides it)
			// 	this.riot = 1;
			// } else 
			if (proposal.player.role instanceof ToughGuy) {
				//QUESTION : If a werewolf attacks a tough guy, does the visiting hokker also die?
				//Does she die if the pleasuregirl visits the night he bleeds out?
				this.toughGuyAttacked += 1;
				//If toughGuyAttacked has previously been 0, it is now 1, meaning that he doesn't die
				//today, so the loop doesn't get to continue. If it turns it to two, the loop does continue.
				if (this.toughGuyAttacked == 1) continue;
			} else if (proposal.player.role instanceof Puppy) {
				// QUESTION : Do the werewolves only kill two if puppy gets
				// killed by humans or do killers like vampires also count
				this.pupKilled = 1;
			} else if (proposal.player.role instanceof Leper) {
				for (var reason of proposal.getKillers()) {
					if (!(reason instanceof Werewolf)) continue;
					this.leperKilled = 1;
					break;
				}

				if (!this.leperKilled) {
					//TODO: test this
					//This variable is set to false if the victim is either a leper or a puppy.
					//If this.leper doesn't turn to 1, meaning that she wasn't killed by the
					//werewolves, it would still be 0 and through her death, it gets set to 2
					//(meaning dead or she never existed)
					resetRoleVariable = true;
				}
			}

			proposal.player.role.amount--;

			if (proposal.player.role.amount == 0) {
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
				console.warn("The player that was killed by the vettel just died.");
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
	//TODO add converter for this to string
	#attackers = [];
	// Protections that last the whole game
	#generalProtectors = [];
	// Protections that will last during the whole day
	#todaysProtectors = [];
	dyingTonight = false;

	static totalPlayersIdentified = 0;
	constructor(playerName, role) {
		this.playerName = playerName;
		this.role = role;
		this.constructor.totalPlayers++;
	}

	getKillers() {
		return this.#attackers;
	}

	getKillersAsString() {
		var output = [];
		for (var killer of this.#attackers) {
			if (killer instanceof Role) {
				output.push(killer.roleName);
				continue;
			}
			else if (killer instanceof Player) {
				output.push(killer.playerName);
				continue;
			}
			output.push(killer);
		}
		return output;
	}

	addKiller(killer) {
		return this.#attackers.push(killer);
	}

	removeKillerByIndex(index) {
		this.#attackers.splice(index, 1);
		if (this.#attackers.length == 0) this.dyingTonight = false;
	}

	getProtectorsAsString() {
		var output = [];
		for (var protector of this.#generalProtectors.concat(this.#todaysProtectors)) {
			if (protector instanceof Role) {
				output.push(protector.roleName);
				continue;
			}
			if (protector instanceof Player) {
				let pushing = protector.playerName + " (Rolle: ";
				if (protector.role != null) pushing += protector.role.roleName;
				else pushing += "Unbekannt";
				pushing += ")";
				output.push(pushing);
				continue;
			}
			output.push(protector);
		}
		return output;
	}

	addProtector(protector, forWholeGame = false) {
		if (forWholeGame) {
			return this.#generalProtectors.push(protector);
		}
		return this.#todaysProtectors.push(protector);
	}

	removeProtector(protector) {
		for (let i in this.#todaysProtectors) {
			if (this.#todaysProtectors[i] == protector) {
				this.#todaysProtectors.splice(i, 1);
				return;
			}
		}
		for (let i in this.#generalProtectors) {
			if (this.#generalProtectors[i] == protector) {
				this.#generalProtectors.splice(i, 1);
				return;
			}
		}
		throw new ReferenceError("Given protector was not found.");
	}

	isProtected() {
		if (this.#generalProtectors.length == 0 && this.#todaysProtectors.length == 0) return false;

		for (let killer of this.#attackers) {
			if (killer instanceof CrocodileAndy || (killer instanceof Player && killer.role instanceof Hunter) || (!(killer instanceof Role) && !(killer instanceof Player))) {
				return false;
			}
		}
	}

	setDyingTonightToDefault() {
		if (this.getKillers().length > 0) {
			this.dyingTonight = !this.isProtected();
		}
		else {
			this.dyingTonight = false;
		}
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

try {
	module.exports.Model = Model;
	module.exports.Player = Player;
}
catch (e) {
	if (!(e instanceof ReferenceError) || e.message != "module is not defined") throw e;
}
