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
    _generateTableRows(amount){
        var output = document.createElement("tr");
        for(var i = 0; i < amount; i++){
            var entry = document.createElement("td");
            output.appendChild(entry);
        }
        return output;
    }
}

class InitialView extends View{
    constructor(model, viewElement){
        super(model, viewElement);
        var htmlBase = document.getElementById("initialView").innerHTML;
        this.viewElement.innerHTML = htmlBase;
    }

    //TODO add remove button
    redraw(){
        var element = this.viewElement;
        for(var input of element.getElementsByTagName("input")){
            if(input.type == "submit") continue;
            input.value = "";
        }
        var roleData = this.model.getRoleData();
        for(var i in roleData){
            var tr = super._generateTableRows(3);
            tr.children[0].innerText = roleData[i][0];
            tr.children[1].innerText = roleData[i][1];
            tr.children[2].innerText = "Remove button back soon.";
            this.viewElement.getElementsByTagName("tbody")[0].appendChild(tr);
        }
    }
}