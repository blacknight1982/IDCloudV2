/**
 * Created by John on 2/7/2016.
 */

function bodyOnLoad(){
    triggerTableRender();
}

function triggerTableRender(){
    var table = document.getElementById("tab_companies_body");
    for (var i = 0;i<table.rows.length; i++){
    	row = table.rows[i];

        var calCell1 = row.querySelectorAll('[name=td_percenttwoday]');
        var calCell2 = row.querySelectorAll('[name=td_percentpre5day]');
        
        
        if(parseFloat(calCell1[0].innerText)>0){
        	calCell1[0].setAttribute("style", "background-color:#E1FFA2");
           
        }
        
        if(parseFloat(calCell1[0].innerText)<0){
        	calCell1[0].setAttribute("style", "background-color:#FFCC99");
           
        }
        
        if(parseFloat(calCell2[0].innerText)>0){
        	calCell2[0].setAttribute("style", "background-color:#E1FFA2");
           
        }
        
        if(parseFloat(calCell2[0].innerText)<0){
        	calCell2[0].setAttribute("style", "background-color:#FFCC99");
           
        }

    }
}
