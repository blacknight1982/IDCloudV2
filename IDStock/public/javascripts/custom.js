/**
 * Created by John on 2/7/2016.
 */

$(document).ready(
  /* This is the function that will get executed after the DOM is fully loaded */
  function () {
	  triggerTableRender();
	  $( "#submitCustom" ).click(function() {
		  var inputCustomElem = document.getElementById("inputCustom");
		  var inputCustom = inputCustomElem.value;
		  lockScreenAndWait("Adding new Symbol");
		  $.ajax({
				type : "POST",
				url : "/trading/custom/" + inputCustom,
				data : "{}",
				contentType : "application/json; charset=utf-8",
				dataType : "json",
				success : function(data) {
					triggerTableRender();
					unlockScreen();
				},

				error : function(msg) {
					alert(msg.responseText);
				}
		  });
		  
	  });
  });




function triggerTableRender() {
	$.ajax({
		type : "GET",
		url : "/trading/custom/all",
		data : "{}",
		contentType : "application/json; charset=utf-8",
		dataType : "json",
		success : function(data) {

			var trHTML = '';

			$.each(data.er_companies, function(i, item) {

				trHTML += "<tr><td><a href='https://www.zacks.com/stock/chart/" + data.er_companies[i].symbol + "/price-consensus-eps-surprise-chart' target='_blank'>"+data.er_companies[i].symbol + 
				"</a></td><td>" + data.er_companies[i].name + 
				"</td><td>" + data.er_companies[i].market_cap + 
				"</td><td>" + data.er_companies[i].sector + 
				"</td><td><a href='/trading/ercalhistory/" + encodeURIComponent(data.er_companies[i].industry) + "' target='_blank'>" + data.er_companies[i].industry + 
				"</a></td><td>" + data.er_companies[i].price + 
				"</td><td>" + data.er_companies[i].pe + 
				"</td><td>" + data.er_companies[i].eps + 
				"</td><td><a href='http://www.nasdaq.com/earnings/report/" + data.er_companies[i].symbol + "' target='_blank'>" + data.er_companies[i].erdetails + 
				"</a></td></tr>";
			});

			$('#tab_companies_body').html(trHTML);

		},

		error : function(msg) {

			alert(msg.responseText);
		}
	});
}
