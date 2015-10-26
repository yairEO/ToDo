export default function checkSignedIn(modal){
    var signed = gs_data && gs_data.member.id;
    if( !signed && modal )
        ToDoApp.components.modals.show(modal);

    return !!signed;
}