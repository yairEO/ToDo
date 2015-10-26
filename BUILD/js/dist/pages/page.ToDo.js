import ToDoList from '../components/component.toDo';
import _ from '../vendor/lodash/lodash';
import Router from '../vendor/router';

export function toDo(){
    "use strict";

    // Cached page DOM elements
    var DOM = {
        ToDoWrap : $('.ToDoWrap'),
        addList  : $('.addList'),
        filter   : $('.filter')
    }

    // page-scope events
    var events = {
        bind : function(){
            DOM.addList.on('click', events.callbacks.addNewList);
            DOM.ToDoWrap.on('click', '.removeList', events.callbacks.removeList)
            DOM.filter.on('click', 'a', events.callbacks.filter)
        },

        callbacks : {
            addNewList : function(){
                var instance = componentsLoader.ToDo.addList();
                // add that NEW items to the list of ids in localstorage
                componentsLoader.ToDo.storage.listsIDs.push( instance.settings.id );
                componentsLoader.ToDo.storage.set();
            },

            removeList : function(){
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
            filter : function(e){
                var value = e.target.dataset.filter;
                Router.navigate( $(this).attr('href') );
                $(e.target).addClass('active').siblings().removeClass('active');
                return false;
            }
        }
    }

    // page componentsLoader
    var componentsLoader = {
        ToDo : {
            instances : [],

            init : function(){
                var listsIDs = componentsLoader.ToDo.storage.get();

                for( var i in listsIDs ){
                    componentsLoader.ToDo.addList( listsIDs[i] );
                }

                if( !componentsLoader.ToDo.instances.length ){
                    var instance = componentsLoader.ToDo.addList();
                    // add that NEW items to the list of ids in localstorage
                    componentsLoader.ToDo.storage.listsIDs.push( instance.settings.id );
                    componentsLoader.ToDo.storage.set();
                }
            },

            addList : function(id){
                var instance = new ToDoList(id ? { id: id } : null);
                componentsLoader.ToDo.instances.push( instance );
                DOM.ToDoWrap.append( instance.DOM.scope );
                return instance;
            },

            storage : {
                listsIDs : [],
                // list Array of lists
                get : function(){
                    try {
                        componentsLoader.ToDo.storage.listsIDs = JSON.parse(window.localStorage['ToDo__lists']);
                    }
                    catch(err){}

                    return componentsLoader.ToDo.storage.listsIDs;
                },

                set : function(){
                    window.localStorage['ToDo__lists'] = JSON.stringify(componentsLoader.ToDo.storage.listsIDs);
                }
            }
        }
    }

    // load page componentsLoader
    componentsLoader.ToDo.init();
    // bind page events
    events.bind();

    // public
    return {
        components : componentsLoader
    }
}