/**
 * Created by I048929 on 2/17/2016.
 */

function calChange(){
    triggerTableRender();
}

function triggerTableRender(){
    var dateInputElement = document.getElementById("inputCalDate");
    var vdate = dateInputElement.value.toString();
    var table = document.getElementById("tab_companies_body");
    for (var i = 0, row; row = table.rows[i]; i++){
        var calCell = row.querySelectorAll('[name=td_maDate]');
        if(calCell[0].innerText >= vdate){
            row.setAttribute("style", "display:table-row");
        }
        else{
            row.setAttribute("style", "display:none")
        }
    }
}
