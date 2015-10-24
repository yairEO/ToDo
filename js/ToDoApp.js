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

    events: {
        // any high-level events binding goes here
        bind: function bind() {
            ToDoApp.DOM.$WIN.on('beforeunload', ToDoApp.events.callbacks.beforeunload);
        },

        callbacks: {
            beforeunload: function beforeunload() {
                ToDoApp.DOM.$BODY.addClass('loading');
            }
        }
    },

    // on page load, before page routes are triggered
    preRoutes: function preRoutes() {
        ToDoApp.utilities.defaultCheckbxoes(); // Default back every checkbox and input on the page which might have changed by the user
    },

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
        // if social connect is neeed, toggle it
        // ToDoApp.connect();

        ToDoApp.events.bind();
        ToDoApp.preRoutes();
        ToDoApp.routes.initPage();
    }
};

ToDoApp.templates = {
    "list-item.html": "{{ items.forEach(function(item, i){ }}\r\n<li class='ToDoComponent__item {{= item.checked ? \"completed\" : \"\" }}' data-timestamp='{{= item.timestamp }}'>\r\n    <label>\r\n        <input type='checkbox' class=\"toggleItem\" {{= item.checked ? 'checked' : '' }}>\r\n    </label>\r\n    <span class='ToDoComponent__item__text editable' contenteditable>{{= item.text }}</span>\r\n    <button class='ToDoComponent__item__remove' title='Remove item from list'>&times;</button>\r\n</li>\r\n{{ }); }}",
    "toDo.html": "<div class='ToDoComponent'>\r\n    <button class='removeList' title='Remove list'>&times;</button>\r\n    <header class='ToDoComponent__header'>\r\n        <label class='selectAllLabel' title='Select all list items'>\r\n            <input type='checkbox' class='selectAll'>\r\n        </label>\r\n        <div class='addToDoItem editable' contenteditable placeholder='Write something...'></div>\r\n    </header>\r\n\r\n    <ul class='ToDoComponent__list'></ul>\r\n\r\n    <footer class='ToDoComponent__footer'>\r\n        <span class='ToDoComponent__items-left' data-items-left='0'>items left</span>\r\n        <div class='filter radio'>\r\n            <span data-filter='all' class='active'>All</span>\r\n            <span data-filter='active'>Active</span>\r\n            <span data-filter='completed'>Completed</span>\r\n        </div>\r\n        <button class='clearCompleted'>Clear Completed</button>\r\n    </footer>\r\n</div>"
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

    // log if any DOM elemtn wasn't cached
    checkDOMbinding: function checkDOMbinding(DOM) {
        for (var i in DOM) {
            if (!DOM[i]) {
                console.log(Function.caller, i, ' - DOM reference empty');
            }
        }
    },

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

// "To-Do list" component controller

ToDoApp.components.ToDo = function (settings) {
    "use strict";

    this.settings = $.extend(true, { namespace: 'ToDoComponent', id: 0 }, settings); // extend default settings
    this.DOM = {}; // any instance's cached DOM elements will be here
    this.items = [];
    this.init();
};

ToDoApp.components.ToDo.prototype = {
    init: function init() {
        // render the component template and jQuerify it
        this.DOM.scope = $(this.templates.component({ id: this.settings.id }));

        this.populateDOM(this.DOM, this.DOM.scope);

        // bind component events
        this.events.bind.call(this, this.DOM);

        // load state (if any was saved)
        this.addItem(this.storage.get.call(this) || []);

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
        DOM.filter = scope.find('.filter');

        // make sure every DOM node was found
        ToDoApp.utilities.checkDOMbinding(DOM);
    },

    // LocalStorage manager
    storage: {
        set: function set() {
            try {
                window.localStorage['ToDo__' + this.settings.id] = JSON.stringify(this.items);
            } catch (err) {}
        },

        get: function get() {
            var s = window.localStorage['ToDo__' + this.settings.id];
            try {
                return JSON.parse(s);
            } catch (err) {}
        }
    },

    // adds an itel to the bottom of the list
    addItem: function addItem(items) {
        if (!items.length) return;

        // add item to state
        this.items = this.items.concat(items);
        this.storage.set.call(this);

        // render a single item
        var newItem = this.templates.listItem({ items: items });

        // add rendered item to the list of items
        this.DOM.ToDoList.append(newItem);
        this.itemsLeftCounter();

        // if for some reasom the "seclect all" checkbox was "checked", "uncheck" it
        this.DOM.selectAll.prop('checked', false);
        this.DOM.scope.addClass('hasItems');
    },

    // remove a list item
    removeItem: function removeItem(itemToRemove) {
        var that = this;

        itemToRemove.slideUp(200, function () {
            itemToRemove.remove();
            that.listCleanup();
        });

        // this.items = _.filter(this.items, function(item){
        //     return item.timestamp != itemToRemove.data('timestamp');
        // });

        this.items.splice(itemToRemove.index(), 1);
        this.itemsLeftCounter();

        this.storage.set.call(this);
    },

    // marks an item as completed
    markItem: function markItem(item, state) {
        item.toggleClass('completed', state);
        this.itemsLeftCounter();

        // update state
        this.items[item.index()].checked = state;
        this.storage.set.call(this);
    },

    clearCompleted: function clearCompleted() {
        var that = this,
            timestamps = [];

        this.DOM.ToDoList.find('.completed').slideUp(200, function () {
            $(this).remove();
            that.listCleanup();
        }).each(function () {
            // fill in all the timestamps which their items are to be removed
            timestamps.push(this.dataset.timestamp);
        });

        // filter only what needs to be left, and save
        this.items = _.filter(this.items, function (item) {
            return timestamps.indexOf(item.timestamp + "") == -1;
        });

        this.DOM.selectAll.prop('checked', false);
        this.itemsLeftCounter();

        this.storage.set.call(this);
    },

    // traverse to closest list item from some child element and return it
    getListItem: function getListItem(child) {
        return $(child).closest('.' + this.settings.namespace + '__item');
    },

    itemsLeftCounter: function itemsLeftCounter() {
        var count = _.filter(this.items, function (item) {
            return !item.checked;
        }).length;

        this.DOM.itemsLeft.attr('data-items-left', count);

        if (!count) this.DOM.scope.removeClass('hasItems');

        return count;
    },

    // checks if the list has any children, and if not, make sure to remove all child nodes of all types
    listCleanup: function listCleanup() {
        if (!this.DOM.ToDoList[0].firstElementChild) this.DOM.ToDoList[0].innerHTML = '';
    },

    ///////////////////////////////////////////////
    // All component's DOM events & callbacks
    events: {
        bind: function bind(DOM) {
            var that = this;

            DOM.addToDoItem.on('keypress', CB('addItem'));

            DOM.ToDoList.on('keydown blur', '.editable', CB('editItem')).on('click', 'button', CB('removeItem')).on('change', '.toggleItem', CB('toggleItem'));

            DOM.selectAll.on('change', CB('toggleAllItems'));
            DOM.filter.on('click', 'span', CB('filter'));
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
                    var item = {
                        text: ToDoApp.utilities.string.normalizeContentEditable(input.innerHTML).trim(),
                        checked: false,
                        timestamp: new Date().getTime()
                    };

                    // add item
                    this.addItem([item]);

                    // clean up
                    input.innerHTML = '';
                    input.classList.remove('filled');

                    // input.blur(); // remove focus
                    return false;
                }
            },

            editItem: function editItem(e) {
                if (e.type == 'focusout' || e.keyCode == 13 && !e.shiftKey) {
                    var item = this.getListItem.call(this, e.target),
                        input = e.target,
                        text = input.innerHTML;

                    // fix formatting for extra empty lines and spaces
                    for (var i = 5; i--;) {
                        text = text.trim().replace(/^(&nbsp;)|(&nbsp;)+$/, '').replace(/^(<br>)|(<br>)+$/, '').trim();
                    }if (text) input.innerHTML = text;else this.removeItem(this.getListItem.call(this, input));

                    // save state
                    this.items[item.index()].text = text;
                    this.storage.set.call(this);

                    input.blur(); // remove focus
                    return false;
                }
            },

            removeItem: function removeItem(e) {
                var item = this.getListItem.call(this, e.target);
                this.removeItem(item);
            },

            toggleItem: function toggleItem(e) {
                var item = this.getListItem.call(this, e.target);
                this.markItem(item, e.target.checked);
            },

            toggleAllItems: function toggleAllItems(e) {
                var that = this;
                this.DOM.ToDoList.find('.toggleItem').prop('checked', e.target.checked);
                this.DOM.ToDoList.children().each(function () {
                    that.markItem($(this), e.target.checked);
                });
            },

            filter: function filter(e) {
                this.DOM.scope.attr('data-filter', e.target.dataset.filter);
                $(e.target).addClass('active').siblings().removeClass('active');
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
        ToDoWrap: $('.ToDoWrap'),
        addList: $('.addList')
    };

    var events = {
        bind: function bind() {
            DOM.addList.on('click', events.callbacks.addNewList);
            DOM.ToDoWrap.on('click', '.removeList', events.callbacks.removeList);
        },
        callbacks: {
            addNewList: function addNewList() {
                components.ToDo.addList();
            },

            removeList: function removeList() {}
        }
    };

    // components this page is using
    var components = {
        ToDo: {
            instances: [],

            init: function init() {
                for (var i in window.localStorage) {
                    if (i.indexOf('ToDo__') != -1) {
                        components.ToDo.addList();
                    }
                }

                if (!components.ToDo.instances.length) {
                    components.ToDo.addList();
                }
            },

            addList: function addList() {
                var instance = new ToDoApp.components.ToDo({ id: components.ToDo.instances.length });
                components.ToDo.instances.push(instance);
                DOM.ToDoWrap.append(instance.DOM.scope);
            }
        }
    };

    // load page components
    components.ToDo.init();
    events.bind();

    // setup "follwer" lpugin for sorting buttons (cool effect)
    // DOM.ToDoComponent = $('.ToDoComponent');
    // DOM.ToDoComponent.find('.filter').follower({ start:0, selector:'label', snap:true });
};
ToDoApp.init();
//# sourceMappingURL=ToDoApp.js.map
