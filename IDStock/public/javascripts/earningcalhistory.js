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
        var calCell = row.querySelectorAll('[name=td_percentday1]');
        var calCell2 = row.querySelectorAll('[name=td_percentday2]');
	
        if(parseFloat(calCell[0].innerText)>0){
        	calCell[0].setAttribute("style", "background-color:#6EFF4A");
           
        }
        
        if(parseFloat(calCell[0].innerText)<0){
        	calCell[0].setAttribute("style", "background-color:#FF5C5C");
           
        }
        
        if(parseFloat(calCell2[0].innerText)>0){
        	calCell2[0].setAttribute("style", "background-color:#6EFF4A");
           
        }
        
        if(parseFloat(calCell2[0].innerText)<0){
        	calCell2[0].setAttribute("style", "background-color:#FF5C5C");
           
        }
    }
}
