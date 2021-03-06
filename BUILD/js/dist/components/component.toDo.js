import string from '../utils/string';
import checkDOMbinding from '../utils/checkDOMbinding';
import * as templates from '../auto-generated/templates';


// "To-Do list" component controller

export default function ToDoList(settings = {}){
    "use strict";

    // extend default settings
    this.settings = $.extend(
                    true,
                    { namespace:'ToDoComponent', id:string.random(1) }
                    , settings );

    this.DOM = {}; // any instance's cached DOM elements will be here
    this.items = [];
};

ToDoList.prototype = {
    init : function(){
        this.templates.component = _.template(templates.toDo);
        this.templates.listItem  = _.template(templates.list_item);


        // render the component template and jQuerify it
        this.DOM.scope = $( this.templates.component({ id : this.settings.id}) );
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
    templates : {},

    // populate DOM object
    populateDOM : function(DOM, scope){
        var namespace = '.' + this.settings.namespace +'__';

        DOM.addToDoItem    = scope.find('.addToDoItem');
        DOM.selectAll      = scope.find('.selectAll');
        DOM.ToDoList       = scope.find(namespace + 'list');
        DOM.itemsLeft      = scope.find(namespace + 'items-left');
        DOM.clearCompleted = scope.find('.clearCompleted');
        DOM.selectAll      = scope.find('.selectAll');
        DOM.filter         = scope.find('.filter');

        // make sure every DOM node was found
        checkDOMbinding(DOM);
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

    onModelChange : function(){
        this.storage.set.call(this);
        this.itemsLeftCounter();
    },

    getItemByIndex : function(idx){
        return this.DOM.ToDoList.children().eq(idx);
    },

    // adds an item(s)
    addItem : function(items){
        if( !items || !items.length ) return false;

        // add item to state
        this.items = this.items.concat(items);

        // render a single item
        var newItem = this.templates.listItem({ items:items });

        // add rendered item to the list of items
        this.DOM.ToDoList.append(newItem);

        // if for some reasom the "seclect all" checkbox was "checked", "uncheck" it
        this.DOM.selectAll.prop('checked', false);
        this.DOM.scope.addClass('hasItems');

        this.onModelChange();

        return newItem;
    },

    // remove a list item
    removeItem : function(idx){
        var that = this;
        this.items.splice(idx, 1);
        this.onModelChange();
        this.removeItemFromDOM( this.getItemByIndex(idx) );
    },

    removeItemFromDOM : function(itemToRemove){
        var that = this;
        itemToRemove.slideUp(200, function(){
            itemToRemove.remove();
            that.listCleanup();
        });
    },

    // marks an item as completed
    markItem : function(idx, state){
        if( typeof idx == 'undefined' || !this.items[idx] || typeof state != 'boolean' ){
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
        this.onModelChange();
    },

    // traverse to closest list item from some child element and return it
    getListItem : function(child){
        return $(child).closest('.' + this.settings.namespace + '__item');
    },

    itemsLeftCounter : function(){
        var count = _.filter(this.items, function(item){
                        return !item.checked;
                    }).length;

        this.DOM.itemsLeft.attr('data-items-left', count);

        if( !count )
            this.DOM.scope.removeClass('hasItems');

        return count;
    },

    // checks if the list has any children, and if not, make sure to remove all child nodes of all types
    listCleanup : function(){
        if( !this.DOM.ToDoList[0].firstElementChild )
            this.DOM.ToDoList[0].innerHTML = '';
    },


    filter : function(value){
        var filterBtn = this.DOM.filter.children().filter('[data-filter='+ value+']');
        filterBtn.addClass('active').siblings().removeClass('active');
        this.DOM.scope.attr('data-filter', value);
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
            DOM.filter.on('click', 'span', CB('filter'));
            DOM.clearCompleted.on('click', this.clearCompleted.bind(this));


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
                            text      : string.normalizeContentEditable(input.innerHTML).trim(),
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
                    var item = this.getListItem.call(this, e.target),
                        input = e.target,
                        text = input.innerHTML;

                    // fix formatting for extra empty lines and spaces
                    for( var i=5; i--;)
                        text = text.trim().replace(/^(&nbsp;)|(&nbsp;)+$/, '').replace(/^(<br>)|(<br>)+$/, '').trim();

                    if( text )
                        input.innerHTML = text;
                    else
                        this.removeItem( this.getListItem.call(this, input).index() );


                    // save state
                    this.items[item.index()].text = text;
                    this.storage.set.call(this);


                    input.blur(); // remove focus
                    return false;
                }
            },

            removeItem : function(e){
                var item = this.getListItem.call(this, e.target);
                this.removeItem( item.index() );
            },

            toggleItem : function(e){
                var item = this.getListItem.call(this, e.target);
                this.markItem(item.index(), e.target.checked);
            },

            toggleAllItems : function(e){
                var that = this;
                this.DOM.ToDoList.find('.toggleItem').prop('checked', e.target.checked);
                this.DOM.ToDoList.children().each(function(){
                    that.markItem( $(this).index(), e.target.checked );
                })
            },

            filter : function(e){
                var value = e.target.dataset.filter;
                this.filter(value);
            }

        }
    }
};