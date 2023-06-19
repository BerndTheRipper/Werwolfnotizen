class Frontend {
    model;
    
    constructor(model){
        if(!model instanceof Model){
            throw new TypeError("model parameter must be an instance of Model.");
        }
        this.model = model;
    }
}