export function popup(url, title, w, h, callback){
    var   left      = (screen.width/2)-(w/2),
          top       = (screen.height/2)-(h/2),
          timer     = setInterval(checkWindowClose, 1000),
          newWindow = window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);

    // Puts focus on the newWindow
    if( window.focus )
        newWindow.focus();

    function checkWindowClose(){
        console.log('waiting for popup closing: ', newWindow);
        if( newWindow && newWindow.closed ){
            if( typeof callback == 'function')
                callback();
            clearInterval(timer);
        }
    }

    setTimeout(function(){
        clearInterval(timer);
    }, 4000 * 60);

    return newWindow;
}