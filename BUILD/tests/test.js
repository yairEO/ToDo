(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}(this, function () { 'use strict';

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
                void 0;
            }
        }
    }

    var list_item = "{{ items.forEach(function(item, i){ }}\r\n<li class='ToDoComponent__item {{= item.checked ? \"completed\" : \"\" }}' data-timestamp='{{= item.timestamp }}'>\r\n    <label>\r\n        <input type='checkbox' class='toggleItem' {{= item.checked ? 'checked' : '' }}>\r\n    </label>\r\n    <span class='ToDoComponent__item__text editable' contenteditable>{{= item.text }}</span>\r\n    <button class='ToDoComponent__item__remove' title='Remove item from list'>&times;</button>\r\n</li>\r\n{{ }); }}";
    var toDo = "<div class='ToDoComponent'>\r\n    <button class='removeList' title='Remove list'>&times;</button>\r\n    <header class='ToDoComponent__header'>\r\n        <label class='selectAllLabel' title='Select all list items'>\r\n            <input type='checkbox' class='selectAll'>\r\n        </label>\r\n        <div class='addToDoItem editable' contenteditable placeholder='Write something...'></div>\r\n    </header>\r\n\r\n    <ul class='ToDoComponent__list'></ul>\r\n\r\n    <footer class='ToDoComponent__footer'>\r\n        <div class='ToDoComponent__items-left' data-items-left='0'>item<span>s</span> left</div>\r\n        <div class='filter'>\r\n            <span data-filter='all' class='active'>All</span>\r\n            <span data-filter='active'>Active</span>\r\n            <span data-filter='completed'>Completed</span>\r\n        </div>\r\n        <button class='clearCompleted'>Clear Completed</button>\r\n    </footer>\r\n</div>";

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
            this.templates.component = _.template(toDo);
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
                void 0;
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

    describe('To-Do', function () {
        beforeEach(function () {
            this.toDo = new ToDoList();
            this.toDo.init();
        });

        it('should add an item to the list', function () {
            ///////////////////////////
            // Preparation code

            var minifier = function minifier(s) {
                return s.replace(new RegExp("\>[\r\n ]+\<", "g"), "><");
            };

            var item = this.toDo.addItem([{
                text: 'aaa',
                checked: false,
                timestamp: '1447685104912'
            }]);

            var itemTemplate = "<li class='ToDoComponent__item ' data-timestamp='1447685104912'> <label> <input type='checkbox' class='toggleItem' > </label> <span class='ToDoComponent__item__text editable' contenteditable>aaa</span> <button class='ToDoComponent__item__remove' title='Remove item from list'>&times;</button> </li>";

            item = minifier(item).replace(/(\r\n|\n|\r)/gm, "");
            itemTemplate = minifier(itemTemplate);

            ///////////////////////////
            // Test cases

            // when calling "addItem" without parameters, result should be false
            this.toDo.addItem().should.be.false;
            // when adding empty array, result should be false
            this.toDo.addItem([]).should.be.false;
            // item html is as should be
            item.should.equal(itemTemplate);
            // expect only 1 item to exist
            expect(this.toDo.items).to.have.length(1);
            // item object was added to the array list of items
            expect(this.toDo.items[0]).to.eql({ text: "aaa", checked: false, timestamp: "1447685104912" });
            // item was added to the DOM
            this.toDo.DOM.ToDoList[0].firstElementChild.should.exist;
        });

        it('should remove an item from the list', function () {
            ///////////////////////////
            // Preparation code

            // add 1 item
            this.toDo.addItem([{
                text: 'aaa',
                checked: false,
                timestamp: '123'
            }]);

            // remove last added item
            this.toDo.removeItem(0);

            ///////////////////
            // Test cases

            // check if item was removed
            expect(this.toDo.items).to.be.empty;
        });

        it('should mark a list item as "done"', function () {
            ///////////////////////////
            // Preparation code

            this.toDo.addItem([{ text: 'aaa', checked: false, timestamp: '123' }]);

            ///////////////////
            // Test cases

            // check if item was marked
            this.toDo.markItem(0).should.be.false;
            this.toDo.markItem(0, '1').should.be.false;
            this.toDo.markItem(2, true).should.be.false;
            this.toDo.markItem(null, true).should.be.false;

            this.toDo.markItem(0, true);

            expect(this.toDo.getItemByIndex(0).find(':checkbox')[0].checked).to.be.true;
            expect(this.toDo.items[0].checked).to.be.true;
        });

        it('should clear all "done" items');

        it('should normalize item input');

        it('should filter by "active"');

        it('should filter by "completed"');

        it('should select all items');
    });

}));