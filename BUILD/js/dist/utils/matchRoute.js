export function matchRoute(routes){
    // functions names array
    var args = [].slice.call(arguments).splice(1), // get all the rest of the arguments, if exists
        initDataArr,
        fn, n, found;

    // check if rountes exist, if so, convert them into an Array
    if( routes )
        initDataArr = routes.split(' ');

    // execute each of the page's routes
    for( n in initDataArr ){
        executeFunctionByName.apply(this, [initDataArr[n], ToDoApp.routes].concat(args) );
    }

    function executeFunctionByName(functionName, context /*, args */) {
        var args = [].slice.call(arguments).splice(2),
            namespaces = functionName.split('.'),
            func = namespaces.pop(),
            i = 0;

        // dig inside the context
        for( ; i < namespaces.length; i++ ){
            context = context[namespaces[i]];
        }

        // make sure it's a function and that it exists
        if( context && typeof context[func] == 'function' ){
            found = true;
            return context[func].apply(ToDoApp.routes, args);
        }
    }

    if( !found ){
        console.warn("route wasn't found: ", routes);
    }
    return found;
}
