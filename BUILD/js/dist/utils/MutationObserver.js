export default (function(){
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    // pass and element to watch DOM changes at
    return function(elm, cb){
        if( !elm || !cb ){
            console.warn('no element was passed');
            return;
        }

        var observer = new MutationObserver( cb );

        // define what element should be observed by the observer
        // and what types of mutations trigger the callback
        observer.observe(elm, {
            subtree    : true,
            attributes : true
        });
    }
})();