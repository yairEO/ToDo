/////////////////////////////////////////
//////// Utility functions (which might be handy)

ToDoApp.utilities = {
    isOldIE : document.all && !window.atob,

    getPrefixed : function(prop){
        var i, s = document.createElement('p').style, v = ['ms','O','Moz','Webkit'];
        if( s[prop] == '' ) return prop;
        prop = prop.charAt(0).toUpperCase() + prop.slice(1);
        for( i = v.length; i--; )
            if( s[v[i] + prop] == '' )
                return (v[i] + prop);
    },

    // responsive url filtering and formating
    largeImageUrlFilter : function(url){
        if( window.screen.availWidth < 500 )
            url = url.replace('/3_', '/2_');

        return url;
    },

    defaultCheckbxoes : function(){
        var allInputs = document.querySelectorAll('input');

        // loop on all checkboxes found (trick to iterate on nodeList)
        [].forEach.call(allInputs, function (input) {
            if( input.type == 'checkbox')
                input.checked = input.defaultChecked;
            else
                input.value = input.defaultValue;
        });
    },

    // General window values on resize
    // window : (function(){
    //     var result = { scrollY : 0 },
    //         timer,
    //         getScrollY = function(){
    //             fastdom.read(function(){
    //                 result.scrollY = window.pageYOffset || document.documentElement.scrollTop;
    //                 clearTimeout(timer);
    //                 timer = setTimeout(scrollEnd, 200);
    //                 if( timer != null )
    //                     ToDoApp.DOM.$BODY.addClass('scrolling');
    //             });
    //         };

    //     function scrollEnd(){
    //         timer = null;
    //         ToDoApp.DOM.$BODY.removeClass('scrolling');
    //     }

    //     ToDoApp.DOM.$WIN.on('scroll.getScrollY', getScrollY);
    //     getScrollY();

    //     return result;
    // })(),


    ///////////////////////////////////
    // parse URL
    URIparse : function(url){
        if( !url ){
            console.warn('URL is underfined. using current one');
            url = window.location.href;
        }

        var parser = document.createElement('a'),
            searchObject = {},
            queries, split, i;

        // Let the browser do the work
        parser.href = url;

        // Convert query string to object
        queries = parser.search.replace(/^\?/, '').split('&');

        for( i = 0; i < queries.length; i++ ) {
            split = queries[i].split('=');
            searchObject[split[0]] = split[1];
        }
        return {
            protocol     : parser.protocol,
            host         : parser.host,
            hostname     : parser.hostname,
            port         : parser.port,
            pathname     : parser.pathname,
            search       : parser.search,
            searchObject : searchObject,
            hash         : parser.hash
        }
    },


    // returns true if this is the first time of a user on a page (using localstorage)
    firstTimeOnPage : function(pageName){
        return 'localStorage' in window && window['localStorage'] !== null && !localStorage[pageName + '-first-time'];
    },


    randomString : function(n){
        var s = '';

        while( n-- ){
            s += Math.random().toString(36).substring(7);
        }

        return s;
    },



    queryParams : (function(){
        var queryString = document.location.search.substr(1),
            params = {}, queries, temp, i;

        // Split into key/value pairs
        queries = queryString.split("&");

        // Convert the array of strings into an object
        for ( i = queries.length; i--; ) {
            temp = queries[i].split('=');
            params[temp[0]] = decodeURIComponent(temp[1]);
        }

        return params;
    })(),



    log : function(type, text){
        text  = !text ? type : text;
        text = typeof text  == 'string' ? [text] : text;
        if( !type || !console[type] )
            type = 'log';
        console[type].apply(window, text);
    },

    object : {
        getTopValues : function(obj, n){
            // convert to an Array and sort keys by values
            var props = Object.keys(obj).map(function(key) {
              return { key: key, value: this[key] };
            }, obj);
            props.sort(function(p1, p2) { return p2.value - p1.value; });
            // convert back to Object, returning N top values
            return [props.slice(0, n) ,props.slice(0, n).reduce(function(obj, prop) {
              obj[prop.key] = prop.value;
              return obj;
            }, {})]
        }
    },

    template : {
        minify : function(html){
            return html.replace( new RegExp( "\>[\r\n ]+\<" , "g" ) , "><" );
        }
    },

    string : {
        normalizeContentEditable : function(s){
            if( !s )
                return '';

            return s.trim()
                        .replace(/<br(\s*)\/*>/ig, '\n')
                        .replace(/&nbsp;/ig, ' ')
                        .replace(/<[p|div]\s/ig, '\n$0')
                        .replace(/(<([^>]+)>)/ig,"");
        }
    },


    // get the path of the window trimmed by "/", so only the part needed is extracted
    getPathRoute : function(){
        var path = window.location.pathname.substr(1).split('/');

        return path;
    },


    ////////////////////////////////////////
    // isElementInViewport
    isElementInViewport : function(scope, el, offset){
        offset = offset || 0;

        var rect = el.getBoundingClientRect(),
            scopeRect = scope ? scope[0].getBoundingClientRect() : { top:0, bottom:0, left:0, right:0 },
            test = {
                top    : rect.top - scopeRect.top - offset >= 0,
                left   : rect.left - scopeRect.left >= 0,
                bottom : rect.bottom + offset <= (window.innerHeight || document.documentElement.clientHeight), /*or $(window).height() */
                right  : rect.right - scopeRect.left <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
            }

        return test.top && test.bottom && test.left && test.right;
    },

    isMobile : $(document.documentElement).hasClass('mobile'),
    isTouch : $(document.documentElement).hasClass('touch'),

    support : {
        fullscreen : (function(){
            var docElm = document.documentElement;
            return  'requestFullscreen' in docElm ||
                    'mozRequestFullScreen' in docElm ||
                    'webkitRequestFullScreen' in docElm;
        })()
    },



    toggleFullScreen : function(force){
        console.log(force);
        var docElm = document.documentElement;
        if( force || !document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullscreen) {
                docElm.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
            return true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            return false;
        }
    },



    openPopup : function(url, title, w, h, callback){
          var left      = (screen.width/2)-(w/2),
              top       = (screen.height/2)-(h/2),
              timer     = setInterval(checkWindowClose, 1000),
              newWindow = window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);

        // Puts focus on the newWindow
        if( window.focus )
            newWindow.focus();

        function checkWindowClose(){
            console.log('waiting for popup closing: ', newWindow);
            if( newWindow && newWindow.closed ){
                if( typeof callback == 'function')
                    callback();
                clearInterval(timer);
            }
        }

        setTimeout(function(){
            clearInterval(timer);
        }, 4000 * 60);

        return newWindow;
    },



    matchRoute : function(routes){
        // functions names array
        var args = [].slice.call(arguments).splice(1), // get all the rest of the arguments, if exists
            initDataArr,
            fn, n, found;

        // check if rountes exist, if so, convert them into an Array
        if( routes )
            initDataArr = routes.split(' ');

        // execute each of the page's routes
        for( n in initDataArr ){
            executeFunctionByName.apply(this, [initDataArr[n], ToDoApp.routes].concat(args) );
        }

        function executeFunctionByName(functionName, context /*, args */) {
            var args = [].slice.call(arguments).splice(2),
                namespaces = functionName.split('.'),
                func = namespaces.pop(),
                i = 0;

            // dig inside the context
            for( ; i < namespaces.length; i++ ){
                context = context[namespaces[i]];
            }

            // make sure it's a function and that it exists
            if( context && typeof context[func] == 'function' ){
                found = true;
                return context[func].apply(ToDoApp.routes, args);
            }
        }

        if( !found ){
            console.warn("route wasn't found: ", routes);
        }
        return found;
    },




    checkSignedIn : function(modal){
        var signed = gs_data && gs_data.member.id;
        if( !signed && modal )
            ToDoApp.components.modals.show(modal);

        return !!signed;
    },

    bodyClass : document.body.className.split(' '),

    optimizedEvent : (function() {
        var callbacks = [],
            changed = false,
            running = false;

        // fired on resize event
        function doEvent() {
            if (!running) {
                changed = true;
                loop();
            }
        }

        // resource conscious callback loop
        function loop() {
            if (!changed) {
                running = false;
            }
            else {
                changed = false;
                running = true;

                callbacks.forEach(function(callback) {
                    callback();
                });

                window.requestAnimationFrame(loop);
            }
        }

        // adds callback to loop
        function addCallback(callback) {
            if (callback) {
                callbacks.push(callback);
            }
        }

        return {
            // initalize resize event listener
            init: function(event, callback) {
                if (window.requestAnimationFrame) {
                    window.addEventListener(event, doEvent);
                    addCallback(callback);
                }
            },

            // public method to add additional callback
            add: function(callback) {
                addCallback(callback);
            }
        }
    }()),

    // get data-binded elements from the template
    // DOMscope     - under which node to look for data-binded elements
    // bindMethods  - if there is a control function associated with a data-binded element found, run it
    // DOM          - scope for the "binded" object to be assigned to
    // scope        - where to look for a controller function for a specific data-binded element
    dataBinder : function(DOMscope, bindMethods, DOM, scope){
        // if the "binded" object doesn't exist, create one. it will store all data-binded elements found.
        if( !DOM.binded )
            DOM.binded = {};

        DOMscope.find('[data-bind]').each(function(){
            var elm  = $(this),
                name = elm.data('bind') || this.className.split(' ')[0];

            DOM.binded[name] = elm;
        });

        // Run all binded elements associated update callbacks
        _.each(bindMethods, function(key){
            if( typeof key == 'function' ){
                key.call(this);
            }
        });
    },

    Task : (function(){
        function Task(settings){
            if( !settings.el ) return;

            this.el           = settings.el;
            this.initialValue = this.el.innerHTML|0;
            this.toValue      = this.el.getAttribute('data-to') || settings.toValue;
            this.delta        = this.toValue - this.initialValue;
            this.easing       = settings.easingFunc || function(t){ return t };


            // Do-in settings object
            var doinSettings = {
                step     : this.step.bind(this),
                duration : settings.duration,
                done     : this.done.bind(this)
            };

            if( settings.fps )
               doinSettings.fps = settings.fps;

            // create an instance of Do-in
            this.doin = new Doin(doinSettings);
            this.doin.run();
        }

        Task.prototype.nf = new Intl.NumberFormat();

        // a step of the thing we want to do
        Task.prototype.step = function(t, elapsed){
            // easing
            t = this.easing(t);

            // calculate new value
            var value = this.delta * t + this.initialValue;

            // limit value
            if( t > 0.999 )
                value = this.toValue;

            // print value
            this.el.innerHTML = this.nf.format(value|0);
        }

        // on DONE
        Task.prototype.done = function(){
            // console.log(this.el, 'done counting!');
        }

        return Task;
    })(),

    // An all-purpose AJAX form submit
    ajaxSubmit : function(form){
        var generalAlert = form.querySelector('.generalAlert'),
            $form = $(form);

        // lock form submiting until request is resolved
        if( $form.data('proccesing') )
            return false;

        // Add loading spinner and disable the button until request was resolved
        $form
            .addClass('loading')
            .find('button[type=submit]').prop('disabled', true);

        $.ajax({
            type     : "POST",
            url      : $form[0].action,
            dataType : 'json',
            data     : $form.serialize() // serializes the form's elements.
        })
        .done(onDone)
        .fail(function(){
            $form.removeClass('loading');
            onDone({ success:false, "fields":{ general:"Something went wrong, please try again" } });
        })
        .always(always);

        // set form to "processing" state
        $form.data('proccesing', true);

        /////// response callbacks //////
        function always(){
            $form
                .data('proccesing', false)
                //.removeClass('loading')  // page will refresh anyway
                .find('button[type=submit]').prop('disabled', false);
        }

        function onDone(res){
            if( res.success ){
                $form.removeClass('loading');
            }
            else
                errorsHandler(res.fields);
        }

        function errorsHandler(fields){
            var field, errorMsg;

            // remove loading state on success "false"
            $form.removeClass('loading');

            for( field in fields ){
                if (fields.hasOwnProperty(field)){
                    errorMsg = fields[field];

                    if( field == 'general' && generalAlert)
                        generalAlert.innerHTML = errorMsg;

                    else
                        validator.mark( $( $form[0][field] ) , errorMsg );
                }
            }
        }
    }
}
