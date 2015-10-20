////////////////////////////////////////////////////////
// social network login manager

ToDoApp.connect = function(){
    "use strict";

////////////////////////////////////////////
    var logout = function(e){
        e.preventDefault();
        // check if connected with Facebook
       // ga('send', 'event', 'connection', 'signout');
        dataLayer.push({'event': 'connection logout'});

        if( FB.getAccessToken() )
            FB.logout(logoutRedirect);

        else if( gapi.auth2.getAuthInstance().isSignedIn.get() )
            google.signOut();

        else
            logoutRedirect();

        function logoutRedirect(){
            window.location = "/auth/signout";
        }
    }


    ////////////////////////////////
    // FACEBOOK
    var facebook = (function(){
        // if( typeof appData == 'undefined' || !appData.fb_app_id ){
        //     console.warn('no appData or missing "fb_app_id"');
        //     return;
        // }
        //  Configuration
        var appID = '1069832376361647',
            deffered;

        // Load the SDK asynchronously
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        window.fbAsyncInit = function(){
            FB.init({
                appId      : appID,
                cookie     : true,  // enable cookies to allow the server to access // the session
                xfbml      : false,  // parse social plugins on this page
                version    : 'v2.4'
            });
            FB.getLoginStatus(FBLoginStatus);
            FB.Event.subscribe('auth.authResponseChange', FBLoginStatus);
        };

        function FBLoginStatus(response){
            if( APP.utilities.checkSignedIn() || deffered && deffered.state() != 'resolved' )
                return;

            // if user refused to connect
            APP.DOM.$DOC.trigger('connection', ['facebook', response]);
            // The response object is returned with a status field that lets the
            // app know the current login status of the person.
            // Full docs on the response object can be found in the documentation
            // for FB.getLoginStatus().
            if( response.status === 'connected' ){
                // Logged into your app and Facebook.
                //connected(response);
                deffered = $.ajax({
                    url      : '/auth/facebook',
                    type     : 'POST',
                    dataType : 'json',
                    success  : function(res){
                        APP.DOM.$DOC.trigger('login', [null, res]);
                    }
                })
            }
            else if( response.status === 'not_authorized' ){
              // The person is logged into Facebook, but not your app.
            }
            else{
              // The person is not logged into Facebook, so we're not sure if
              // they are logged into this app or not.
            }
        };

        function checkLoginState() {
            FB.getLoginStatus(function(response) {
                FBLoginStatus(response);
            });
        }

        function connected(res){
            console.log('FACEBOOK CONENCTED');
            /*
            FB.api('/me', function(response){
            });
            */
        }

        return {
            login : function(){
                // fix iOS Chrome
                if( navigator.userAgent.match('CriOS') )
                    window.open('https://www.facebook.com/dialog/oauth?client_id='+appID+'&redirect_uri='+ document.location.href +'&scope=email,public_profile,user_friends', '', null);
                else
                    FB.login(null, {scope: 'email,public_profile'});
            },
            logout : function(){
                FB.logout();
            }
        }
    })();


    ////////////////////////////////
    // GOOGLE

    var google = (function(){
        var auth2;

       // window.___gcfg = {
       //     parsetags: 'onload'
      //  };

        (function(w) {
            if (!(w.gapi && w.gapi._pl)) {
              var d = w.document;
              var po = d.createElement('script'); po.type = 'text/javascript'; po.async = true;
              po.src = 'https://apis.google.com/js/platform.js?onload=gapi_init';
              var s = d.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
            }
        })(window);

        window.gapi_init = function(){
            gapi.load('auth2', function(){
                // Retrieve the singleton for the GoogleAuth library and set up the client.
                auth2 = gapi.auth2.init({
                    client_id    : '32120075756-ikt9bfcbm934q2tk8gu4o4etrf6690u3.apps.googleusercontent.com',
                    cookiepolicy : 'single_host_origin',
                    // Request scopes in addition to 'profile' and 'email'
                    //scope      : 'additional_scope'
                });
            });
        }

        function signin(){
            //GoogleAuth
            var promise = auth2.signIn().then(function(){
                console.log(arguments);
            });
        }

        function onSignIn(googleUser){
            var profile = googleUser.getBasicProfile();
            console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
            console.log('Name: ' + profile.getName());
            console.log('Image URL: ' + profile.getImageUrl());
            console.log('Email: ' + profile.getEmail());
        }

        function signOut(){
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function(){
                console.log('User signed out.');
            });
        }

        return {
            login  : signin,
            logout : signOut
        }
    })();


    ////////////////////////////
    // bind connect buttons
    $('.fbConnectBtn').click(facebook.login);
    $('.googleConnectBtn').click(google.login);

    ////////////////////////////
    // public methods
    ToDoApp.connect = {
        logout   : logout,
        facebook : facebook,
        google   : google,
    }
};