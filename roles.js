class Role {
	//0 Not at all, 1: first night, 2: every night
	calledAtNight;
	amount;
	#amountIdentified = 0;
	amountIdentifiedChangedHandlers = [];
	evil;
	//0 Can't, 1 once, 2 anytime morning, 3 anytime evening, 4 andy
	canKill;
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
	constructor(amount) {
		super(amount, 1, false);
	}
}

class Priest extends Role {
	roleName = "Priester";
	constructor(amount) {
		super(amount, 1, false);
	}
}

class Guardian extends Role {
	roleName = "Leibwächter";
	constructor(amount) {
		super(amount, 2, false);
	}
}

class OldVettel extends Role {
	roleName = "Alte Vettel";
	constructor(amount) {
		super(amount, 2, false);
	}
}

class Pleasuregirl extends Role {
	roleName = "Freudenmädchen";
	constructor(amount) {
		super(amount, 2, false);
	}
}

class Werewolf extends Role {
	roleName = "Werwolf";
	constructor(amount) {
		super(amount, 2, true, 2);
	}
}

class Puppy extends Werewolf {
	roleName = "Wolfsjunges";
	constructor(amount) {
		super(amount);
	}
}

class Vampire extends Role {
	roleName = "Vampir";
	constructor(amount) {
		super(amount, 2, true, 3);
	}
}

class CrocodileAndy extends Role {
	roleName = "Crocodile Andy";
	constructor(amount) {
		super(amount, 2, true, 4);
	}
}

class Witch extends Role {
	roleName = "Hexe";
	canHeal = true;
	canPoison = true;
	constructor(amount) {
		super(amount, 2, false, 1);
	}
}

class Rioter extends Role {
	roleName = "Unruhestifterin";
	constructor(amount) {
		super(amount, 2, false);
	}
}

class Seer extends Role {
	roleName = "Seherin";
	constructor(amount) {
		super(amount, 2, false);
	}
}

//Roles that may be called optionally
class ToughGuy extends Role {
	roleName = "Harter Bursche";
	constructor(amount) {
		super(amount, 1, false);
	}
}

class Bard extends Role {
	roleName = "Barde";
	constructor(amount) {
		super(amount, 1, false);
	}
}

class Constructor extends Role {
	roleName = "Freimaurer";
	constructor(amount) {
		super(amount, 1, false);
	}
}

class Idiot extends Role {
	roleName = "Idiot";
	constructor(amount) {
		super(amount, 0, false);
	}
}

//Hinterwäldler
class Dumbass extends Role {
	roleName = "Hinterwäldler";
	constructor(amount) {
		super(amount, 0, false);
	}
}

//Aussätzige
class Leper extends Role {
	roleName = "Aussätzige";
	constructor(amount) {
		super(amount, 0, false);
	}
}

class Prince extends Role {
	roleName = "Prinz";
	constructor(amount) {
		super(amount, 0, false);
	}
}

class Hunter extends Role {
	roleName = "Jäger";
	constructor(amount) {
		super(amount, 0, false);
	}
}

class Mime extends Role {
	roleName = "Pantomime";
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