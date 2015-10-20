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

	// any global EMC-scope events binding goes here
	bindEvents : function(){
		ToDoApp.DOM.$WIN.on('beforeunload', function(){
			ToDoApp.DOM.$BODY.addClass('loading');
		})
	},


    // on page load, before page routes are triggered
    preRoutes : function(){
    },

    //
    routes : {
        modal     : {},   // all website modals controlelrs should be under this scope

        // Execute the page controller of the current page
        initPage : function(){
            var routes = $(document.body).data('init');
            ToDoApp.utilities.matchRoute(routes);
        }
    },


    init : function(){
        ToDoApp.utilities.defaultCheckbxoes(); // Default back every checkbox and input on the page which might have changed by the user

        // if social connect is neeed, toggle it
        // ToDoApp.connect();

		ToDoApp.bindEvents();
        ToDoApp.preRoutes();
        ToDoApp.routes.initPage();
    }
};

