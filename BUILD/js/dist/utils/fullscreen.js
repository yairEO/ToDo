export var fullscreen = (function(){

    var docElm = document.documentElement;

    function support(){
        return  'requestFullscreen' in docElm ||
                'mozRequestFullScreen' in docElm ||
                'webkitRequestFullScreen' in docElm;
    }

    function toggle(force){
        if( force || !document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullscreen) {
                docElm.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
            return true;
        }
        else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            return false;
        }
    }

    return {
        toggle : toggle,
        support : support
    }
})();