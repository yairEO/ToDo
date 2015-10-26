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
        // since there is only one page, it will be invoked as the default and only one:
        state.controller = controllers['toDo']();

        Router
            .add(/completed/, function(){
                // filter all lists
                events.callbacks.filterAllLists('completed');
            })
            .add(/active/, function(){
                events.callbacks.filterAllLists('active');
            })
            .add(function() {
                events.callbacks.filterAllLists('all');
                // for unkown routes, navigate back to root
                Router.navigate('');
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
                state.controller.components.ToDo.instances.forEach(function(instance){
                    instance.filter(value);
                })
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

