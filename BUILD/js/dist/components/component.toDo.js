// "To-Do list" component controller

ToDoApp.components.ToDo = function(settings){
    "use strict";

    this.settings = $.extend(
        {
            namespace : 'ToDoComponent'
        },
        settings
    );
    this.DOM = {}; // any instance's cached DOM elements will be here
    this.init();
};

ToDoApp.components.ToDo.prototype = {
    init : function(){
        // render the component template and jQuerify it
        this.DOM.scope = $( this.templates.component() );

        this.populateDOM(this.DOM, this.DOM.scope);

        // bind component events
        this.events.bind.call(this, this.DOM);

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

        DOM.addToDoItem = scope.find('.addToDoItem');
        DOM.selectAll = scope.find('.selectAll');
        DOM.ToDoList = scope.find(namespace + 'list');
        DOM.itemsLeft = scope.find(namespace + 'items-left');
        DOM.clearCompleted = scope.find('.clearCompleted');
        DOM.selectAll = scope.find('.selectAll');


        // log if any DOM elemtn wasn't cached
        for( var i in DOM ){
            if( !DOM[i].length ){
                console.log( i, ' - DOM reference empty' );
            }
        }
    },


    // adds an itel to the bottom of the list
    addItem : function(text){
        if( !text ) return;

        var templateData = {
            items: [
                {
                    text : text
                }
            ]
        }

        // render a single item
        var newItem = this.templates.listItem(templateData);

        // add rendered item to the list of items
        this.DOM.ToDoList.append(newItem);
        this.itemsLeft();
    },

    // remove a list item
    removeItem : function(item){
        item.slideUp(200, function(){
            item.remove();
        });
        this.itemsLeft();
    },

    // marks an item as completed
    markItem : function(item, state){
        item.toggleClass('completed', state);
        this.itemsLeft();
    },

    clearCompleted : function(){
        this.DOM.ToDoList.find('.completed').slideUp(200, function(){
            $(this).remove();
        });

        // if no items left, clean up DOM
        if( !this.DOM.ToDoList[0].firstChildElement )
            this.DOM.ToDoList[0].innerHTML = '';

        this.DOM.selectAll.prop('checked', false);
        this.itemsLeft();
    },

    // traverse to closest list item from some child element and return it
    getItem : function(child){
        return $(child).closest('.' + this.settings.namespace + '__item');
    },

    itemsLeft : function(){
        var count = this.DOM.ToDoList.children(':not(.completed)').length;
        this.DOM.itemsLeft.attr('data-items-left', count);
        console.log(count);
        return count;
    },

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
                    var text = ToDoApp.utilities.string.normalizeContentEditable(input.innerHTML).trim();
                    this.addItem(text); // add item

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