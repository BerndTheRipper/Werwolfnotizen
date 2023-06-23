class Controller {
    model;
    view;
    eventHandlers = [
        //Initial view event handlers
        [this.addRoleEvent, this.removeRoleEvent, this.moveUpRoleEvent, this.moveDownRoleEvent, this.checkboxOnClick]
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
            controller.view.redoRoleNamesList();
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

    amountIdentifiedChanged(){
        //Redraw if current view is daytime
    }
}