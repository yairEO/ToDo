export var template = {
    minify : function(html){
        return html.replace( new RegExp( "\>[\r\n ]+\<" , "g" ) , "><" );
    }
}