// log if any DOM elemtn wasn't cached
export default function checkDOMbinding(DOM){
    for( var i in DOM ){
        if( !DOM[i] ){
            console.log( Function.caller, i, ' - DOM reference empty' );
        }
    }
}