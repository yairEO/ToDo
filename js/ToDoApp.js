'use strict';

var ToDoApp = {
    /////////////////////////////////
    // Global cached DOM elements
    DOM: {
        $HTML: $(document.documentElement),
        $DOC: $(document),
        $WIN: $(window),
        $BODY: $(document.body)
    },

    // development flag,

    DEV: window.location.hostname == 'localhost',

    components: {},

    templates: {},

    tmpl: function tmpl(s) {
        return _.template(ToDoApp.templates[s + '.html']);
    },

    // any global EMC-scope events binding goes here
    bindEvents: function bindEvents() {
        ToDoApp.DOM.$WIN.on('beforeunload', function () {
            ToDoApp.DOM.$BODY.addClass('loading');
        });
    },

    // on page load, before page routes are triggered
    preRoutes: function preRoutes() {},

    //
    routes: {
        modal: {}, // all website modals controlelrs should be under this scope

        // Execute the page controller of the current page
        initPage: function initPage() {
            var routes = $(document.body).data('init');
            ToDoApp.utilities.matchRoute(routes);
        }
    },

    init: function init() {
        ToDoApp.utilities.defaultCheckbxoes(); // Default back every checkbox and input on the page which might have changed by the user

        // if social connect is neeed, toggle it
        // ToDoApp.connect();

        ToDoApp.bindEvents();
        ToDoApp.preRoutes();
        ToDoApp.routes.initPage();
    }
};

ToDoApp.templates = {
    "list-item.html": "{{ items.forEach(function(item, i){ }}\r\n<li class='ToDoComponent__item'>\r\n    <label>\r\n        <input type='checkbox' class=\"toggleItem\" {{= item.checked ? 'checked' : '' }}>\r\n    </label>\r\n    <span class='ToDoComponent__item__text editable' contenteditable>{{= item.text }}</span>\r\n    <button class='ToDoComponent__item__remove' title='Remove item from list'>&times;</button>\r\n</li>\r\n{{ }); }}",
    "toDo.html": "<div class='ToDoComponent' spellcheck='false'>\r\n    <header class='ToDoComponent__header'>\r\n        <label title='Select all list items'>\r\n            <input type='checkbox' class='selectAll'>\r\n        </label>\r\n        <div class='addToDoItem editable' contenteditable placeholder='Write something to add to the list'></div>\r\n    </header>\r\n\r\n    <input type='radio' name='ToDoComponent-togglegroup' hidden id='toggle__ToDoComponent-show-all' checked>\r\n    <input type='radio' name='ToDoComponent-togglegroup' hidden id='toggle__ToDoComponent-show-active'>\r\n    <input type='radio' name='ToDoComponent-togglegroup' hidden id='toggle__ToDoComponent-show-completed'>\r\n\r\n    <ul class='ToDoComponent__list'></ul>\r\n\r\n    <footer class='ToDoComponent__footer'>\r\n        <span class='ToDoComponent__items-left' data-items-left='0'>items left</span>\r\n        <div class='filter radio'>\r\n            <label for='toggle__ToDoComponent-show-all'>All</label>\r\n            <label for='toggle__ToDoComponent-show-active'>Active</label>\r\n            <label for='toggle__ToDoComponent-show-completed'>Completed</label>\r\n        </div>\r\n        <button class='clearCompleted'>Clear Completed</button>\r\n    </footer>\r\n</div>"
};
////////////////////////////////////////////////////////
// social network login manager

ToDoApp.connect = function () {
    "use strict";

    ////////////////////////////////////////////
    var logout = function logout(e) {
        e.preventDefault();
        // check if connected with Facebook
        // ga('send', 'event', 'connection', 'signout');
        dataLayer.push({ 'event': 'connection logout' });

        if (FB.getAccessToken()) FB.logout(logoutRedirect);else if (gapi.auth2.getAuthInstance().isSignedIn.get()) google.signOut();else logoutRedirect();

        function logoutRedirect() {
            window.location = "/auth/signout";
        }
    };

    ////////////////////////////////
    // FACEBOOK
    var facebook = (function () {
        // if( typeof appData == 'undefined' || !appData.fb_app_id ){
        //     console.warn('no appData or missing "fb_app_id"');
        //     return;
        // }
        //  Configuration
        var appID = '1069832376361647',
            deffered;

        // Load the SDK asynchronously
        (function (d, s, id) {
            var js,
                fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        })(document, 'script', 'facebook-jssdk');

        window.fbAsyncInit = function () {
            FB.init({
                appId: appID,
                cookie: true, // enable cookies to allow the server to access // the session
                xfbml: false, // parse social plugins on this page
                version: 'v2.4'
            });
            FB.getLoginStatus(FBLoginStatus);
            FB.Event.subscribe('auth.authResponseChange', FBLoginStatus);
        };

        function FBLoginStatus(response) {
            if (APP.utilities.checkSignedIn() || deffered && deffered.state() != 'resolved') return;

            // if user refused to connect
            APP.DOM.$DOC.trigger('connection', ['facebook', response]);
            // The response object is returned with a status field that lets the
            // app know the current login status of the person.
            // Full docs on the response object can be found in the documentation
            // for FB.getLoginStatus().
            if (response.status === 'connected') {
                // Logged into your app and Facebook.
                //connected(response);
                deffered = $.ajax({
                    url: '/auth/facebook',
                    type: 'POST',
                    dataType: 'json',
                    success: function success(res) {
                        APP.DOM.$DOC.trigger('login', [null, res]);
                    }
                });
            } else if (response.status === 'not_authorized') {
                // The person is logged into Facebook, but not your app.
            } else {
                    // The person is not logged into Facebook, so we're not sure if
                    // they are logged into this app or not.
                }
        };

        function checkLoginState() {
            FB.getLoginStatus(function (response) {
                FBLoginStatus(response);
            });
        }

        function connected(res) {
            console.log('FACEBOOK CONENCTED');
            /*
            FB.api('/me', function(response){
            });
            */
        }

        return {
            login: function login() {
                // fix iOS Chrome
                if (navigator.userAgent.match('CriOS')) window.open('https://www.facebook.com/dialog/oauth?client_id=' + appID + '&redirect_uri=' + document.location.href + '&scope=email,public_profile,user_friends', '', null);else FB.login(null, { scope: 'email,public_profile' });
            },
            logout: function logout() {
                FB.logout();
            }
        };
    })();

    ////////////////////////////////
    // GOOGLE

    var google = (function () {
        var auth2;

        // window.___gcfg = {
        //     parsetags: 'onload'
        //  };

        (function (w) {
            if (!(w.gapi && w.gapi._pl)) {
                var d = w.document;
                var po = d.createElement('script');po.type = 'text/javascript';po.async = true;
                po.src = 'https://apis.google.com/js/platform.js?onload=gapi_init';
                var s = d.getElementsByTagName('script')[0];s.parentNode.insertBefore(po, s);
            }
        })(window);

        window.gapi_init = function () {
            gapi.load('auth2', function () {
                // Retrieve the singleton for the GoogleAuth library and set up the client.
                auth2 = gapi.auth2.init({
                    client_id: '32120075756-ikt9bfcbm934q2tk8gu4o4etrf6690u3.apps.googleusercontent.com',
                    cookiepolicy: 'single_host_origin'
                });
            });
        };

        // Request scopes in addition to 'profile' and 'email'
        //scope      : 'additional_scope'
        function signin() {
            //GoogleAuth
            var promise = auth2.signIn().then(function () {
                console.log(arguments);
            });
        }

        function onSignIn(googleUser) {
            var profile = googleUser.getBasicProfile();
            console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
            console.log('Name: ' + profile.getName());
            console.log('Image URL: ' + profile.getImageUrl());
            console.log('Email: ' + profile.getEmail());
        }

        function signOut() {
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
                console.log('User signed out.');
            });
        }

        return {
            login: signin,
            logout: signOut
        };
    })();

    ////////////////////////////
    // bind connect buttons
    $('.fbConnectBtn').click(facebook.login);
    $('.googleConnectBtn').click(google.login);

    ////////////////////////////
    // public methods
    ToDoApp.connect = {
        logout: logout,
        facebook: facebook,
        google: google
    };
};
////////////////////////////////////////////////////////
// Any global configuration

ToDoApp.config = (function () {
    "use strict";

    // Configure underscore's template engine
    _.templateSettings = {
        interpolate: /\{\{\=(.+?)\}\}/g,
        escape: /\{\{\-(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g
    };

    return {};
})();
/////////////////////////////////////////
//////// Utility functions (which might be handy)

ToDoApp.utilities = {
    isOldIE: document.all && !window.atob,

    getPrefixed: function getPrefixed(prop) {
        var i,
            s = document.createElement('p').style,
            v = ['ms', 'O', 'Moz', 'Webkit'];
        if (s[prop] == '') return prop;
        prop = prop.charAt(0).toUpperCase() + prop.slice(1);
        for (i = v.length; i--;) if (s[v[i] + prop] == '') return v[i] + prop;
    },

    // responsive url filtering and formating
    largeImageUrlFilter: function largeImageUrlFilter(url) {
        if (window.screen.availWidth < 500) url = url.replace('/3_', '/2_');

        return url;
    },

    defaultCheckbxoes: function defaultCheckbxoes() {
        var allInputs = document.querySelectorAll('input');

        // loop on all checkboxes found (trick to iterate on nodeList)
        [].forEach.call(allInputs, function (input) {
            if (input.type == 'checkbox') input.checked = input.defaultChecked;else input.value = input.defaultValue;
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
    URIparse: function URIparse(url) {
        if (!url) {
            console.warn('URL is underfined. using current one');
            url = window.location.href;
        }

        var parser = document.createElement('a'),
            searchObject = {},
            queries,
            split,
            i;

        // Let the browser do the work
        parser.href = url;

        // Convert query string to object
        queries = parser.search.replace(/^\?/, '').split('&');

        for (i = 0; i < queries.length; i++) {
            split = queries[i].split('=');
            searchObject[split[0]] = split[1];
        }
        return {
            protocol: parser.protocol,
            host: parser.host,
            hostname: parser.hostname,
            port: parser.port,
            pathname: parser.pathname,
            search: parser.search,
            searchObject: searchObject,
            hash: parser.hash
        };
    },

    // returns true if this is the first time of a user on a page (using localstorage)
    firstTimeOnPage: function firstTimeOnPage(pageName) {
        return 'localStorage' in window && window['localStorage'] !== null && !localStorage[pageName + '-first-time'];
    },

    randomString: function randomString(n) {
        var s = '';

        while (n--) {
            s += Math.random().toString(36).substring(7);
        }

        return s;
    },

    queryParams: (function () {
        var queryString = document.location.search.substr(1),
            params = {},
            queries,
            temp,
            i;

        // Split into key/value pairs
        queries = queryString.split("&");

        // Convert the array of strings into an object
        for (i = queries.length; i--;) {
            temp = queries[i].split('=');
            params[temp[0]] = decodeURIComponent(temp[1]);
        }

        return params;
    })(),

    log: function log(type, text) {
        text = !text ? type : text;
        text = typeof text == 'string' ? [text] : text;
        if (!type || !console[type]) type = 'log';
        console[type].apply(window, text);
    },

    object: {
        getTopValues: function getTopValues(obj, n) {
            // convert to an Array and sort keys by values
            var props = Object.keys(obj).map(function (key) {
                return { key: key, value: this[key] };
            }, obj);
            props.sort(function (p1, p2) {
                return p2.value - p1.value;
            });
            // convert back to Object, returning N top values
            return [props.slice(0, n), props.slice(0, n).reduce(function (obj, prop) {
                obj[prop.key] = prop.value;
                return obj;
            }, {})];
        }
    },

    template: {
        minify: function minify(html) {
            return html.replace(new RegExp("\>[\r\n ]+\<", "g"), "><");
        }
    },

    string: {
        normalizeContentEditable: function normalizeContentEditable(s) {
            if (!s) return '';

            return s.trim().replace(/<br(\s*)\/*>/ig, '\n').replace(/&nbsp;/ig, ' ').replace(/<[p|div]\s/ig, '\n$0').replace(/(<([^>]+)>)/ig, "");
        }
    },

    // get the path of the window trimmed by "/", so only the part needed is extracted
    getPathRoute: function getPathRoute() {
        var path = window.location.pathname.substr(1).split('/');

        return path;
    },

    ////////////////////////////////////////
    // isElementInViewport
    isElementInViewport: function isElementInViewport(scope, el, offset) {
        offset = offset || 0;

        var rect = el.getBoundingClientRect(),
            scopeRect = scope ? scope[0].getBoundingClientRect() : { top: 0, bottom: 0, left: 0, right: 0 },
            test = {
            top: rect.top - scopeRect.top - offset >= 0,
            left: rect.left - scopeRect.left >= 0,
            bottom: rect.bottom + offset <= (window.innerHeight || document.documentElement.clientHeight), /*or $(window).height() */
            right: rect.right - scopeRect.left <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
        };

        return test.top && test.bottom && test.left && test.right;
    },

    isMobile: $(document.documentElement).hasClass('mobile'),
    isTouch: $(document.documentElement).hasClass('touch'),

    support: {
        fullscreen: (function () {
            var docElm = document.documentElement;
            return 'requestFullscreen' in docElm || 'mozRequestFullScreen' in docElm || 'webkitRequestFullScreen' in docElm;
        })()
    },

    toggleFullScreen: function toggleFullScreen(force) {
        console.log(force);
        var docElm = document.documentElement;
        if (force || !document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            // current working methods
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

    openPopup: function openPopup(url, title, w, h, callback) {
        var left = screen.width / 2 - w / 2,
            top = screen.height / 2 - h / 2,
            timer = setInterval(checkWindowClose, 1000),
            newWindow = window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

        // Puts focus on the newWindow
        if (window.focus) newWindow.focus();

        function checkWindowClose() {
            console.log('waiting for popup closing: ', newWindow);
            if (newWindow && newWindow.closed) {
                if (typeof callback == 'function') callback();
                clearInterval(timer);
            }
        }

        setTimeout(function () {
            clearInterval(timer);
        }, 4000 * 60);

        return newWindow;
    },

    matchRoute: function matchRoute(routes) {
        // functions names array
        var args = [].slice.call(arguments).splice(1),
            // get all the rest of the arguments, if exists
        initDataArr,
            fn,
            n,
            found;

        // check if rountes exist, if so, convert them into an Array
        if (routes) initDataArr = routes.split(' ');

        // execute each of the page's routes
        for (n in initDataArr) {
            executeFunctionByName.apply(this, [initDataArr[n], ToDoApp.routes].concat(args));
        }

        function executeFunctionByName(functionName, context /*, args */) {
            var args = [].slice.call(arguments).splice(2),
                namespaces = functionName.split('.'),
                func = namespaces.pop(),
                i = 0;

            // dig inside the context
            for (; i < namespaces.length; i++) {
                context = context[namespaces[i]];
            }

            // make sure it's a function and that it exists
            if (context && typeof context[func] == 'function') {
                found = true;
                return context[func].apply(ToDoApp.routes, args);
            }
        }

        if (!found) {
            console.warn("route wasn't found: ", routes);
        }
        return found;
    },

    checkSignedIn: function checkSignedIn(modal) {
        var signed = gs_data && gs_data.member.id;
        if (!signed && modal) ToDoApp.components.modals.show(modal);

        return !!signed;
    },

    bodyClass: document.body.className.split(' '),

    optimizedEvent: (function () {
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
            } else {
                changed = false;
                running = true;

                callbacks.forEach(function (callback) {
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
            init: function init(event, callback) {
                if (window.requestAnimationFrame) {
                    window.addEventListener(event, doEvent);
                    addCallback(callback);
                }
            },

            // public method to add additional callback
            add: function add(callback) {
                addCallback(callback);
            }
        };
    })(),

    // get data-binded elements from the template
    // DOMscope     - under which node to look for data-binded elements
    // bindMethods  - if there is a control function associated with a data-binded element found, run it
    // DOM          - scope for the "binded" object to be assigned to
    // scope        - where to look for a controller function for a specific data-binded element
    dataBinder: function dataBinder(DOMscope, bindMethods, DOM, scope) {
        // if the "binded" object doesn't exist, create one. it will store all data-binded elements found.
        if (!DOM.binded) DOM.binded = {};

        DOMscope.find('[data-bind]').each(function () {
            var elm = $(this),
                name = elm.data('bind') || this.className.split(' ')[0];

            DOM.binded[name] = elm;
        });

        // Run all binded elements associated update callbacks
        _.each(bindMethods, function (key) {
            if (typeof key == 'function') {
                key.call(this);
            }
        });
    },

    Task: (function () {
        function Task(settings) {
            if (!settings.el) return;

            this.el = settings.el;
            this.initialValue = this.el.innerHTML | 0;
            this.toValue = this.el.getAttribute('data-to') || settings.toValue;
            this.delta = this.toValue - this.initialValue;
            this.easing = settings.easingFunc || function (t) {
                return t;
            };

            // Do-in settings object
            var doinSettings = {
                step: this.step.bind(this),
                duration: settings.duration,
                done: this.done.bind(this)
            };

            if (settings.fps) doinSettings.fps = settings.fps;

            // create an instance of Do-in
            this.doin = new Doin(doinSettings);
            this.doin.run();
        }

        Task.prototype.nf = new Intl.NumberFormat();

        // a step of the thing we want to do
        Task.prototype.step = function (t, elapsed) {
            // easing
            t = this.easing(t);

            // calculate new value
            var value = this.delta * t + this.initialValue;

            // limit value
            if (t > 0.999) value = this.toValue;

            // print value
            this.el.innerHTML = this.nf.format(value | 0);
        };

        // on DONE
        Task.prototype.done = function () {
            // console.log(this.el, 'done counting!');
        };

        return Task;
    })(),

    // An all-purpose AJAX form submit
    ajaxSubmit: function ajaxSubmit(form) {
        var generalAlert = form.querySelector('.generalAlert'),
            $form = $(form);

        // lock form submiting until request is resolved
        if ($form.data('proccesing')) return false;

        // Add loading spinner and disable the button until request was resolved
        $form.addClass('loading').find('button[type=submit]').prop('disabled', true);

        $.ajax({
            type: "POST",
            url: $form[0].action,
            dataType: 'json',
            data: $form.serialize() // serializes the form's elements.
        }).done(onDone).fail(function () {
            $form.removeClass('loading');
            onDone({ success: false, "fields": { general: "Something went wrong, please try again" } });
        }).always(always);

        // set form to "processing" state
        $form.data('proccesing', true);

        /////// response callbacks //////
        function always() {
            $form.data('proccesing', false)
            //.removeClass('loading')  // page will refresh anyway
            .find('button[type=submit]').prop('disabled', false);
        }

        function onDone(res) {
            if (res.success) {
                $form.removeClass('loading');
            } else errorsHandler(res.fields);
        }

        function errorsHandler(fields) {
            var field, errorMsg;

            // remove loading state on success "false"
            $form.removeClass('loading');

            for (field in fields) {
                if (fields.hasOwnProperty(field)) {
                    errorMsg = fields[field];

                    if (field == 'general' && generalAlert) generalAlert.innerHTML = errorMsg;else validator.mark($($form[0][field]), errorMsg);
                }
            }
        }
    }
};

////////////////////////////////
//Modals cnotroller (manage how modal windows are shown/closed and handles their data)

ToDoApp.modals = (function () {
    "use strict";

    var state = {
        history: [], // history of all opened modals, until modal is completly closed.
        modalIsOpened: false // false OR the current modal's ID
    };

    /////////////////////////////
    // SET UP & PREPARE MODAL
    var modalHTML = "<div id='modal'> \
                        <div class='wrap'> \
                            <div class='content'> \
                                <a class='close' title='Close'>&times;</a> \
                            </div> \
                        </div> \
                    </div>",
        closeTimeout,
        modal = $(modalHTML),
        modalTemplate = modal.clone(),
        modals = $('<div>'),
        // an empty element that will contain all the HTML from the modals ajax request
    pageClass = ''; // if exists and needed for this modal

    // inject modal's container
    ToDoApp.DOM.$BODY.prepend(modal);

    /////////////////////////////
    // SHOW MODAL
    function show(pageName, modalData) {
        clearTimeout(closeTimeout);

        var template = ToDoApp.templates['modals\\' + pageName];
        // check if required modal even exists in the templates
        if (!template && pageName != 'lastModal') return;

        console.log('>>> modal name:', pageName, ', data:', modalData); // debugging
        dataLayer.push({ 'event': 'Modal dialog', 'action': 'open', 'label': pageName }); // anlytics

        // Don't load the same modal again if it's already on-screen
        if (!pageName || state.modalIsOpened == pageName) return;

        // is there wasn't any last modal to show from the history object
        if (pageName == 'lastModal' && state.history.length < 2) {
            close();
            return false;
        }

        // cleanup must come AFTER last DOM was saved (if that had happened)
        cleanup(true);

        if (pageName == 'lastModal') {
            pageName = restoreLastModal();
        } else if (state.modalIsOpened && existInHistory(pageName)) {
            // TODO:
            // Check if the modal which is requested is saved in the history. if so, restore it
        } else newModal(pageName, template, modalData);

        modal[0].className = pageName + ' show ' + pageClass;

        // if the body element has changed, and the modal isn't there anymore, inject it again
        if (!$('#modal').length) ToDoApp.DOM.$BODY.append(modal);

        state.modalIsOpened = pageName;

        // saves the modal (that was rendered) in the history
        if (pageName != 'lastModal' && state.modalIsOpened) saveModal(pageName, modalData);

        setFormFocus();

        return modal;
    }

    // Sets focus if has a form
    function setFormFocus() {
        var shouldFocus = modal.find('form:first').find('[autofocus]');
        if (shouldFocus.length) shouldFocus[0].focus();
    }

    // checks if a modal exists in the history cache and loads it
    function existInHistory(pageName) {
        return state.history.some(function (item, i) {
            var key = _.keys(item)[0];
            if (key == pageName) {
                modal.find('.content').append(item[pageName].content);
                if (item[pageName].outside) modal.find('.wrap').append(item[pageName].outside);
                return true;
            }
        });
    }

    // saves the LAST modal before loading the current one.
    // save histroy state ONLY for modals which trigger other modals, and might come back to the originated one
    // it's very important to save the state of the modal JUST before it is changing to another one
    function saveModal(pageName, modalData) {
        // save history of the current modal, just before changing to the next one.
        var obj = {
            name: pageName,
            // reference the current modal's view to memory
            content: modal.find('.content').find('> div'),
            outside: modal.find('.outside'),
            // save the current modal class name (if has one)
            extraClass: pageClass,
            modalData: $.extend({}, modalData)
        };

        state.history.push(obj);

        // limit history to 2 items
        // state.history.slice(-2);
    }

    // gets the `index` for which to store a modal from the `History` object
    function restoreLastModal() {
        var restored, pageName;

        state.history.pop();

        // load the last modal
        restored = state.history.pop();

        // append the DOM of the last modal
        // ** MUST BE CLEANED UP PRIOR TO APPENDING IT **
        modal.find('.content').append(restored.content);
        pageClass = restored.extraClass;

        // returns the page name of the restored modal
        return restored.name;
    }

    function newModal(pageName, template, modalData) {
        var wrap = modal.find('.wrap'),
            content = modal.find('.content'),
            compiledTemplate,
            renderedTemplate,
            $tmpl,
            outsideContent,
            initData;

        // Compile template into text
        compiledTemplate = _.template(template, modalData || {});
        // render compiled template text into a DOM node
        renderedTemplate = $.parseHTML(compiledTemplate)[0];
        // convert it to a jQuery object
        $tmpl = $(renderedTemplate);

        pageClass = $tmpl[0].className || '';

        // if there are things that needs to be outside of the WRAP container
        outsideContent = $tmpl.find('.outside');
        if (outsideContent.length) wrap.append(outsideContent);

        content.append($tmpl);

        ///////////////// ROUTES ///////////////////////////////
        // call the route for this modal, if exist
        initData = $tmpl.data('init');

        if (initData) {
            modal.addClass('loading');
            ToDoApp.utilities.matchRoute(initData + '.init', modalData || {});
        }

        afterRoute();
    }

    function afterRoute() {
        // scan page for inputs for IE9
        if (!$.support.placeholders) modal.find('input[placeholder]').each(function () {
            $.fn.fixPlaceholders.setOriginalType.apply(this);
            $.fn.fixPlaceholders.onBlur.apply(this);
        });
    }

    /////////////////////////////
    // CLEANUP
    function cleanup(soft) {
        pageClass = '';
        // "soft" cleanup when changing modals from one to another
        if (soft) {
            modal.find('.close').siblings().detach();
            modal.find('.content').siblings().detach(); // clean "outside" injected content
        } else {
                modal.removeClass('show hide').html(modalTemplate.html());
                state.history.length = 0; // cleanup
            }

        // Call the last modal window (if exists) "destroy" method
        var modalController = ToDoApp.routes.modal[state.modalIsOpened];

        // if this modal has a "destroy" method, to cleanup after it
        if (modalController && modalController.destroy) modalController.destroy();
    }

    function onKeyDown(e) {
        var code = e.keyCode;

        // Prevent default keyboard action (like navigating inside the page)
        if (code == 27) close();
    }

    /////////////////////////////
    // CLOSE MODAL PROCEDURE
    function close(param) {
        if (state.modalIsOpened) {
            var modalController = ToDoApp.routes.modal[state.modalIsOpened];
            state.modalIsOpened = false;

            // if this modal has a "destroy" method, to cleanup after it
            if (modalController && modalController.destroy) modalController.destroy();

            if (!param) modal.addClass('hide');

            // if this modal has a "destroy" method, to cleanup after it
            if (modalController && modalController.destroy) modalController.destroy();

            // if 'lastModal' then do not close the mocal, but only remove elements
            if (param == 'lastModal') {
                cleanup(true);
            } else if (param == 'fast') cleanup();else {
                // cleanup is delayed roughly until the modal was hidden
                closeTimeout = setTimeout(cleanup, 250);
            }

            // dataLayer.push({'event': 'Modal dialog', 'action':'close', 'label':pageName }); // anlytics
        }
    }

    // AJAX submits a form according to it's ACTION attribute
    function submitForm(e) {
        // don't submit the form normally
        e.preventDefault();

        var $form = $(this),
            $generalAlert = $form.find('.generalAlert');

        $generalAlert.empty();

        // validate before submiting to the server
        // you can put your own custom validations below

        // check all the rerquired fields
        if (!validator.checkAll(this)) return false;

        ajaxSubmit($form);
    }

    function ajaxSubmit($form) {
        var $generalAlert = $form.find('.generalAlert');

        // lock form submiting until request is resolved
        if ($form.data('proccesing')) return false;

        // Add loading spinner and disable the button until request was resolved
        $form.addClass('loading').find('button[type=submit]').prop('disabled', true);

        $.ajax({
            type: "POST",
            url: $form[0].action,
            dataType: 'json',
            data: $form.serialize() // serializes the form's elements.
        }).done(onDone).fail(function () {
            $form.removeClass('loading');
            onDone({ success: false, "fields": { general: "Something went wrong, please try again" } });
        }).always(always);

        // set form to "processing" state
        $form.data('proccesing', true);

        /////// response callbacks //////
        function always() {
            $form.data('proccesing', false)
            //.removeClass('loading')  // page will refresh anyway
            .find('button[type=submit]').prop('disabled', false);
        }

        function onDone(res) {
            if (res.success) {
                $form.removeClass('loading');

                var firstModal = state.history.length > 1 ? state.history[0].name : null;

                // save the first modal to browser's localStorage, so it could be shown after page refresh
                if (firstModal) {
                    localStorage['restoreModalData'] = JSON.stringify(state.history[0].modalData);
                }

                ToDoApp.DOM.$DOC.trigger(state.modalIsOpened, [firstModal, res]).trigger('modalSubmit', [state.modalIsOpened, res]);
                /*
                if( $form.res('refresh') )
                   window.location.reload(false);
                */
            } else errorsHandler(res.fields);
        }

        function errorsHandler(fields) {
            var field, errorMsg;

            // remove loading state on success "false"
            $form.removeClass('loading');

            for (field in fields) {
                if (fields.hasOwnProperty(field)) {
                    errorMsg = fields[field];

                    if (field == 'general') $generalAlert.text(errorMsg);else validator.mark($($form[0][field]), errorMsg);
                }
            }
        }
    }

    /////////////////////////////
    // EVENTS CALLBACKS
    function click_close(e) {
        var target = $(e.currentTarget);

        if ((target.parents('.content').length || target.hasClass('content')) && !target.hasClass('close')) return true;

        close();
    }

    function click_show() {
        // the triggering link might have some data on it
        var modalData = $(this).data('modaldata'),
            pageName = $(this).data('modal');

        console.log(pageName, modalData);
        show(pageName, modalData);
    }

    /////////////////////////////
    // EVENTS

    ToDoApp.DOM.$DOC.on('click.modal', 'a[data-modal], button[data-modal]', click_show).on('keydown.closeModal', onKeyDown);

    modal
    //.on('click', click_close)
    .on('click', '.close', click_close).on('submit', 'form', submitForm);

    ///////////////////////////////////////////////////////////////////////////////////////
    // check if any modal is required to load from the from "hash" or "search" params

    (function () {
        var hashName = window.location.hash.split('#')[1],
            searchQuery = window.location.search.split('?')[1],
            lookForModal = hashName || searchQuery || null;

        if (lookForModal) {
            // direct to login modal (if needed)

            if (lookForModal == 'signin') show('login');else if (lookForModal == 'signup') show('signup');else if (lookForModal == 'submit' && localStorage['restoreModalData']) {
                var modalData = JSON.parse(localStorage['restoreModalData']);
                delete localStorage['restoreModalData'];
                show(lookForModal, modalData);
            }
            // if modal exists
            else if (ToDoApp.templates['modals\\' + lookForModal]) {
                    // take the call outside of the time scope, to have enough time for "ToDoApp.components.modals" to be available for the popups controllers
                    setTimeout(function () {
                        show(lookForModal);
                    }, 0);
                } else {
                    return;
                }

            // clear hash
            var yScroll = ToDoApp.utilities.window.scrollY;

            if (hashName) window.location.hash = '';

            window.scroll(0, yScroll);
        }
    })();

    // Expose
    return {
        modal: modal,
        state: state,
        show: show,
        close: close
    };
})();
// "To-Do list" component controller

ToDoApp.components.ToDo = function (settings) {
    "use strict";

    this.settings = $.extend({
        namespace: 'ToDoComponent'
    }, settings);
    this.DOM = {}; // any instance's cached DOM elements will be here
    this.init();
};

ToDoApp.components.ToDo.prototype = {
    init: function init() {
        // render the component template and jQuerify it
        this.DOM.scope = $(this.templates.component());

        this.populateDOM(this.DOM, this.DOM.scope);

        // bind component events
        this.events.bind.call(this, this.DOM);

        // return component's DOM scope (or whatever is needed to be returned)
        return this.DOM.scope;
    },

    // component's temlpates
    templates: {
        component: ToDoApp.tmpl('toDo'),
        listItem: ToDoApp.tmpl('list-item')
    },

    // populate DOM object
    populateDOM: function populateDOM(DOM, scope) {
        var namespace = '.' + this.settings.namespace + '__';

        DOM.addToDoItem = scope.find('.addToDoItem');
        DOM.selectAll = scope.find('.selectAll');
        DOM.ToDoList = scope.find(namespace + 'list');
        DOM.itemsLeft = scope.find(namespace + 'items-left');
        DOM.clearCompleted = scope.find('.clearCompleted');
        DOM.selectAll = scope.find('.selectAll');

        // log if any DOM elemtn wasn't cached
        for (var i in DOM) {
            if (!DOM[i].length) {
                console.log(i, ' - DOM reference empty');
            }
        }
    },

    // adds an itel to the bottom of the list
    addItem: function addItem(text) {
        if (!text) return;

        var templateData = {
            items: [{
                text: text
            }]
        };

        // render a single item
        var newItem = this.templates.listItem(templateData);

        // add rendered item to the list of items
        this.DOM.ToDoList.append(newItem);
        this.itemsLeft();
        this.DOM.selectAll.prop('checked', false);
    },

    // remove a list item
    removeItem: function removeItem(item) {
        item.slideUp(200, function () {
            item.remove();
        });
        this.itemsLeft();
    },

    // marks an item as completed
    markItem: function markItem(item, state) {
        item.toggleClass('completed', state);
        this.itemsLeft();
    },

    clearCompleted: function clearCompleted() {
        this.DOM.ToDoList.find('.completed').slideUp(200, function () {
            $(this).remove();
        });

        // if no items left, clean up DOM
        if (!this.DOM.ToDoList[0].firstChildElement) this.DOM.ToDoList[0].innerHTML = '';

        this.DOM.selectAll.prop('checked', false);
        this.itemsLeft();
    },

    // traverse to closest list item from some child element and return it
    getItem: function getItem(child) {
        return $(child).closest('.' + this.settings.namespace + '__item');
    },

    itemsLeft: function itemsLeft() {
        var count = this.DOM.ToDoList.children(':not(.completed)').length;
        this.DOM.itemsLeft.attr('data-items-left', count);
        console.log(count);
        return count;
    },

    // All component's DOM events & callbacks
    events: {
        bind: function bind(DOM) {
            var that = this;

            DOM.addToDoItem.on('keypress', CB('addItem'));

            DOM.ToDoList.on('keydown blur', '.editable', CB('editItem')).on('click', 'button', CB('removeItem')).on('change', '.toggleItem', CB('toggleItem'));

            DOM.selectAll.on('change', CB('toggleAllItems'));
            DOM.clearCompleted.on('click', this.clearCompleted.bind(this));

            // DOM data-binding
            //ToDoApp.utilities.dataBinder.call(this, this.DOM.scope, this.bindMethods, this.DOM);

            function CB(func) {
                return that.events.callbacks[func].bind(that);
            }
        },

        callbacks: {
            addItem: function addItem(e) {
                var input = e.target;

                // add item if "ENTER" key was pressed without "SHIFT" key
                if (e.keyCode == 13 && !e.shiftKey) {
                    var text = ToDoApp.utilities.string.normalizeContentEditable(input.innerHTML).trim();
                    this.addItem(text); // add item

                    // clean up
                    input.innerHTML = '';
                    input.classList.remove('filled');

                    // input.blur(); // remove focus
                    return false;
                }
            },

            editItem: function editItem(e) {
                if (e.type == 'focusout' || e.keyCode == 13 && !e.shiftKey) {
                    var input = e.target,
                        text = input.innerHTML;

                    // fix formatting for extra empty lines and spaces
                    for (var i = 5; i--;) {
                        text = text.trim().replace(/^(&nbsp;)|(&nbsp;)+$/, '').replace(/^(<br>)|(<br>)+$/, '').trim();
                    }if (text) input.innerHTML = text;else this.removeItem(this.getItem.call(this, input));

                    input.blur(); // remove focus
                    return false;
                }
            },

            removeItem: function removeItem(e) {
                var item = this.getItem.call(this, e.target);
                this.removeItem(item);
            },

            toggleItem: function toggleItem(e) {
                var item = this.getItem.call(this, e.target);
                this.markItem(item, e.target.checked);
            },

            toggleAllItems: function toggleAllItems(e) {
                var that = this;
                this.DOM.ToDoList.find('.toggleItem').prop('checked', e.target.checked);
                this.DOM.ToDoList.children().each(function () {
                    that.markItem($(this), e.target.checked);
                });
            }

        }
    }
};
////////////////////////////////////
// Main dashboard controller

ToDoApp.routes.ToDo = function () {
    "use strict";

    // Cached page DOM elements
    var DOM = {
        ToDoComponent: $('.ToDoComponent')
    };

    // components this page is using
    var components = {
        toDo: new ToDoApp.components.ToDo()
    };

    // replace page's components placeholders with real components
    DOM.ToDoComponent.replaceWith(components.toDo.DOM.scope);
    DOM.ToDoComponent = $('.ToDoComponent');

    // setup "follwer" lpugin for sorting buttons (cool effect)
    DOM.ToDoComponent.find('.filter').follower({ start: 0, selector: 'label', snap: true });
};
ToDoApp.init();
//# sourceMappingURL=ToDoApp.js.map
