////////////////////////////////////////////////////////
// Any global configuration

ToDoApp.config = (function(){
    "use strict";

    // Configure underscore's template engine
    _.templateSettings = {
        interpolate : /\{\{\=(.+?)\}\}/g,
        escape      : /\{\{\-(.+?)\}\}/g,
        evaluate    : /\{\{(.+?)\}\}/g
    };

    return {
    }
})();