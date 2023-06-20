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
    //TODO: Input validation once roles are implemented
    addRoleEvent(e){
        e.preventDefault();
        controller.model.addRole(this.roleName.value, this.roleAmount.value);
        controller.view.redraw();
    }
}