import * as utilities from '../utilities';

export default (function(){
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
            if( !utilities.string.normalizeContentEditable(this.innerHTML).trim() ){
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