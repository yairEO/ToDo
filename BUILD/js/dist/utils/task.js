export var Task = (function(){
    function Task(settings){
        if( !settings.el ) return;

        this.el           = settings.el;
        this.initialValue = this.el.innerHTML|0;
        this.toValue      = this.el.getAttribute('data-to') || settings.toValue;
        this.delta        = this.toValue - this.initialValue;
        this.easing       = settings.easingFunc || function(t){ return t };


        // Do-in settings object
        var doinSettings = {
            step     : this.step.bind(this),
            duration : settings.duration,
            done     : this.done.bind(this)
        };

        if( settings.fps )
           doinSettings.fps = settings.fps;

        // create an instance of Do-in
        this.doin = new Doin(doinSettings);
        this.doin.run();
    }

    Task.prototype.nf = new Intl.NumberFormat();

    // a step of the thing we want to do
    Task.prototype.step = function(t, elapsed){
        // easing
        t = this.easing(t);

        // calculate new value
        var value = this.delta * t + this.initialValue;

        // limit value
        if( t > 0.999 )
            value = this.toValue;

        // print value
        this.el.innerHTML = this.nf.format(value|0);
    }

    // on DONE
    Task.prototype.done = function(){
        // console.log(this.el, 'done counting!');
    }

    return Task;
})();