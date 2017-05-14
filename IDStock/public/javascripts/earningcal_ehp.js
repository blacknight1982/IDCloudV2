/**
 * Created by John on 2/7/2016.
 */

function calChange() {
	triggerTableRender();
}




function triggerTableRender() {
	var dateInputElement = document.getElementById("inputCalDate");
	var vdate = dateInputElement.value.toString();
	$.ajax({
		type : "GET",
		url : "/trading/ercalehp/"+vdate,
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
				"</td><td>" + data.er_companies[i].industry_return + 
				"</td><td>" + data.er_companies[i].z_val + 
				"</td><td>" + data.er_companies[i].sample_count + 
				"</td><td>" + data.er_companies[i].median + 
				"</a></td></tr>";
			});

			$('#tab_companies_body').html(trHTML);

		},

		error : function(msg) {

			alert(msg.responseText);
		}
	});
}
