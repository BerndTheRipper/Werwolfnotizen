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

    loadView(view){
        this.currentView = new view(model, this.viewElement);
    }

    redraw(){
        this.currentView.redraw();
    }
}

//A class to unite common traits of a view in
class View {
    model;
    viewElement;
    constructor(model, viewElement){
        if(!model instanceof Model){
            throw new TypeError("model parameter must be an instance of Model.");
        }
        if(!viewElement instanceof Element){
            throw new TypeError("viewElement parameter must be an instance of Element.");
        }
        this.model = model;
        this.viewElement = viewElement;
        this.redraw();
    }
    redraw(){
        throw new Error("The function redraw of the View class must be implemented.");
    }
}

class InitialView extends View{
    constructor(model, viewElement){
        super(model, viewElement);
    }
    redraw(){
        var htmlBase = document.getElementById("initialView").innerHTML;
        this.viewElement.innerHTML = htmlBase;
        console.log(this.model);
    }
}