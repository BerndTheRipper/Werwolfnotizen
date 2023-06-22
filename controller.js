class Controller {
    model;
    view;
    eventHandlers = [
        //Initial view event handlers
        [this.addRoleEvent]
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

    amountIdentifiedChanged(){
        //Redraw if current view is daytime
    }
}