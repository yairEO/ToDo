import './helpers';
import DOM from './helpers/DOMcache';
import * as utilities from './utilities';
import * as controllers from './auto-generated/controllers_bundle';

const ToDoApp = {
    // development flag,
    DEV : window.location.hostname == 'localhost',

    events : {
	   // high-level events binding goes here
        bind : function(){
            DOM.$WIN.on('beforeunload', ToDoApp.events.callbacks.beforeunload);
        },

        callbacks : {
            beforeunload : function(){
                DOM.$BODY.addClass('loading');
            }
        }
    },


    // on page load, before page routes are triggered
    preRoutes : function(){
        // _.templateSettings = {
        //     interpolate : /\{\{\=(.+?)\}\}/g,
        //     escape      : /\{\{\-(.+?)\}\}/g,
        //     evaluate    : /\{\{(.+?)\}\}/g
        // };

        utilities.defaultCheckboxes(); // Default back every checkbox and input on the page which might have changed by the user
    },

    //
    routes : {
        modal : {},   // all website modals controlelrs should be under this scope

        // Execute the page controller of the current page
        initPage : function(){
            var routes = $(document.body).data('init');

            if( controllers[routes] )
                controllers[routes]();
            //utilities.matchRoute(routes);
        }
    },


    init : function(){
        // if social connect is neeed, toggle it
        // ToDoApp.connect();

		ToDoApp.events.bind();
        ToDoApp.preRoutes();
        ToDoApp.routes.initPage();
    }
};

ToDoApp.init();
