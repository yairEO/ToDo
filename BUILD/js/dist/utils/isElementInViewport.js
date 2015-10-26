export function isElementInViewport(scope, el, offset){
    offset = offset || 0;

    var rect = el.getBoundingClientRect(),
        scopeRect = scope ? scope[0].getBoundingClientRect() : { top:0, bottom:0, left:0, right:0 },
        test = {
            top    : rect.top - scopeRect.top - offset >= 0,
            left   : rect.left - scopeRect.left >= 0,
            bottom : rect.bottom + offset <= (window.innerHeight || document.documentElement.clientHeight), /*or $(window).height() */
            right  : rect.right - scopeRect.left <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
        }

    return test.top && test.bottom && test.left && test.right;
}