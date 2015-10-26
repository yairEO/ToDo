// Change all checkboxes in the page to their "default" state
function defaultCheckboxes(){
    var allInputs = document.querySelectorAll('input');

    // loop on all checkboxes found (trick to iterate on nodeList)
    [].forEach.call(allInputs, function (input) {
        if( input.type == 'checkbox')
            input.checked = input.defaultChecked;
        else
            input.value = input.defaultValue;
    });
}

export default defaultCheckboxes;