////////////////////////////////////
// Main dashboard controller

ToDoApp.routes.ToDo = function(){
    "use strict";

    // Cached page DOM elements
    var DOM = {
        ToDoWrap : $('.ToDoWrap'),
        addList  : $('.addList')
    }

    // page-scope events
    var events = {
        bind : function(){
            DOM.addList.on('click', events.callbacks.addNewList);
            DOM.ToDoWrap.on('click', '.removeList', events.callbacks.removeList)
        },

        callbacks : {
            addNewList : function(){
                var instance = components.ToDo.addList();
                // add that NEW items to the list of ids in localstorage
                components.ToDo.storage.listsIDs.push( instance.settings.id );
                components.ToDo.storage.set();
            },

            removeList : function(){
                var listDOM = $(this).closest('.ToDoComponent'),
                    instance = listDOM.data('component');

                listDOM.removeData('component');

                // remove localStorage traces
                delete window.localStorage['ToDo__' + instance.settings.id];
                components.ToDo.storage.listsIDs = _.without(components.ToDo.storage.listsIDs, instance.settings.id);
                components.ToDo.storage.set();

                // remove the actual DOM node
                instance.DOM.scope.remove();
            }
        }
    }

    // page components
    var components = {
        ToDo : {
            instances : [],

            init : function(){
                var listsIDs = components.ToDo.storage.get();

                for( var i in listsIDs ){
                    components.ToDo.addList( listsIDs[i] );
                }

                if( !components.ToDo.instances.length ){
                    var instance = components.ToDo.addList();
                    // add that NEW items to the list of ids in localstorage
                    components.ToDo.storage.listsIDs.push( instance.settings.id );
                    components.ToDo.storage.set();
                }
            },

            addList : function(id){
                var instance = new ToDoApp.components.ToDo(id ? { id: id } : null);
                components.ToDo.instances.push( instance );
                DOM.ToDoWrap.append( instance.DOM.scope );
                return instance;
            },

            storage : {
                listsIDs : [],
                // list Array of lists
                get : function(){
                    try {
                        components.ToDo.storage.listsIDs = JSON.parse(window.localStorage['ToDo__lists']);
                    }
                    catch(err){}

                    return components.ToDo.storage.listsIDs;
                },

                set : function(){
                    window.localStorage['ToDo__lists'] = JSON.stringify(components.ToDo.storage.listsIDs);
                }
            }
        }
    }

    // load page components
    components.ToDo.init();
    // bind page events
    events.bind();
}