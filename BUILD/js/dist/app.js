const ToDoApp = {
	/////////////////////////////////
    // Global cached DOM elements
    DOM : {
        $HTML : $(document.documentElement),
        $DOC  : $(document),
        $WIN  : $(window),
        $BODY : $(document.body)
    },

    // development flag,

    DEV : window.location.hostname == 'localhost',

    components : {},

    templates : {},

    tmpl : function(s){
        return _.template(ToDoApp.templates[s + '.html']);
    },

    events : {
	   // any high-level events binding goes here
        bind : function(){
            ToDoApp.DOM.$WIN.on('beforeunload', ToDoApp.events.callbacks.beforeunload);
        },

        callbacks : {
            beforeunload : function(){
                ToDoApp.DOM.$BODY.addClass('loading');
            }
        }
    },


    // on page load, before page routes are triggered
    preRoutes : function(){
        ToDoApp.utilities.defaultCheckbxoes(); // Default back every checkbox and input on the page which might have changed by the user
    },

    //
    routes : {
        modal : {},   // all website modals controlelrs should be under this scope

        // Execute the page controller of the current page
        initPage : function(){
            var routes = $(document.body).data('init');
            ToDoApp.utilities.matchRoute(routes);
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

