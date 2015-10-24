// "To-Do list" component controller

ToDoApp.components.ToDo = function(settings){
    "use strict";

    this.settings = $.extend( true, {namespace:'ToDoComponent', id:0 }, settings ); // extend default settings
    this.DOM = {}; // any instance's cached DOM elements will be here
    this.items = [];
    this.init();
};

ToDoApp.components.ToDo.prototype = {
    init : function(){
        // render the component template and jQuerify it
        this.DOM.scope = $( this.templates.component() );

        this.populateDOM(this.DOM, this.DOM.scope);

        // bind component events
        this.events.bind.call(this, this.DOM);

        // load state (if any was saved)
        this.addItem(this.storage.get.call(this) || []);

        // return component's DOM scope (or whatever is needed to be returned)
        return this.DOM.scope;
    },

    // component's temlpates
    templates : {
        component : ToDoApp.tmpl('toDo'),
        listItem : ToDoApp.tmpl('list-item')
    },

    // populate DOM object
    populateDOM : function(DOM, scope){
        var namespace = '.' + this.settings.namespace +'__';

        DOM.addToDoItem    = scope.find('.addToDoItem');
        DOM.selectAll      = scope.find('.selectAll');
        DOM.ToDoList       = scope.find(namespace + 'list');
        DOM.itemsLeft      = scope.find(namespace + 'items-left');
        DOM.clearCompleted = scope.find('.clearCompleted');
        DOM.selectAll      = scope.find('.selectAll');

        // make sure every DOM node was found
        ToDoApp.utilities.checkDOMbinding(DOM);
    },



    // LocalStorage manager
    storage : {
        set : function(){
            try {
                window.localStorage['ToDo__' + this.settings.id] = JSON.stringify(this.items);
            }
            catch(err){}
        },

        get : function(){
            var s = window.localStorage['ToDo__' + this.settings.id];
            try {
                return JSON.parse(s);
            }
            catch(err){}
        }
    },



    // adds an itel to the bottom of the list
    addItem : function(items){
        if( !items.length ) return;

        // add item to state
        this.items = this.items.concat(items);
        this.storage.set.call(this);

        // render a single item
        var newItem = this.templates.listItem({ items:items });

        // add rendered item to the list of items
        this.DOM.ToDoList.append(newItem);
        this.itemsLeftCounter();

        // if for some reasom the "seclect all" checkbox was "checked", "uncheck" it
        this.DOM.selectAll.prop('checked', false);
        this.DOM.scope.addClass('hasItems');
    },

    // remove a list item
    removeItem : function(itemToRemove){
        var that = this;

        itemToRemove.slideUp(200, function(){
            itemToRemove.remove();
            that.listCleanup();
        });

        // this.items = _.filter(this.items, function(item){
        //     return item.timestamp != itemToRemove.data('timestamp');
        // });

        this.items.splice(itemToRemove.index(), 1);

        console.log( this.items );

        if( this.itemsLeftCounter() == 0 )
            this.DOM.scope.removeClass('hasItems');

        this.storage.set.call(this);
    },

    // marks an item as completed
    markItem : function(item, state){
        item.toggleClass('completed', state);
        this.itemsLeftCounter();

        // update state
        this.items[item.index()].checked = state;
        this.storage.set.call(this);
    },

    clearCompleted : function(){
        var that = this,
            timestamps = [];

        this.DOM.ToDoList.find('.completed').slideUp(200, function(){
            $(this).remove();
            that.listCleanup();
        }).each(function(){
            // fill in all the timestamps which their items are to be removed
            timestamps.push(this.dataset.timestamp);
        });

        // filter only what needs to be left, and save
        this.items = _.filter(this.items, function(item){
            return timestamps.indexOf(item.timestamp + "") == -1;
        });

        this.DOM.selectAll.prop('checked', false);
        this.itemsLeftCounter();
        this.storage.set.call(this);
    },

    // traverse to closest list item from some child element and return it
    getItem : function(child){
        return $(child).closest('.' + this.settings.namespace + '__item');
    },

    itemsLeftCounter : function(){
        var count = _.filter(this.items, function(item){
                        return !item.checked;
                    }).length;

        this.DOM.itemsLeft.attr('data-items-left', count);

        return count;
    },

    // checks if the list has any children, and if not, make sure to remove all child nodes of all types
    listCleanup : function(){
        if( !this.DOM.ToDoList[0].firstElementChild )
            this.DOM.ToDoList[0].innerHTML = '';
    },




    ///////////////////////////////////////////////
    // All component's DOM events & callbacks
    events : {
        bind : function(DOM){
            var that = this;

            DOM.addToDoItem.on('keypress', CB('addItem'));

            DOM.ToDoList.on('keydown blur', '.editable', CB('editItem'))
                        .on('click', 'button', CB('removeItem'))
                        .on('change', '.toggleItem', CB('toggleItem'))

            DOM.selectAll.on('change', CB('toggleAllItems'));
            DOM.clearCompleted.on('click', this.clearCompleted.bind(this));

            // DOM data-binding
            //ToDoApp.utilities.dataBinder.call(this, this.DOM.scope, this.bindMethods, this.DOM);

            function CB(func){
                return that.events.callbacks[func].bind(that);
            }
        },

        callbacks : {
            addItem : function(e){
                var input = e.target;

                // add item if "ENTER" key was pressed without "SHIFT" key
                if( e.keyCode == 13 && !e.shiftKey ){
                    var item = {
                            text      : ToDoApp.utilities.string.normalizeContentEditable(input.innerHTML).trim(),
                            checked   : false,
                            timestamp : new Date().getTime()
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

            editItem : function(e){
                if( e.type == 'focusout' || e.keyCode == 13 && !e.shiftKey ){
                    var input = e.target,
                        text = input.innerHTML;

                    // fix formatting for extra empty lines and spaces
                    for( let i=5; i--;)
                        text = text.trim().replace(/^(&nbsp;)|(&nbsp;)+$/, '').replace(/^(<br>)|(<br>)+$/, '').trim();

                    if( text )
                        input.innerHTML = text;
                    else
                        this.removeItem( this.getItem.call(this, input) );


                    input.blur(); // remove focus
                    return false;
                }
            },

            removeItem : function(e){
                var item = this.getItem.call(this, e.target);
                this.removeItem(item);
            },

            toggleItem : function(e){
                var item = this.getItem.call(this, e.target);
                this.markItem(item, e.target.checked);
            },

            toggleAllItems : function(e){
                var that = this;
                this.DOM.ToDoList.find('.toggleItem').prop('checked', e.target.checked);
                this.DOM.ToDoList.children().each(function(){
                    that.markItem($(this), e.target.checked);
                })
            }

        }
    }
};