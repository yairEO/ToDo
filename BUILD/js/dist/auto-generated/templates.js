export var list_item = "{{ items.forEach(function(item, i){ }}\r\n<li class='ToDoComponent__item {{= item.checked ? \"completed\" : \"\" }}' data-timestamp='{{= item.timestamp }}'>\r\n    <label>\r\n        <input type='checkbox' class=\"toggleItem\" {{= item.checked ? 'checked' : '' }}>\r\n    </label>\r\n    <span class='ToDoComponent__item__text editable' contenteditable>{{= item.text }}</span>\r\n    <button class='ToDoComponent__item__remove' title='Remove item from list'>&times;</button>\r\n</li>\r\n{{ }); }}";
export var toDo = "<div class='ToDoComponent'>\r\n    <button class='removeList' title='Remove list'>&times;</button>\r\n    <header class='ToDoComponent__header'>\r\n        <label class='selectAllLabel' title='Select all list items'>\r\n            <input type='checkbox' class='selectAll'>\r\n        </label>\r\n        <div class='addToDoItem editable' contenteditable placeholder='Write something...'></div>\r\n    </header>\r\n\r\n    <ul class='ToDoComponent__list'></ul>\r\n\r\n    <footer class='ToDoComponent__footer'>\r\n        <span class='ToDoComponent__items-left' data-items-left='0'>items left</span>\r\n        <div class='filter'>\r\n            <span data-filter='all' class='active'>All</span>\r\n            <span data-filter='active'>Active</span>\r\n            <span data-filter='completed'>Completed</span>\r\n        </div>\r\n        <button class='clearCompleted'>Clear Completed</button>\r\n    </footer>\r\n</div>";
