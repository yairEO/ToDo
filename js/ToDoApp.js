(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define('ToDoApp', factory) :
    factory();
}(this, function () { 'use strict';

    // Change all checkboxes in the page to their "default" state
    function defaultCheckboxes() {
        var allInputs = document.querySelectorAll('input');

        // loop on all checkboxes found (trick to iterate on nodeList)
        [].forEach.call(allInputs, function (input) {
            if (input.type == 'checkbox') input.checked = input.defaultChecked;else input.value = input.defaultValue;
        });
    }

    /////////////////////////////////
    // Global cached DOM elements

    var DOM = {
        $HTML: $(document.documentElement),
        $DOC: $(document),
        $WIN: $(window),
        $BODY: $(document.body)
    };

    var Router = {
        routes: [],
        mode: null,
        root: '/',
        config: function config(options) {
            this.mode = options && options.mode && options.mode == 'history' && !!history.pushState ? 'history' : 'hash';
            this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
            return this;
        },
        getFragment: function getFragment() {
            var fragment = '';
            if (this.mode === 'history') {
                fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
                fragment = fragment.replace(/\?(.*)$/, '');
                fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
            } else {
                var match = window.location.href.match(/#(.*)$/);
                fragment = match ? match[1] : '';
            }
            return this.clearSlashes(fragment);
        },
        clearSlashes: function clearSlashes(path) {
            return path.toString().replace(/\/$/, '').replace(/^\//, '');
        },
        add: function add(re, handler) {
            if (typeof re == 'function') {
                handler = re;
                re = '';
            }
            this.routes.push({ re: re, handler: handler });
            return this;
        },
        remove: function remove(param) {
            for (var i = 0, r; i < this.routes.length, r = this.routes[i]; i++) {
                if (r.handler === param || r.re.toString() === param.toString()) {
                    this.routes.splice(i, 1);
                    return this;
                }
            }
            return this;
        },
        flush: function flush() {
            this.routes = [];
            this.mode = null;
            this.root = '/';
            return this;
        },
        check: function check(f) {
            var fragment = f || this.getFragment();
            for (var i = 0; i < this.routes.length; i++) {
                var match = fragment.match(this.routes[i].re);
                if (match) {
                    match.shift();
                    this.routes[i].handler.apply({}, match);
                    return this;
                }
            }
            return this;
        },
        listen: function listen() {
            var self = this;
            var current = self.getFragment();
            var fn = function fn() {
                if (current !== self.getFragment()) {
                    current = self.getFragment();
                    self.check(current);
                }
            };
            clearInterval(this.interval);
            this.interval = setInterval(fn, 50);
            return this;
        },
        navigate: function navigate(path) {
            path = path ? path : '';
            if (this.mode === 'history') {
                history.pushState(null, null, this.root + this.clearSlashes(path));
            } else {
                window.location.href.match(/#(.*)$/);
                window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
            }
            return this;
        }
    };

    // configuration
    Router.config({ mode: 'history' });

    var string = {
        normalizeContentEditable: function normalizeContentEditable(s) {
            if (!s) return '';

            return s.trim().replace(/<br(\s*)\/*>/ig, '\n').replace(/&nbsp;/ig, ' ').replace(/<[p|div]\s/ig, '\n$0').replace(/(<([^>]+)>)/ig, "");
        },

        random: function random(n) {
            var s = '';

            while (n--) {
                s += Math.random().toString(36).substring(7);
            }

            return s;
        }
    };

    // log if any DOM elemtn wasn't cached
    function checkDOMbinding(DOM) {
        for (var i in DOM) {
            if (!DOM[i]) {
                console.log(Function.caller, i, ' - DOM reference empty');
            }
        }
    }

    var list_item = "{{ items.forEach(function(item, i){ }}\r\n<li class='ToDoComponent__item {{= item.checked ? \"completed\" : \"\" }}' data-timestamp='{{= item.timestamp }}'>\r\n    <label>\r\n        <input type='checkbox' class='toggleItem' {{= item.checked ? 'checked' : '' }}>\r\n    </label>\r\n    <span class='ToDoComponent__item__text editable' contenteditable>{{= item.text }}</span>\r\n    <button class='ToDoComponent__item__remove' title='Remove item from list'>&times;</button>\r\n</li>\r\n{{ }); }}";
    var toDo$1 = "<div class='ToDoComponent'>\r\n    <button class='removeList' title='Remove list'>&times;</button>\r\n    <header class='ToDoComponent__header'>\r\n        <label class='selectAllLabel' title='Select all list items'>\r\n            <input type='checkbox' class='selectAll'>\r\n        </label>\r\n        <div class='addToDoItem editable' contenteditable placeholder='Write something...'></div>\r\n    </header>\r\n\r\n    <ul class='ToDoComponent__list'></ul>\r\n\r\n    <footer class='ToDoComponent__footer'>\r\n        <div class='ToDoComponent__items-left' data-items-left='0'>item<span>s</span> left</div>\r\n        <div class='filter'>\r\n            <span data-filter='all' class='active'>All</span>\r\n            <span data-filter='active'>Active</span>\r\n            <span data-filter='completed'>Completed</span>\r\n        </div>\r\n        <button class='clearCompleted'>Clear Completed</button>\r\n    </footer>\r\n</div>";

    // "To-Do list" component controller

    function ToDoList() {
        "use strict"

        // extend default settings
        ;
        var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        this.settings = $.extend(true, { namespace: 'ToDoComponent', id: string.random(1) }, settings);

        this.DOM = {}; // any instance's cached DOM elements will be here
        this.items = [];
    };

    ToDoList.prototype = {
        init: function init() {
            this.templates.component = _.template(toDo$1);
            this.templates.listItem = _.template(list_item);

            // render the component template and jQuerify it
            this.DOM.scope = $(this.templates.component({ id: this.settings.id }));
            this.DOM.scope.data('component', this); // save scope on top DOM node

            this.populateDOM(this.DOM, this.DOM.scope);
            // bind component events
            this.events.bind.call(this, this.DOM);

            // load state (if any was saved)
            this.addItem(this.storage.get.call(this) || []);

            // return component's DOM scope (or whatever is needed to be returned)
            return this.DOM.scope;
        },

        // component's temlpates
        templates: {},

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
            checkDOMbinding(DOM);
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

        onModelChange: function onModelChange() {
            this.storage.set.call(this);
            this.itemsLeftCounter();
        },

        getItemByIndex: function getItemByIndex(idx) {
            return this.DOM.ToDoList.children().eq(idx);
        },

        // adds an item(s)
        addItem: function addItem(items) {
            if (!items || !items.length) return false;

            // add item to state
            this.items = this.items.concat(items);

            // render a single item
            var newItem = this.templates.listItem({ items: items });

            // add rendered item to the list of items
            this.DOM.ToDoList.append(newItem);

            // if for some reasom the "seclect all" checkbox was "checked", "uncheck" it
            this.DOM.selectAll.prop('checked', false);
            this.DOM.scope.addClass('hasItems');

            this.onModelChange();

            return newItem;
        },

        // remove a list item
        removeItem: function removeItem(idx) {
            var that = this;
            this.items.splice(idx, 1);
            this.onModelChange();
            this.removeItemFromDOM(this.getItemByIndex(idx));
        },

        removeItemFromDOM: function removeItemFromDOM(itemToRemove) {
            var that = this;
            itemToRemove.slideUp(200, function () {
                itemToRemove.remove();
                that.listCleanup();
            });
        },

        // marks an item as completed
        markItem: function markItem(idx, state) {
            if (typeof idx == 'undefined' || !this.items[idx] || typeof state != 'boolean') {
                console.warn('parameters are not valid');
                return false;
            }

            // update state
            this.items[idx].checked = state;

            // (un)check the input and toggle a class
            this.getItemByIndex(idx).toggleClass('completed', state).find(':checkbox')[0].checked = state;
            // update model
            this.onModelChange();
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
            this.onModelChange();
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

        filter: function filter(value) {
            var filterBtn = this.DOM.filter.children().filter('[data-filter=' + value + ']');
            filterBtn.addClass('active').siblings().removeClass('active');
            this.DOM.scope.attr('data-filter', value);
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
                            text: string.normalizeContentEditable(input.innerHTML).trim(),
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
                        }if (text) input.innerHTML = text;else this.removeItem(this.getListItem.call(this, input).index());

                        // save state
                        this.items[item.index()].text = text;
                        this.storage.set.call(this);

                        input.blur(); // remove focus
                        return false;
                    }
                },

                removeItem: function removeItem(e) {
                    var item = this.getListItem.call(this, e.target);
                    this.removeItem(item.index());
                },

                toggleItem: function toggleItem(e) {
                    var item = this.getListItem.call(this, e.target);
                    this.markItem(item.index(), e.target.checked);
                },

                toggleAllItems: function toggleAllItems(e) {
                    var that = this;
                    this.DOM.ToDoList.find('.toggleItem').prop('checked', e.target.checked);
                    this.DOM.ToDoList.children().each(function () {
                        that.markItem($(this).index(), e.target.checked);
                    });
                },

                filter: function filter(e) {
                    var value = e.target.dataset.filter;
                    this.filter(value);
                }

            }
        }
    };

    function toDo() {
        "use strict"

        // Cached page DOM elements
        ;
        var DOM = {
            ToDoWrap: $('.ToDoWrap'),
            addList: $('.addList'),
            filter: $('.filter')
        };

        // page-scope events
        var events = {
            bind: function bind() {
                DOM.addList.on('click', events.callbacks.addNewList);
                DOM.ToDoWrap.on('click', '.removeList', events.callbacks.removeList);
                DOM.filter.on('click', 'a', events.callbacks.filter);
            },

            callbacks: {
                addNewList: function addNewList() {
                    var instance = componentsLoader.ToDo.addList();
                    // add that NEW items to the list of ids in localstorage
                    componentsLoader.ToDo.storage.listsIDs.push(instance.settings.id);
                    componentsLoader.ToDo.storage.set();
                },

                removeList: function removeList() {
                    var listDOM = $(this).closest('.ToDoComponent'),
                        instance = listDOM.data('component');

                    listDOM.removeData('component');

                    // remove localStorage traces
                    delete window.localStorage['ToDo__' + instance.settings.id];
                    componentsLoader.ToDo.storage.listsIDs = _.without(componentsLoader.ToDo.storage.listsIDs, instance.settings.id);
                    componentsLoader.ToDo.storage.set();

                    // remove the actual DOM node
                    instance.DOM.scope.remove();
                },

                // filter all lists
                filter: function filter(e) {
                    var value = e.target.dataset.filter;
                    Router.navigate($(this).attr('href'));
                    $(e.target).addClass('active').siblings().removeClass('active');
                    return false;
                }
            }
        };

        // page componentsLoader
        var componentsLoader = {
            ToDo: {
                instances: [],

                init: function init() {
                    var listsIDs = componentsLoader.ToDo.storage.get();

                    for (var i in listsIDs) {
                        componentsLoader.ToDo.addList(listsIDs[i]);
                    }

                    if (!componentsLoader.ToDo.instances.length) {
                        var instance = componentsLoader.ToDo.addList();
                        // add that NEW items to the list of ids in localstorage
                        componentsLoader.ToDo.storage.listsIDs.push(instance.settings.id);
                        componentsLoader.ToDo.storage.set();
                    }
                },

                addList: function addList(id) {
                    var instance = new ToDoList(id ? { id: id } : null);
                    componentsLoader.ToDo.instances.push(instance);
                    // init the instance of a ToDo component
                    instance.init();
                    // add instance DOM template to the page DOM
                    DOM.ToDoWrap.append(instance.DOM.scope);

                    return instance;
                },

                storage: {
                    listsIDs: [],
                    // list Array of lists
                    get: function get() {
                        try {
                            componentsLoader.ToDo.storage.listsIDs = JSON.parse(window.localStorage['ToDo__lists']);
                        } catch (err) {}

                        return componentsLoader.ToDo.storage.listsIDs;
                    },

                    set: function set() {
                        window.localStorage['ToDo__lists'] = JSON.stringify(componentsLoader.ToDo.storage.listsIDs);
                    }
                }
            }
        };

        // load page componentsLoader
        componentsLoader.ToDo.init();
        // bind page events
        events.bind();

        // public
        return {
            components: componentsLoader,
            events: events
        };
    }

    var controllers = Object.freeze({
        toDo: toDo
    });

    (function () {
        $(document).on('keydown.editable input.editable', '.editable', onInput).on('paste', '.editable', onPaste).on('focus.editable', '.editable', onFocus).on('blur.editable', '.editable', onFocus);

        function onInput(e) {
            var el = $(this);

            if (el.hasClass('singleline') && e.keyCode === 13) return false;

            if (el.text()) el.addClass('filled');
        }

        function onFocus() {
            if (!string.normalizeContentEditable(this.innerHTML).trim()) {
                this.innerHTML = '';
                $(this).removeClass('filled');
            }
        }

        function onPaste(e) {
            var content;

            e.preventDefault();

            if (e.originalEvent.clipboardData) {
                content = (e.originalEvent || e).clipboardData.getData('text/plain');
                document.execCommand('insertText', false, content);
            } else if (window.clipboardData) {
                content = window.clipboardData.getData('Text');
                var newNode = document.createTextNode(content);

                if (window.getSelection) window.getSelection().getRangeAt(0).insertNode(newNode);
            }
        }
    })();

    // import * as utils from './utils';

    (function () {
        // development flag,
        //DEV : window.location.hostname == 'localhost';

        var state = {
            controller: null
        };

        function routes() {
            // The first (and default) state of the application will the set as the To-Do controller
            state.controller = controllers['toDo']();

            Router.add(/ToDo\/completed/, function () {
                // filter all lists
                events.callbacks.filterAllLists('completed');
            }).add(/ToDo\/active/, function () {
                events.callbacks.filterAllLists('active');
            }).add(/ToDo/, function () {
                events.callbacks.filterAllLists('all');
            }).add(function () {
                // for unkown routes, navigate back to root
                // Router.navigate('ToDo');
                events.callbacks.filterAllLists('all');
            }).listen(); // listen to url changes

            Router.check(); // check current window url
        }

        // Global app events
        var events = {
            // high-level events binding goes here
            bind: function bind() {
                DOM.$WIN.on('beforeunload', events.callbacks.beforeunload);
            },

            callbacks: {
                beforeunload: function beforeunload() {
                    DOM.$BODY.addClass('loading');
                },

                filterAllLists: function filterAllLists(value) {
                    if (state.controller) state.controller.components.ToDo.instances.forEach(function (instance) {
                        instance.filter(value);
                    });else console.warn('no app state');
                }
            }
        };

        // on page load, before page routes are triggered
        function preRoutes() {
            defaultCheckboxes();
        }

        function init() {
            events.bind();
            preRoutes();
            routes();
        }

        init();
    })();

}));