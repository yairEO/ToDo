import defaultCheckboxes from './utils/defaultCheckboxes';
import './utils/contenteditable';
import DOM from './utils/DOMcache';
import * as controllers from './auto-generated/controllers_bundle';

(function() {
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
        defaultCheckboxes();
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

