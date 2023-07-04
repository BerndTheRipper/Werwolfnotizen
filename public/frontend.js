class Frontend {
    model;
    // The view that is currently shown.
    currentView;
    // The view element in the HTML code.
    viewElement;
    constructor(model, viewElement = document.getElementById("view")){
        if(!model instanceof Model){
            throw new TypeError("model parameter must be an instance of Model.");
        }
        this.model = model;
        this.viewElement = viewElement;
    }

    // Event handlers takes in an array of event handlers. See the constructor
    // to see which one goes where.
    loadView(view, eventHandlers){
        this.currentView = new view(model, this.viewElement, eventHandlers);
    }

    redraw(){
        this.currentView.redraw();
        if(this.currentView instanceof InitialView){
            this.redoRoleNamesList();
        } else if(this.currentView instanceof NightView){
            this.redoPlayerNamesList();
        }
    }

    redoRoleNamesList(){
        var roleNamesInGame = model.getRoleNamesInGame();
        var roleNameDataList = document.getElementById("rolenamesdatalist");
        roleNameDataList.innerHTML = "";

        for(var name of Object.keys(Role.roleList)){
            if(roleNamesInGame.includes(name)){
                continue;
            }
            this.addOptionToDataList(roleNameDataList, name);
        }
    }

    redoPlayerNamesList(){
        var datalist = document.getElementById("playernames");
        datalist.innerHTML = "";
        for(var player of this.model.identifiedPlayers){
            this.addOptionToDataList(datalist, player.playerName);
        }
    }

    addOptionToDataList(datalist, value){
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
    constructor(model, viewElement, eventHandlers){
        if(!model instanceof Model){
            throw new TypeError("model parameter must be an instance of Model.");
        }
        if(!viewElement instanceof Element){
            throw new TypeError("viewElement parameter must be an instance of Element.");
        }
        if(!eventHandlers instanceof Array){
            throw new TypeError("eventHandlers parameter must be an instance of Array.");
        }
        for(var i in eventHandlers){
            if(typeof eventHandlers[i] != "function"){
                throw new TypeError("eventHandlers parameter must be an array of functions, but the element at index " + i + " is not.");
            }
        }
        this.model = model;
        this.viewElement = viewElement;
        this.eventHandlers = eventHandlers;
    }
    redraw(){
        throw new Error("The function redraw of the View class must be implemented.");
    }
    _generateTableRows(amount){
        var output = document.createElement("tr");
        for(var i = 0; i < amount; i++){
            var entry = document.createElement("td");
            output.appendChild(entry);
        }
        return output;
    }

    _generateSubmitButton(){
        var output = document.createElement("input");
        output.value = "Weiter";
        output.type= "submit";
        return output;
    }

    //TODO add feature where pre-existing player-name-data is already shown
    //TODO turn the following two functions into wrappers
    _generatePlayerNameInputFromRole(role){
        var roleName = role.roleName;
        var amount = role.amount;
        var output = [];
        for(var i = 0; i < amount; i++){
            var element = document.createElement("input");
            element.type = "text";
            element.placeholder = roleName + " " + (i + 1);
            element.setAttribute("oldindex", "-1");
            output.push(element);

            output.push(document.createElement("br"));
        }

        if(amount == 1){
            output[0].placeholder = roleName;
        }

        return output;
    }

    _generateTargetNameInput(targetText, amount){
        var output = [];
        for(var i = 0; i < amount; i++){
            var element = document.createElement("input");
            element.type = "text";
            element.placeholder = targetText + " " + (i + 1);
            element.name = "target" + i;
            element.setAttribute("list", "playernames");
            output.push(element);
            output.push(document.createElement("br"));
        }

        if(amount == 1){
            output[0].placeholder = targetText;
        }

        return output;
    }
    
    _generatePlayerNameInput(name, placeholder){
        var output = document.createElement("input");
        output.type = "text";
        output.name = name;
        output.placeholder = placeholder;
        output.setAttribute("list", "playernames");
        return output;
    }
}

class InitialView extends View{
    constructor(model, viewElement, eventHandlers){
        super(model, viewElement, eventHandlers);
        var htmlBase = document.getElementById("initialView").innerHTML;
        this.viewElement.innerHTML = htmlBase;
        var form = this.viewElement.getElementsByTagName("form")[0];
        form.onsubmit = eventHandlers[0];

        for(var input of viewElement.getElementsByTagName("input")){
            if(input.type == "checkbox") input.id = input.getAttribute("tid");
        }

        viewElement.getElementsByTagName("button")[0].onclick = eventHandlers[5];
        this.redraw();
    }

    
    redraw(){
        var element = this.viewElement;
        for(var input of element.getElementsByTagName("input")){
            if(input.type == "submit") continue;
            input.value = "";
        }

        this.viewElement.getElementsByTagName("tbody")[0].innerHTML = "";
        var roleData = this.model.getRoleData();
        
        for(var i in roleData){
            var tr = super._generateTableRows(5);
            tr.children[0].innerText = roleData[i][0];
            tr.children[1].innerText = roleData[i][1];

            var buttonTexts = ["Entfernen", "Hoch", "Runter"];
            for(var i = 0; i < 3; i++){
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

class NightView extends View{
    constructor(model, viewElement, eventHandlers){
        super(model, viewElement, eventHandlers);
        var htmlBase = document.getElementById("nightView").innerHTML;
        this.viewElement.innerHTML = htmlBase;

        this.redraw();
    }

    redraw(){
        var currentRole = this.model.roles[this.model.currentRoleToWakeUp];
        var form = this.viewElement.getElementsByClassName("roleSpecificIndicators")[0];
        var formBase = document.getElementsByClassName("roleSpecificIndicators")[0].innerHTML;

        form.innerHTML = formBase;
        form.onsubmit = this.eventHandlers[0];

        var identSection = form.getElementsByClassName("identSection")[0];
        var targetSection = form.getElementsByClassName("targetSection")[0];

        this.viewElement.getElementsByClassName("roleToWakeUpIndicator")[0].innerText = currentRole.roleName;
        
        //Checks if rols is fake
        if(!currentRole.amount){
            this.viewElement.getElementsByClassName("roleToWakeUpIndicator")[0].innerText += " (Fake)";
        } else {
            this.#addPlayerIdent(currentRole, identSection);
            switch(currentRole.roleName){
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
                case "Wehrwolf":
                    //TODO implement pup killed
                case "Priester":
                case "Leibwächter":
                case "Freudenmädchen":
                case "Vampir":
                case "Crocodile Andy":
                case "Alte Vettel":
                    this.#addPlayerTarget(currentRole.targetText, targetSection);
                    break;
                case "Hexe":
                    if(currentRole.canHeal){
                        var attackVictimLabels = ["Niemand"];
                        var attackVictimNames = ["Niemand"];
                        for(var target of this.model.targets){
                            if(!(target[1] instanceof Werewolf) && !(target[1] instanceof Vampire) && !(target[1] instanceof ToughGuy)  && !(target[1] instanceof CrocodileAndy)){
                                continue;
                            }
                            var attackLabel = target[0].playerName + " (Rolle: ";
                            if(target[0].role == null){
                                attackLabel += "Unbekannt";
                            } else {
                                attackLabel += target[0].role.roleName;
                            }
                            attackLabel += ", Angreifer: " + target[1].roleName + ")";
                            attackVictimLabels.push(attackLabel);
                            attackVictimNames.push(target[0].playerName);
                        }
                        var radioButtons = this.#generateRadioButtons(attackVictimLabels, "healTargets", attackVictimNames, 0);

                        for(var element of radioButtons){
                            targetSection.appendChild(element);
                        }
                    }
                    if(currentRole.canPoison){
                        this.#addPlayerTarget(currentRole.targetText, targetSection);
                    }
                    break;
                case "Unruhestifterin":
                    //TODO add question if riot should be started
                    if(this.model.riot == 2){
                        targetSection.innerHTML = "Bereits für Unruhe gesorgt.";
                        break;
                    }
                    var radioButtons = this.#generateRadioButtons(["Unruhe", "Keine Unruhe"], "causeRiot", ["yes", "no"], 1);
                    
                    for(var element of radioButtons){
                        targetSection.appendChild(element);
                    }
                    break;
                case "Seherin":
                    //TODO test code
                    var list = [];
                    for(var player of this.model.identifiedPlayers){
                        if(!player.role || !player.role.evil) continue;
                        list.push(player.playerName + " (Rolle: " + player.role.roleName + ")");
                    }
                    this.#generateUlFromArray(list, targetSection);
                    break;
                default:
                    alert("noch nicht implementiert");
            }
        }
        identSection.getElementsByTagName("input")[0].focus();
    }

    #addPlayerIdent(currentRole, addTo){
        var nameInputFields = this._generatePlayerNameInputFromRole(currentRole);
        for(var inputField of nameInputFields){
            addTo.appendChild(inputField);
        }
    }
    #addPlayerTarget(targetText, addTo, amount = 1){
        var targetInputFields = this._generateTargetNameInput(targetText, amount);
        for(var inputField of targetInputFields){
            addTo.appendChild(inputField);
        }
    }

    #generateRadioButtons(labels, name, values, defaultOptionIndex){
        var output = [];
        for(var i in labels){
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

    #generateUlFromArray(array, parent){
        for(var string of array){
            var ul = document.createElement("ul");
            ul.innerHTML = string;
            parent.appendChild(ul);
        }
    }
}

class DayView extends View{
    constructor(model, viewElement, eventHandlers){
        super(model, viewElement, eventHandlers);
        var htmlBase = document.getElementById("dayView").innerHTML;
        this.viewElement.innerHTML = htmlBase;
        //Set mayor name event handler
        this.redraw();
    }

    redraw(){
        var element = this.viewElement;
        
        //Mayor section:
        var mayorSection = element.getElementsByClassName("mayorSection")[0];
        if(this.model.mayor != null){
            mayorSection.getElementsByClassName("mayorName")[0].value = this.model.mayor.playerName;
            if(this.model.mayor.role != null){
                mayorSection.getElementsByClassName("mayorName")[0].innerText = this.model.mayor.role.roleName;
            }
        }

        //Kill proposals section
        var killProposalSection = element.getElementsByClassName("killProposalSection")[0];
        var killPoposalTbody = killProposalSection.getElementsByTagName("tbody")[0];
        killPoposalTbody.innerHTML = "";
        for(var i in this.model.killProposals){
            var proposal = this.model.killProposals[i];
            var tr = this._generateTableRows(7);
            tr[0].innerHTML.appendChild(this.#generateCheckbox(proposal.acceptByDefault(), false));
            if(proposal.player == null){
                //TODO make role auto-update
                var input = this._generatePlayerNameInput("poposal" + i, "Playername unset");
                tr[1].innerHTML.appendChild(input);
            } else {
                tr[1].innerText = proposal.player.playerName;
            }

            if(proposal.player.role == null){
                tr[2].innerText = "Unbekannt";
            }else{
                tr[2].innerText = proposal.player.role.roleName;
            }

            for(var killer of proposal.getKillersAsString()){
                tr[3].innerText += killer + "; ";
            }

            for(var protector of proposal.getProtectorsAsString()){
                tr[4].innerText += protector;
            }

            var protectedCheckbox = this.#generateCheckbox(proposal.isProtected(), true);
            tr[5].innerHTML.appendChild(protectedCheckbox);

            var acceptCheckbox = this.#generateCheckbox(proposal.acceptByDefault(), false, null);
            tr[6].innerHTML.appendChild(acceptCheckbox);
        }
    }

    #generateCheckbox(checked, disabled, onchange = null){
        var output = document.createElement("input");
        output.type = "checkbox";
        output.checked = checked;
        output.disabled = disabled;
        output.onchange = onchange;
        return output;
    }
}