class Role {
	//0 Not at all, 1: first night, 2: every night
	calledAtNight;
	amount;
	#amountIdentified = 0;
	amountIdentifiedChangedHandlers = [];
	evil;
	//0 Can't, 1 once, 2 anytime morning, 3 anytime evening, 4 andy
	canKill;
	onlyOneAllowed;
	targetText = "Target Text placeholder";
	static totalPlayersByRolesSum = 0;

	//Gets filled at bottom of file
	static roleList = {};

	constructor(amount, calledAtNight, evil, canKill = 0) {
		this.amount = amount;
		this.calledAtNight = calledAtNight;
		this.evil = evil;
		this.canKill = canKill;
	}

	get amountIdentified() {
		return this.#amountIdentified;
	}

	set amountIdentified(value) {
		this.#amountIdentified = value;
		for (var handler of this.amountIdentifiedChangedHandlers) {
			handler(this);
		}
	}
}

//copy/pasted from legacy codebase
//Roles that are called at night for their ability
class Amor extends Role {
	roleName = "Amor";
	static onlyOneAllowed = true;
	constructor(amount) {
		super(amount, 1, false);
	}
}

class Priest extends Role {
	roleName = "Priester";
	static onlyOneAllowed = true;
	constructor(amount) {
		super(amount, 1, false);
	}
}

class Guardian extends Role {
	roleName = "Leibwächter";
	static onlyOneAllowed = true;
	constructor(amount) {
		super(amount, 2, false);
	}
}

class OldVettel extends Role {
	roleName = "Alte Vettel";
	static onlyOneAllowed = true;
	constructor(amount) {
		super(amount, 2, false);
	}
}

class Pleasuregirl extends Role {
	roleName = "Freudenmädchen";
	static onlyOneAllowed = true;
	constructor(amount) {
		super(amount, 2, false);
	}
}

class Werewolf extends Role {
	roleName = "Werwolf";
	static onlyOneAllowed = false;
	constructor(amount) {
		super(amount, 2, true, 2);
	}
}

class Puppy extends Role {
	roleName = "Wolfsjunges";
	static onlyOneAllowed = true;
	constructor(amount) {
		// Gets called with werewolves, but not separately, also doesn't kill separately
		super(amount, false, true, 0);
	}
}

class Vampire extends Role {
	roleName = "Vampir";
	static onlyOneAllowed = true;
	constructor(amount) {
		super(amount, 2, true, 3);
	}
}

class CrocodileAndy extends Role {
	roleName = "Crocodile Andy";
	static onlyOneAllowed = true;
	constructor(amount) {
		super(amount, 2, true, 4);
	}
}

class Witch extends Role {
	roleName = "Hexe";
	canHeal = true;
	canPoison = true;
	static onlyOneAllowed = true;
	constructor(amount) {
		super(amount, 2, false, 1);
	}
}

class Rioter extends Role {
	roleName = "Unruhestifterin";
	static onlyOneAllowed = true;
	constructor(amount) {
		super(amount, 2, false);
	}
}

class Seer extends Role {
	roleName = "Seherin";
	static onlyOneAllowed = true;
	constructor(amount) {
		super(amount, 2, false);
	}
}

//Roles that may be called optionally
class ToughGuy extends Role {
	roleName = "Harter Bursche";
	static onlyOneAllowed = true;
	constructor(amount) {
		super(amount, 1, false);
	}
}

class Bard extends Role {
	roleName = "Barde";
	static onlyOneAllowed = false;
	constructor(amount) {
		super(amount, 1, false);
	}
}

class Constructor extends Role {
	roleName = "Freimaurer";
	static onlyOneAllowed = false;
	constructor(amount) {
		super(amount, 1, false);
	}
}

class Idiot extends Role {
	roleName = "Idiot";
	static onlyOneAllowed = false;
	constructor(amount) {
		super(amount, 0, false);
	}
}

//Hinterwäldler
class Dumbass extends Role {
	roleName = "Hinterwäldler";
	static onlyOneAllowed = false;
	constructor(amount) {
		super(amount, 0, false);
	}
}

//Aussätzige
class Leper extends Role {
	roleName = "Aussätzige";
	static onlyOneAllowed = true;
	constructor(amount) {
		super(amount, 0, false);
	}
}

class Prince extends Role {
	roleName = "Prinz";
	static onlyOneAllowed = true;
	constructor(amount) {
		super(amount, 0, false);
	}
}

class Hunter extends Role {
	roleName = "Jäger";
	static onlyOneAllowed = false;
	constructor(amount) {
		super(amount, 0, false);
	}
}

class Mime extends Role {
	roleName = "Pantomime";
	static onlyOneAllowed = false;
	constructor(amount) {
		super(amount, 0, false);
	}
}

Role.roleList = {
	"Harter Bursche": ToughGuy,
	"Amor": Amor,
	"Priester": Priest,
	"Leibwächter": Guardian,
	"Alte Vettel": OldVettel,
	"Freudenmädchen": Pleasuregirl,
	"Werwolf": Werewolf,
	"Wolfsjunges": Puppy,
	"Vampir": Vampire,
	"Crocodile Andy": CrocodileAndy,
	"Hexe": Witch,
	"Unruhestifterin": Rioter,
	"Seherin": Seer,
	"Barde": Bard,
	"Freimaurer": Constructor,
	"Idiot": Idiot,
	"Hinterwäldler": Dumbass,
	"Aussätzige": Leper,
	"Prinz": Prince,
	"Jäger": Hunter,
	"Pantomime": Mime
};

try {
	module.exports.setAsGlobal = () => {
		global.Role = Role;

		for (var role of Object.values(Role.roleList)) {
			global[role.name] = role;
		}
	}
}
catch (e) {
	if (!(e instanceof ReferenceError) || e.message != "module is not defined") throw e;
}