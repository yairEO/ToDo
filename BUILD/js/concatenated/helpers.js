 (function($){
    "use strict";


////////////////////////////////////////
// "Support" Testers
    $.support.touch = 'ontouchend' in document;
    $.support.mouse = $(document.documentElement).hasClass('desktop');
    $.support.placeholders = 'placeholder' in document.createElement('input');


    $.fn.svgAddClass = function(className){
        var $elm  = $(this),
            value = $elm.attr('class') || '';
        $elm.attr('class', value + ' ' + className).data('tooltipContent', 'xxx');
        return this;
    }

////////////////////////////////////////
// filterByData

    $.fn.filterByData = function(prop, val){
        var filterFunc;

        if( val )
            filterFunc = function(){ return $(this).data(prop) == val; };
        else
            filterFunc = function(){ return $(this).data(prop); };

        return $(this).filter(filterFunc);
    }


////////////////////////////////////////
// Toggles between 2 classes

    $.fn.toggle2classes = function(class1, class2){
      if( !class1 || !class2 )
        return this;

      return this.each(function(){
        var $elm = $(this);

        if( $elm.hasClass(class1) || $elm.hasClass(class2) )
          $elm.toggleClass(class1 +' '+ class2);

        else
          $elm.addClass(class1);
      });
    };


////////////////////////////////////////
// addTempClass

    $.fn.addTempClass = function(tempClass, duration){
        if( !tempClass )
            return this;

        return this.each(function(){
            var $elm = $(this);

            $elm.addClass(tempClass);
            setTimeout(function(){
                $elm.removeClass(tempClass);
            }, duration || 100);
        });
    };



////////////////////////////////////////
// contentEditable placeholders
    (function(){
        $(document)
            .on('keydown.editable input.editable' , '.editable', onInput)
            .on('paste'                           , '.editable', onPaste)
            .on('focus.editable'                  , '.editable', onFocus)
            .on('blur.editable'                   , '.editable', onFocus);

            function onInput(e){
                var el = $(this);

                if( el.hasClass('singleline') && e.keyCode === 13 )
                    return false;

                if( el.text() )
                    el.addClass('filled');
            }

            function onFocus(){
                if( !ToDoApp.utilities.string.normalizeContentEditable(this.innerHTML).trim() ){
                    this.innerHTML = '';
                    $(this).removeClass('filled');
                }
            }

            function onPaste(e){
                var content;

                e.preventDefault();

                if( e.originalEvent.clipboardData ){
                    content = (e.originalEvent || e).clipboardData.getData('text/plain');
                    document.execCommand('insertText', false, content);
                }
                else if( window.clipboardData ){
                    content = window.clipboardData.getData('Text');
                    var newNode = document.createTextNode(content);

                    if (window.getSelection)
                       window.getSelection().getRangeAt(0).insertNode(newNode);
                }
            }

    })();



///////////////////////////////////////////////////////////////////
// fix for placeholders in old IE
    (function(){
        $.fn.fixPlaceholders = function(){};

        if( $.support.placeholders )
            return;

        var selector = 'input[placeholder], textarea[placeholder]',
            originalType;

        // custom jQuery methods
        $.fn.fixPlaceholders = {
            setOriginalType : function(){
                if( this.tagName == 'INPUT' )
                    this.originalType = this.type || 'text';
            },
            onFocus : function(){
                if( this.originalType )
                    this.type = this.originalType;

                if( this.value == $(this).attr("placeholder") ){
                    if( this.tagName == 'INPUT' )
                    this.value = '';
                }

                $(this).removeClass('empty');
            },
            onBlur : function(){
                if( this.value == "" ){
                    if( this.tagName == 'INPUT' )
                        this.type = 'text';

                    this.value = $(this).addClass('empty').attr("placeholder");
                }
                else
                    $(this).removeClass('empty');
            }
        }

        // bind events
        $(document)
            .on('focus', selector, $.fn.fixPlaceholders.onFocus)
            .on('blur', selector, $.fn.fixPlaceholders.onBlur);

        // scan page for inputs
        $('input[placeholder]').each(function(){
            $.fn.fixPlaceholders.setOriginalType.apply(this);
            $.fn.fixPlaceholders.onBlur.apply(this);
        })
    })();



///////////////////////////////////////////////////////////////////
// Dropdowns

    if( document.documentElement.className.indexOf('touch') != -1 ){
        $(document).on('click.dropdown', '.hasNav', function(){
            $(this).addClass('touch').toggleClass('on');
        });
    }

///////////////////////////////////////////////////////////////////
// Tooltips binding

    /*
    $(document).on('mouseenter.ttip', '.ttip', function(event){
        var $this = $(this),
            data = $this.data(),
            className = 'qtip-1',
            pos = {
                my       : 'top center',  // Position my top left...
                at       : 'bottom center', // at the bottom right of...
                adjust   : { x:0, y:0 },
               // viewport : $(window),
                targe   : $('.component rankMeter')
            },
            contentText = (function(){
                var result;

                if( data.tooltipContent )
                    result = data.tooltipContent;

                else if( data.tooltipPath && $this.find(data.tooltipPath).length )
                    result = $this.find(data.tooltipPath);

                return result;
            })();

        ////////////////////////////
        // semantic variables

        if( data.tooltipPos ){
            var newPos = data.tooltipPos.split(',');

            pos.my = newPos[0] || pos.my;
            pos.at = newPos[1] || pos.at;
        }

        if( data.tooltipOffset ){
            var offset = data.tooltipOffset.split(',');

            pos.adjust.x = offset[0]|0 || pos.adjust.x;
            pos.adjust.y = offset[1]|0 || pos.adjust.y;
        }

        if( data.tooltipClass )
            className += ' ' + data.tooltipClass;


        ////////////////////////////////////////////////////
        // Bind the qTip

        $(this).qtip({
            overwrite: false, // Make sure the tooltip won't be overridden once created
            style: {
                classes: className,
                tip : {
                    width  : 11,
                    height : 11,
                    corner : true
                }
            },
            content: {
                text: contentText
            },
            position: pos,
            show: {
                event: event.type, // Use the same show event as the one that triggered the event handler
                ready: true // Show the tooltip as soon as it's bound, vital so it shows up the first time you hover!
            }
        }, event); // Pass through our original event to qTip
    });
 */

})(jQuery);



////////////////////////////////////////
// requestAnimationFrame polyfil
window.requestAnimationFrame =  window.requestAnimationFrame ||
                                window.webkitRequestAnimationFrame ||
                                // throttle fall-back for unsupported browsers
                                (function(){
                                    var throttle = false,
                                        FPS = 60 / 1000; // time in ms
                                    return function(CB) {
                                        if( throttle ) return;
                                        throttle = true;
                                        setTimeout(function(){ throttle = false; }, FPS);
                                        CB(); // do your thing
                                    }
                                })();



////////////////////////////////////////
// fix iOS mobile keyboard
(function(){
    var targetElem = $('.scrollHeader'),
        $doc       = $(document);

    if( !targetElem.length || !navigator.userAgent.match(/iPhone|iPad|iPod/i) )
        return;

    $doc.on('focus.iOSKeyboardFix', 'input, textarea, .editable', bind);

    function bind(){
        $(window).on('scroll.iOSKeyboardFix', react);
        react();
    }

    function react(){
        /*
        var offsetY = targetElem.offset().top,
            scrollY = $(window).scrollTop(),
            changeY = offsetY - scrollY;

        targetElem.css({'top':'-'+changeY+'px'});
        */
        targetElem[0].style.opacity = 0;

        $doc.on('blur.iOSKeyboardFix', 'input, textarea, .editable', unbind)
            .on('touchend.iOSKeyboardFix', unbind);
    }

    function unbind(){
        targetElem.removeAttr('style');
        document.activeElement.blur();

        $(window).off('scroll.iOSKeyboardFix');
        $doc.off('touchend.iOSKeyboardFix blur.iOSKeyboardFix');
    }
})();

////////////////////////////////////////
// on-screen Logger
function log(message, persistent, single){
    var the_console;

    if( message instanceof Array ){
        message = message.join(', ');
    }
    // We only want a maximum of 15 elements:
    if( $('#console').length )
        the_console = $('#console');
    else
        the_console = $('<div id="console"></div>').appendTo(document.body);


    the_console.click(function(){
        the_console.empty();
    });

    if(the_console.children('.output-message').length == 18){
        // Remove the first one:
        the_console.children('.output-message:not(.persistent)').last().remove();
    }

    var date = new Date(),
    time_string = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds(),
    entry = $('<div class="output-message">\
                   <span class="time">'+time_string+'</span>\
                   <span>'+message+'</span>\
               </div>');


    if(persistent)
        entry.addClass('persistent');

    if( single )
        the_console.html(entry);
    else
        the_console.append(entry);
}

/////////////////////////////////////////////////////////
// helper to know if an element has a class or more

if( !Element.prototype.hasClass ){
    Element.prototype.hasClass = 'classList' in Element.prototype ?
        function(classArr){
            if( this == null || !classArr ) throw new TypeError();
            if( !(classArr instanceof Array) )
                classArr = [classArr];

            for( var i in classArr )
                if( this.classList.contains(classArr[i]) )
                    return true;
            return false;
        } :
        function(classArr){
            if( this == null || !classArr ) throw new TypeError();
            if( !(classArr instanceof Array) )
                    classArr = [classArr];

            for( var i in classArr )
                if( this.className.split(' ').indexOf(classArr[i]) != -1 )
                    return true;
            return false;
        }
}