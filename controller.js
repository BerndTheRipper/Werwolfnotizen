class Controller {
    model;
    //TODO rename to frontend to avoid confusion
    view;
    eventHandlers = [
        //Initial view event handlers
        [this.addRoleEvent, this.removeRoleEvent, this.moveUpRoleEvent, this.moveDownRoleEvent, this.checkboxOnClick, this.doneWithRoles],
        //Night view
        [this.wakeUpNextRole, this.playerIdentifyInputUnfocused],
        //Day view
        [this.newMayorUnfocus, this.daytimeFormSubmitted, this.roleChangedThroughDropdown]
    ];
    
    constructor(model, view){
        if(!model instanceof Model){
            throw new TypeError("model parameter must be an instance of Model.");
        }
        if(!view instanceof View){
            throw new TypeError("view parameter must be an instance of View.");
        }
        this.model = model;
        this.view = view;
    }

    //Event handlers for initial view:
    addRoleEvent(e){
        e.preventDefault();
        try{
            //This is an event handler for the form, to the this keyword refers to
            //the form that triggered the event
            controller.model.addRole(this.roleName.value, parseInt(this.roleAmount.value));
            controller.view.redraw();
        } catch(e){
            if(e instanceof ReferenceError){
                alert(e.message);
            } else {
                throw e;
            }
        }
    }

    removeRoleEvent(e){
        //                   button td element    tr element    td with name
        var roleNameToRemove = this.parentElement.parentElement.children[0].innerText;
        controller.model.removeRole(roleNameToRemove);
        controller.view.redoRoleNamesList();
        controller.view.redraw();
    }

    moveUpRoleEvent(e){
        var roleNameToMove = this.parentElement.parentElement.children[0].innerText;
        controller.model.moveUpRole(roleNameToMove);
        controller.view.redraw();
    }

    moveDownRoleEvent(e){
        var roleNameToMove = this.parentElement.parentElement.children[0].innerText;
        controller.model.moveDownRole(roleNameToMove);
        controller.view.redraw();
    }

    checkboxOnClick(e){
        controller.model.useDefaultRoleSorting = this.checked;
        controller.view.redraw();
    }

    doneWithRoles(e){
        controller.model.startFirstNight();
        controller.view.loadView(NightView, controller.eventHandlers[1]);
    }

    wakeUpNextRole(e){
        e.preventDefault();
        var form = e.target;
        var playerNames = [];
        var oldIndexes = [];
        var inputElements = form.querySelectorAll(".identSection>input");
        for(var element of inputElements){
            if(playerNames.value == "" || element.type != "text") continue;
            playerNames.push(element.value);
            oldIndexes.push(element.getAttribute("oldindex"));
        }

        var targetElements = form.querySelectorAll(".targetSection>input");
        
        if(controller.model.roles[controller.model.currentRoleToWakeUp] instanceof Witch){
            //TODO handle witch input when I get there
            //First checks if healTargets exists and then checks for the value
            if(form.healTargets && form.healTargets.value != "Niemand"){
                controller.model.enterTarget(form.healTargets.value, true);
            }
            
            if(form.target0 && form.target0.value != ""){
                controller.model.enterTarget(form.target0.value, false);
            }
        } else {
            for(var element of targetElements){
                controller.model.enterTarget(element.value);
            }
        }
        
        controller.model.identifyPlayers(playerNames, oldIndexes);

        try{
            controller.model.wakeUpNextRole();
        }
        catch(e){
            if(!(e instanceof RangeError)){
                throw e;
            }
        }
        
        if(controller.model.currentRoleToWakeUp >= controller.model.roles.length){
            controller.model.calculateKillProposalsFromTargets();
            controller.view.loadView(DayView, controller.eventHandlers[2]);
            return;
        }
        controller.view.redraw();
    }

    newMayorUnfocus(e){
        controller.view.redraw();
    }

    daytimeFormSubmitted(e){
        e.preventDefault();

        //Submitted through kill button
        if(e.submitter.classList.contains("killButton")){
            var playerName = e.submitter.parentElement.parentElement.querySelector("td").innerText;
            var playerObject = controller.model.findPlayerByName(playerName, false);
            controller.model.addKillerToProposal(playerObject, "Moderator");
            controller.view.redraw();
        }
    }

    roleChangedThroughDropdown(e){
        if(e.target.classList.contains("roleSelector")){
            var playerName = e.target.parentElement.previousElementSibling.innerText;
            var player = controller.model.findPlayerByName(playerName, false);
            var roleIndex = -1;

            try{
                roleIndex = controller.model.getRoleIndexByName(e.target.value);
            } catch(e){
                //Do nothing, just not crash
            }

            var newRole = controller.model.roles[roleIndex];
            player.role = newRole;
            controller.view.redraw();
        }
    }

    playerIdentifyInputUnfocused(e){
        var inputElement = e.target;
        var oldIndex = parseInt(inputElement.getAttribute("oldIndex"));

        if(oldIndex == -1){
            var roleOfPlayer;

            if(inputElement.getAttribute("role") != null){
                var roleIndex = controller.model.getRoleIndexByName(inputElement.getAttribute("role"));
                roleOfPlayer = controller.model.roles[roleIndex];
            }

            var index = controller.model.findPlayerByName(inputElement.value, true, roleOfPlayer);
            inputElement.setAttribute("oldIndex", index);
            
        } else if(inputElement.value == ""){
            controller.model.identifiedPlayers[oldIndex].role = null;
            controller.model.identifiedPlayers.splice(oldIndex, 1);
            inputElement.removeAttribute("oldIndex");
        } else {
            controller.model.identifiedPlayers[oldIndex].playerName = inputElement.value;
        }

        if(controller.view.currentView instanceof DayView) controller.view.redraw();
    }

    amountIdentifiedChanged(){
        //Redraw if current view is daytime
    }
}