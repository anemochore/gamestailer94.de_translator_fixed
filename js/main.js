(function($){
    var org_data;
    var new_data;
    var file_name = '';
    //bind events
    $('#file').on('change',function(env){
        clearAll();
        var file = env.target.files[0];
        file_name = file.name;
        var reader = new FileReader;
        reader.onloadend = (function(theFile){
            return function(e){
                parseData($.parseJSON(e.target.result));
            };
        })(file);
        reader.readAsText(file);
    });
    $('#event_table').on('click','tr',loadText);
    $('#text_table').on('change','input',saveText);
    $('#download').on('click', downloadJSON);

    //show Help on first visit

    if(typeof Cookies.get("visited") == 'undefined'){
        Cookies.set("visited", 1, { expires : 365 });
        $('#helpModal').modal();
    }else{
        Cookies.set("visited", 1, { expires : 365 });
    }


    function parseData(json){
        if(typeof json[0] != 'undefined') {
            $(json).each(function(index, value) {
                if(value != null){
                    parseData(value);
                }
            });
        }else{
            // save for later
            org_data = json;
            new_data = jQuery.extend(true, {}, json);
            // is map ?
            if(typeof json.events != 'undefined'){
                // per event
                $(json.events).each(function(index, value) {
                    if(value == null){
                        return true;
                    }
                    var id= value.id;
                    var name= value.name;
                    // per page
                    $(value.pages).each(function(index,value) {
                        if(value == null){
                            return true;
                        }
                        // test if anything important is in the event
                        var skip = true;
                        $(value.list).each(function(index,value) {
                            if (value == null || (value.code != 401 && value.code != 101)) {
                                return true;
                            }else{
                                skip = false;
                            }
                        });
                        if(skip){
                            return true;
                        }
                        //write to event table
                        $('#event_table').append(
                            $('<tr>').attr('data-id',id).attr('data-page',index).append(
                                $('<td>').html(id)
                            ).append(
                                $('<td>').html(name)
                            ).append(
                                $('<td>').html(index+1)
                            )
                        );
                    });
                });
            }
        }
    }

    function loadText(){
        $('#text_table').empty();
        var el=$(this);
        var id=el.data('id');
        var page=el.data('page');
        var list = org_data.events[id].pages[page].list;
        var list_new =new_data.events[id].pages[page].list;
        $(list).each(function(index,value){
            // console.log(value);
            if(value == null || (value.code != 401 && value.code != 101)){
                return true;
            }
            if(value.code == 101){
                //write new Char to text Table
                $('#text_table').append(
                    $('<tr>').append(
                        $('<td>').html(index)
                    ).append(
                        $('<td>').html("NEW BOX!")
                    ).append(
                        $('<td>').html("Image: "+ (value.parameters[0]||'none')).attr('colspan',2)
                    )
                );
            }else {
                //write to text table
                $('#text_table').append(
                    $('<tr>').attr('data-event', id).attr('data-page', page).attr('data-id', index).addClass(value.parameters[0]!=list_new[index].parameters[0]&&'success').append(
                        $('<td>').html(index)
                    ).append(
                        $('<td>').html('Text')
                    ).append(
                        $('<td>').html(value.parameters[0])
                    ).append(
                        $('<td>').append(
                            $('<input>').val(list_new[index].parameters[0]).attr('type', 'text')
                        )
                    )
                );
            }
        });
    }

    function saveText(){
        var el=$(this);
        var par=el.parent().parent();
        par.removeClass('success').addClass('info');
        var id=par.data('id');
        var page=par.data('page');
        var event=par.data('event');
        new_data.events[event].pages[page].list[id].parameters[0] = el.val();
        par.removeClass('info').addClass('success');
    }

    function downloadJSON(){
        if(file_name == ''){
            return false;
        }
        var blob = new Blob([JSON.stringify(new_data)], {type: "text/json;charset=utf-8"});
        saveAs(blob, file_name);
    }
    
    function clearAll(){
        $('#event_table').empty();
        $('#text_table').empty();
    }
})(jQuery);
