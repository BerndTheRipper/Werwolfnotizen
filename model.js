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
    //The players that are in the game
    alivePlayers = [];

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

    //TODO: Actually implement with role classes
    addRole(roleName, amount){
        for(var iRoleName of Object.keys(Role.roleList)){
            if(iRoleName != roleName){
                continue;
            }
            
            var roleClass = Role.roleList[roleName];

            //See if there is already an entry for this role just update it
            for(var role of this.roles){
                if(!role instanceof roleClass){
                    continue;
                }

                role.amount = amount;
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

            this.roles.push(newRole);
            return;
        }

        throw new ReferenceError("Ich kenne die Rolle " + roleName + " nicht.");
    }

    //Returns true if the role was found and removed
    //Returns false if the role was never on the list
    removeRole(roleName){
        for(var i in this.roles){
            if(this.roles[i].roleName != roleName){
                console.log(roleName);
                continue;
            }

            this.roles.splice(i, 1);
            return true;
        }
        return false;
    }

    getRoleData(){
        var output = [];
        for(var role of this.roles){
            output.push([role.roleName, role.amount]);
        }
        return output;
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