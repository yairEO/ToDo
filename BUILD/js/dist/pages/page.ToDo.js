////////////////////////////////////
// Main dashboard controller

ToDoApp.routes.ToDo = function(){
    "use strict";

    // Cached page DOM elements
    var DOM = {
        ToDoWrap : $('.ToDoWrap'),
        addList  : $('.addList')
    }

    var events = {
        bind : function(){
            DOM.addList.on('click', events.callbacks.addNewList);
            DOM.ToDoWrap.on('click', '.removeList', events.callbacks.removeList);
        },
        callbacks : {
            addNewList : function(){
                components.ToDo.addList();
            },

            removeList : function(){

            }
        }
    }

    // components this page is using
    var components = {
        ToDo : {
            instances : [],

            init : function(){
                for( var i in window.localStorage ){
                    if( i.indexOf('ToDo__') != -1 ){
                        components.ToDo.addList();
                    }
                }

                if( !components.ToDo.instances.length ){
                    components.ToDo.addList();
                }
            },

            addList : function(){
                var instance = new ToDoApp.components.ToDo({ id: components.ToDo.instances.length });
                components.ToDo.instances.push( instance );
                DOM.ToDoWrap.append( instance.DOM.scope );
            }
        }
    }

    // load page components
    components.ToDo.init();
    events.bind();

    // setup "follwer" lpugin for sorting buttons (cool effect)
    // DOM.ToDoComponent = $('.ToDoComponent');
    // DOM.ToDoComponent.find('.filter').follower({ start:0, selector:'label', snap:true });
}