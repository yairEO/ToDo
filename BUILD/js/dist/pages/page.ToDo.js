////////////////////////////////////
// Main dashboard controller

ToDoApp.routes.ToDo = function(){
    "use strict";

    // Cached page DOM elements
    var DOM = {
        ToDoComponent : $('.ToDoComponent')
    }

    // components this page is using
    var components = {
        toDo : new ToDoApp.components.ToDo()
    }

    // replace page's components placeholders with real components
    DOM.ToDoComponent.replaceWith( components.toDo.DOM.scope );
    DOM.ToDoComponent = $('.ToDoComponent');

    // setup "follwer" lpugin for sorting buttons (cool effect)
    DOM.ToDoComponent.find('.filter').follower({ start:0, selector:'label', snap:true });
}