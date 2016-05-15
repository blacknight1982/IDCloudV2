$(document).ready(
  /* This is the function that will get executed after the DOM is fully loaded */
  function () {
	  google.charts.load('current', {packages: ['corechart', 'line']});
	  $('#fromDate').val(standardPeriod(-24));
	  $('#toDate').val(standardPeriod(0));
  });

	    	 
function drawchart(){
	var symbolSelect = $('#symbolSelect').val();
	if(symbolSelect != ""){
		var postData = {
	            symbol: symbolSelect,
	            fromDate: $('#fromDate').val(),
	            toDate: $('#toDate').val()
	        }
		 $.ajax({
	         type: 'POST',
	         data: postData,
	         url: '/decay',
	         dataType: 'JSON'
	     }).done(function(response) {
	    	 
	    	 google.charts.setOnLoadCallback(drawLogScales(response));
	    	 
	    	 // Check for successful (blank) response
	         if (response.msg === '') {
	        	 $('#result').val('N/A');
	         }
	         else {
	             // If something goes wrong, alert the error message that our service returned
	        	 $('#result').val('N/A');
	
	         }
	     }).error(function(err){
	    	 $('#result').val(err);
	     	}
	     );
	}
}

function drawLogScales(response) {
    var data1 = new google.visualization.DataTable();
    data1.addColumn('string', 'Date');
    data1.addColumn('number', $('#symbolSelect').val());
    data1.addRows(response.target);
    var data2 = new google.visualization.DataTable();
    data2.addColumn('string', 'Date');
    data2.addColumn('number', response.subjectSymbol);
    data2.addRows(response.subject);
    var options1 = {
            hAxis: {
              title: 'Date',
              logScale: true
            },
            vAxis: {
              title: 'Price',
              logScale: false
            },
            colors: ['#a52714', '#097138']
            
          };
    var options2 = {
            hAxis: {
              title: 'Date',
              logScale: true
            },
            vAxis: {
              title: 'Price',
              logScale: false
            },
            colors: ['#097138','#a52714']
            
          };
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    var chart2 = new google.visualization.LineChart(document.getElementById('chart2_div'));
    
    google.visualization.events.addListener(chart, 'select', chart1Selection);
    google.visualization.events.addListener(chart2, 'select', chart2Selection);
    
    function chart1Selection(){
        var selectedItem = chart.getSelection();
        var row = selectedItem[0].row;
        var col = selectedItem[0].column;
        
        if ($('input[name="chartRadio"]:checked').val() === 'fromDateRadio') {
        	$('#fromDate').val(data1.getFormattedValue(selectedItem[0].row,0));
        }
        else{
        	$('#toDate').val(data1.getFormattedValue(selectedItem[0].row,0));
        }
        drawchart();
        
      }
    
    function chart2Selection(){
        var selectedItem = chart2.getSelection();
        var row = selectedItem[0].row;
        var col = selectedItem[0].column;
        if ($('input[name="chartRadio"]:checked').val() === 'fromDateRadio') {
        	$('#fromDate').val(data1.getFormattedValue(selectedItem[0].row,0));
        }
        else{
        	$('#toDate').val(data1.getFormattedValue(selectedItem[0].row,0));
        }
        drawchart();
      }
    
    chart.draw(data1, options1);
    chart2.draw(data2, options2);
    $('#result').html('<b>'+response.decayResults.reason+'</b><br/>'+response.subjectSymbol + ': Increase: <b>' + response.decayResults.subjectIncrease*100 + '%</b><br/>' + 
    		response.targetSymbol + ': Supposed increase: <b>' + response.decayResults.targetIncrease*100 + '%</b><br/>Actual increase: <b>' +
    		response.decayResults.actualTargetIncrease*100 + '%</b><br/>Trading Days: <b>' + response.decayResults.tradingDays+'</b><br/>Decay: <b>'+
    		response.decayResults.decay*100 + '%</b>');
}

function standardPeriod(p) {
	var CurrentDate = new Date();
	CurrentDate.setMonth(CurrentDate.getMonth() + p);
	
	var day = CurrentDate.getDate();
	var month = CurrentDate.getMonth()+1;
	var year = CurrentDate.getFullYear();
	
	if (month < 10)
		month = "0" + month;
	if (day < 10)
		day = "0" + day;
	
	var today = year + "-" + month + "-" + day;
	
	return today;
}