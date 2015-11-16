import defaultCheckboxes from './utils/defaultCheckboxes';
import './utils/contenteditable';
import DOM from './utils/DOMcache';
import * as controllers from './auto-generated/controllers_bundle';
import Router from './vendor/router';
// import * as utils from './utils';

(function() {
    // development flag,
    //DEV : window.location.hostname == 'localhost';

    var state = {
        controller : null
    }

    function routes(){
        // The first (and default) state of the application will the set as the To-Do controller
        state.controller = controllers['toDo']();

        Router
            .add(/ToDo\/completed/, function(){
                // filter all lists
                events.callbacks.filterAllLists('completed');
            })
            .add(/ToDo\/active/, function(){
                events.callbacks.filterAllLists('active');
            })
            .add(/ToDo/, function(){
                events.callbacks.filterAllLists('all');
            })
            .add(function() {
                // for unkown routes, navigate back to root
               // Router.navigate('ToDo');
                events.callbacks.filterAllLists('all');
            })
            .listen(); // listen to url changes

        Router.check(); // check current window url
    }

    var events = {
	   // high-level events binding goes here
        bind : function(){
            DOM.$WIN.on('beforeunload', events.callbacks.beforeunload);
        },

        callbacks : {
            beforeunload : function(){
                DOM.$BODY.addClass('loading');
            },

            filterAllLists : function(value){
                if( state.controller )
                    state.controller.components.ToDo.instances.forEach(function(instance){
                        instance.filter(value);
                    })
                else
                    console.warn('no app state');
            }
        }
    }

    // on page load, before page routes are triggered
    function preRoutes(){
        defaultCheckboxes();
    }

    function init(){
		events.bind();
        preRoutes();
        routes();
    }

    init();
})();

