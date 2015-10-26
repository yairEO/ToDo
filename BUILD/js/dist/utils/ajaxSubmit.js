s// An all-purpose AJAX form submit
export function ajaxSubmit(form){
    var generalAlert = form.querySelector('.generalAlert'),
        $form = $(form);

    // lock form submiting until request is resolved
    if( $form.data('proccesing') )
        return false;

    // Add loading spinner and disable the button until request was resolved
    $form
        .addClass('loading')
        .find('button[type=submit]').prop('disabled', true);

    $.ajax({
        type     : "POST",
        url      : $form[0].action,
        dataType : 'json',
        data     : $form.serialize() // serializes the form's elements.
    })
    .done(onDone)
    .fail(function(){
        $form.removeClass('loading');
        onDone({ success:false, "fields":{ general:"Something went wrong, please try again" } });
    })
    .always(always);

    // set form to "processing" state
    $form.data('proccesing', true);

    /////// response callbacks //////
    function always(){
        $form
            .data('proccesing', false)
            //.removeClass('loading')  // page will refresh anyway
            .find('button[type=submit]').prop('disabled', false);
    }

    function onDone(res){
        if( res.success ){
            $form.removeClass('loading');
        }
        else
            errorsHandler(res.fields);
    }

    function errorsHandler(fields){
        var field, errorMsg;

        // remove loading state on success "false"
        $form.removeClass('loading');

        for( field in fields ){
            if (fields.hasOwnProperty(field)){
                errorMsg = fields[field];

                if( field == 'general' && generalAlert)
                    generalAlert.innerHTML = errorMsg;

                else
                    validator.mark( $( $form[0][field] ) , errorMsg );
            }
        }
    }
}