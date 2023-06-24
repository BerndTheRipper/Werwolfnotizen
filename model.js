class Model{
    // The different phases the game can be in.
    phases = {
        // Roles getting entered
        SETUP:0,
        NIGHTTIME:1,
        DAYTIME:2
    };
    //The roles that are in the game, listed in picking order
    roles = [];
    playerAmountByRolesSum = 0;
    #useDefaultRoleSorting = true;
    currentRoleToWakeUp = 0;
    //The players that are in the game
    identifiedPlayers = [];

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

    // The two people who are in love.
    lovers = [];

    // The player the pleasuregirl stays at
    pleasureGirlHost = null;

    nightNumber = 1;

    // The players that die today. Will be populated after the night taking
    // into account the protection status of the player
    killProposals = [];

    // The kill proposals that were falsely assessed, to be sent to me by the
    // moderator
    falselyAssessedKillProposals = [];

    constructor(){
        
    }

    
    addRole(roleName, amount){
        for(var i in Object.keys(Role.roleList)){
            var iRoleName = Object.keys(Role.roleList)[i];
            if(iRoleName != roleName){
                continue;
            }
            
            var roleClass = Role.roleList[roleName];

            //See if there is already an entry for this role just update it
            for(var role of this.roles){
                if(!(role instanceof roleClass)){
                    continue;
                }

                var amountDifference = amount - role.amount;
                role.amount = amount;
                this.playerAmountByRolesSum += amountDifference;
                return;
            }
            var newRole = new roleClass(amount);

            if(newRole instanceof Rioter){
                this.riot = 0;
            } else if(newRole instanceof ToughGuy){
                this.toughGuyAttacked = 0;
            } else if(newRole instanceof Puppy){
                this.pupKilled = 0;
            }

            if(this.useDefaultRoleSorting){
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
    removeRole(roleName){
        for(var i in this.roles){
            if(this.roles[i] == null) continue;
            if(this.roles[i].roleName != roleName){
                console.log(roleName);
                continue;
            }

            this.playerAmountByRolesSum -= this.roles[i].amount;
            this.roles.splice(i, 1);
            return true;
        }
        return false;
    }

    moveUpRole(roleName){
        //Setting this will clean up any empty spaces
        this.useDefaultRoleSorting = false;
        
        var roleIndex = this.getRoleIndexByName(roleName);        

        //role is already on top of the list
        if(roleIndex == 0){
            return;
        }


        var temp = this.roles[roleIndex - 1];
        this.roles[roleIndex - 1] = this.roles[roleIndex];
        this.roles[roleIndex] = temp;
    }

    moveDownRole(roleName){
        this.useDefaultRoleSorting = false;
        
        var roleIndex = this.getRoleIndexByName(roleName);        

        //role is already on bottom of the list
        if(roleIndex == this.roles.length - 1){
            return;
        }


        var temp = this.roles[roleIndex + 1];
        this.roles[roleIndex + 1] = this.roles[roleIndex];
        this.roles[roleIndex] = temp;
    }

    getRoleIndexByName(roleName){
        var output;

        for(var i in this.roles){
            if(this.roles[i] == null) continue;

            if(this.roles[i].roleName == roleName){
                output = i;
                break;
            }

            //Search has reached the end of the list without a result
            if(i == this.roles.length - 1){
                throw new ReferenceError(roleName + " does not exist.");
            }
        }

        return parseInt(output);
    }

    getRoleData(){
        var output = [];
        for(var role of this.roles){
            if(role == null) continue;
            output.push([role.roleName, role.amount]);
        }
        return output;
    }

    getRoleNamesInGame(){
        var output = [];
        for(var role of this.roles){
            if(role == null) continue;
            output.push(role.roleName);
        }
        return output;
    }

    startFirstNight(){
        //Doing this to get rid of null entries in this.roles
        this.useDefaultRoleSorting = false;
        for(this.currentRoleToWakeUp; !this.roles[this.currentRoleToWakeUp].calledAtNight; this.currentRoleToWakeUp++);
        this.nightNumber = 1;
    }

    startNight(){
        for(this.currentRoleToWakeUp; this.roles[this.currentRoleToWakeUp].calledAtNight == 2; this.currentRoleToWakeUp++);
        this.nightNumber++;
    }

    get useDefaultRoleSorting(){
        return this.#useDefaultRoleSorting;
    }

    set useDefaultRoleSorting(value){
        if(value == this.#useDefaultRoleSorting) return;
        
        this.#useDefaultRoleSorting = value;

        if(value){
            for(var i = 0; i < this.roles.length; i++){
                var intendedIndex = Object.values(Role.roleList).indexOf(this.roles[i].constructor);

                if(i == intendedIndex) continue;

                var temp = this.roles[i];
                this.roles[i] = this.roles[intendedIndex];
                this.roles[intendedIndex] = temp;

                if(this.roles[i] != null) i--;
            }
        } else {
            for(var i = 0; i < this.roles.length; i++){
                while(this.roles[i] == null){
                    this.roles.splice(i, 1);
                }
            }
        }
    }
}

class KillProposal {
    // The player that is to be killed
    player;
    // The reason for the kill. Described with a string like werewolf or lover
    // of x
    killer;
    // Is the player under someone's protection?
    protector = null;
    // Protection valid
    valid = true;
}