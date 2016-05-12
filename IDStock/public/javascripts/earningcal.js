/**
 * Created by John on 2/7/2016.
 */

function calChange(){
    triggerTableRender();
}

function triggerTableRender(){
    var dateInputElement = document.getElementById("inputCalDate");
    var vdate = dateInputElement.value.toString();
    var table = document.getElementById("tab_companies_body");
    for (var i = 0, row; row = table.rows[i]; i++){
        var calCell = row.querySelectorAll('[name=td_erDate]');
        var calCell2 = row.querySelectorAll('[name=td_currentPrice]');
        var calCell3 = row.querySelectorAll('[name=td_marketCap]');
        if((calCell[0].innerText == vdate)&&(parseFloat(calCell3[0].innerText) > 1000)){
        	row.setAttribute("style", "display:table-row");
            if(parseFloat(calCell2[0].innerText)>100){
                row.setAttribute("style", "display:table-row;background-color:#E1FFA2");
            }
        }
        else{
            row.setAttribute("style", "display:none")
        }
    }
}
