var string = {
    normalizeContentEditable : function(s){
        if( !s )
            return '';

        return s.trim()
            .replace(/<br(\s*)\/*>/ig, '\n')
            .replace(/&nbsp;/ig, ' ')
            .replace(/<[p|div]\s/ig, '\n$0')
            .replace(/(<([^>]+)>)/ig,"");
    },

    random : function(n){
        var s = '';

        while( n-- ){
            s += Math.random().toString(36).substring(7);
        }

        return s;
    }
};

export default string;