var model;

var frontend;

var controller;

window.onload = ()=>{
    model = new Model();

    frontend = new Frontend(model);

    controller = new Controller(model, frontend);
    frontend.loadView(InitialView, controller.eventHandlers[0]);
}