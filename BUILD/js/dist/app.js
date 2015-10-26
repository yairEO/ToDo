import './helpers';
import DOM from './helpers/DOMcache';
import * as utilities from './utilities';
import * as controllers from './auto-generated/controllers_bundle';

(function(){
    // development flag,
    //DEV : window.location.hostname == 'localhost',

    var events = {
	   // high-level events binding goes here
        bind : function(){
            DOM.$WIN.on('beforeunload', events.callbacks.beforeunload);
        },

        callbacks : {
            beforeunload : function(){
                DOM.$BODY.addClass('loading');
            }
        }
    }

    // on page load, before page routes are triggered
    function preRoutes(){
        utilities.defaultCheckboxes(); // Default back every checkbox and input on the page which might have changed by the user
    }

    // get the "data-init" from the body element, to know which initial page controller to run
    function initPage(){
        var routes = $(document.body).data('init');

        if( controllers[routes] )
            controllers[routes]();
    }


    function init(){
		events.bind();
        preRoutes();
        initPage();
    }

    init();
})();

