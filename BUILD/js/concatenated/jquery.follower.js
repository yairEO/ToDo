////////////////////////////////////////
// jQuery Follower (for menu items)
;(function ($) {
    $.fn.follower = function(settings){
        var timer    = null,
            start    = settings.start,
            snapBack = settings.snap,
            selector = settings.selector;

        return this.each(function(){
            var $el = $(this),
                follower;

            if( typeof start == 'string' )
               start = $el.find(selector).index( $(start) );

            if( !$el.find(selector).length ){
                console.warn('follower selector not found');
                return false;
            }


            // don't bind if already binded
            if( $el.data('_follower') )
                return false;

            follower = new Follower($el, settings);

            if( $el.hasClass('radio') ){
                var activeButton = $el.find(selector).eq(start);
                activeButton.find('input').prop('checked', true);

                follower.set.call(activeButton);

                $el.on('change.follower', 'input', function(e){
                    if( snapBack === true )
                        console.log(1);
                    else
                        snapBack = $el.find('input').index(this);
                    if( settings.clickOnly )
                        follower.move( $(this).parent() );
                })
            }

            // Event binding

            if( !settings.clickOnly )
                $el.on('mouseenter.follower', selector, function(e){
                    follower.move( $(e.currentTarget) );
                })

            $el.on('click.follower', selector, follower.set );

            // make the first menu item selected by default
            follower.move( $el.find(selector).eq(start) );

            // if there is a default snap back to an item on mouse leave
            if( snapBack != null ){
                if( snapBack === true ){
                    $el.on('mouseleave.follower', selector, function(e){
                        $el.find(selector).filter('.active').trigger('mouseenter.follower');
                    })
                }
                else{
                    if( typeof snapBack == 'string' )
                        snapBack = $el.find(selector).index( $(snapBack) );
                    if( snapBack < 0 ) return;

                    $el.on('mouseleave.follower', selector, function(e){
                        $el.find(selector).eq(snapBack).trigger('mouseenter.follower');
                    })
                }
            }

            $el.data('_follower', follower);
        });
    }

    /////////////////////////////
    // Factory

    function Follower($el, settings){
        this.el        = $el;
        this.timer     = 0;
        this.selector  = settings.selector;
        this.snapBack  = settings.snap;
        this.indicator = $('<span>').css('left', $el.find(this.selector).eq(settings.start).position().left ).appendTo(this.el)[0];
    }

    Follower.prototype = {
        set : function(e){
            $(this).addClass('active').siblings().removeClass('active');
        },

        move : function(item){
            var that  = this, // save reference to the item
                delay = 50;

            clearTimeout(this.timer);

            this.timer = setTimeout(function(){
                var left  = item.position().left,
                    width = item.outerWidth(true);

                that.indicator.style.cssText = 'left:' + left + 'px; width:' + width + 'px';
            }, delay);
        }
    }

})(jQuery);