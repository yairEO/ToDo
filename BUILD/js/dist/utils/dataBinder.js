// get data-binded elements from the template
// DOMscope     - under which node to look for data-binded elements
// bindMethods  - if there is a control function associated with a data-binded element found, run it
// DOM          - scope for the "binded" object to be assigned to
// scope        - where to look for a controller function for a specific data-binded element
export function dataBinder(DOMscope, bindMethods, DOM, scope){
    // if the "binded" object doesn't exist, create one. it will store all data-binded elements found.
    if( !DOM.binded )
        DOM.binded = {};

    DOMscope.find('[data-bind]').each(function(){
        var elm  = $(this),
            name = elm.data('bind') || this.className.split(' ')[0];

        DOM.binded[name] = elm;
    });

    // Run all binded elements associated update callbacks
    _.each(bindMethods, function(key){
        if( typeof key == 'function' ){
            key.call(this);
        }
    });
}