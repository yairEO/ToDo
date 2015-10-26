/////////////////////////////////////////
// Utility functions

export function getPrefixed(prop){
    var i, s = document.createElement('p').style, v = ['ms','O','Moz','Webkit'];
    if( s[prop] == '' ) return prop;
    prop = prop.charAt(0).toUpperCase() + prop.slice(1);
    for( i = v.length; i--; )
        if( s[v[i] + prop] == '' )
            return (v[i] + prop);
}