/* global describe, it, before, expect */
//require('./setup')
import ToDoList from '../../js/dist/components/component.toDo.js';

describe('To-Do', function(){
    beforeEach(function(){
        this.toDo = new ToDoList();
        this.toDo.init();
    });

    it('should add an item to the list', function(){
        ///////////////////////////
        // Preparation code

        var minifier = function(s){
            return s.replace( new RegExp( "\>[\r\n ]+\<" , "g" ) , "><" );
        };

        var item = this.toDo.addItem([{
                        text      : 'aaa',
                        checked   : false,
                        timestamp : '1447685104912'
                    }]);

        var itemTemplate = "<li class='ToDoComponent__item ' data-timestamp='1447685104912'> <label> <input type='checkbox' class='toggleItem' > </label> <span class='ToDoComponent__item__text editable' contenteditable>aaa</span> <button class='ToDoComponent__item__remove' title='Remove item from list'>&times;</button> </li>";

        item = minifier(item).replace(/(\r\n|\n|\r)/gm,"");
        itemTemplate = minifier(itemTemplate);

        ///////////////////////////
        // Test cases

        // when calling "addItem" without parameters, result should be false
        ( this.toDo.addItem() ).should.be.false;
        // when adding empty array, result should be false
        ( this.toDo.addItem([]) ).should.be.false;
        // item html is as should be
        ( item ).should.equal(itemTemplate);
        // expect only 1 item to exist
        expect( this.toDo.items ).to.have.length(1);
        // item object was added to the array list of items
        expect( this.toDo.items[0]).to.eql({ text:"aaa", checked:false, timestamp:"1447685104912" });
        // item was added to the DOM
        ( this.toDo.DOM.ToDoList[0].firstElementChild ).should.exist;
    });



    it('should remove an item from the list', function(){
        ///////////////////////////
        // Preparation code

        // add 1 item
        this.toDo.addItem([{
                            text      : 'aaa',
                            checked   : false,
                            timestamp : '123'
                        }]);

        // remove last added item
        this.toDo.removeItem(0);

        ///////////////////
        // Test cases

        // check if item was removed
        expect(this.toDo.items).to.be.empty;
    });



    it('should mark a list item as "done"', function(){
        ///////////////////////////
        // Preparation code

        this.toDo.addItem([{ text:'aaa', checked:false, timestamp:'123' }]);

        ///////////////////
        // Test cases

        // check if item was marked
        ( this.toDo.markItem(0) ).should.be.false;
        ( this.toDo.markItem(0, '1') ).should.be.false;
        ( this.toDo.markItem(2, true) ).should.be.false;
        ( this.toDo.markItem(null, true) ).should.be.false;

        this.toDo.markItem(0, true);

        expect( this.toDo.getItemByIndex(0).find(':checkbox')[0].checked ).to.be.true;
        expect( this.toDo.items[0].checked ).to.be.true;
    });



    it('should clear all "done" items');



    it('should normalize item input');



    it('should filter by "active"');



    it('should filter by "completed"');



    it('should select all items');
})