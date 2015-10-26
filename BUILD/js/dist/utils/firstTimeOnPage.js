// returns true if this is the first time of a user on a page (using localstorage)
export function firstTimeOnPage(pageName){
    var isFirstTime = 'localStorage' in window && window['localStorage'] !== null && !localStorage[pageName + '-first-time'];

    if( !isFirstTime )
        localStorage[pageName + '-first-time'] = 'visited';

    return isFirstTime;
}