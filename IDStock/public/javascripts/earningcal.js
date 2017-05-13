/**
 * Created by John on 2/7/2016.
 */

function calChange() {
	//triggerTableRender();
	triggerTableRender2();
}

function triggerTableRender() {
	var dateInputElement = document.getElementById("inputCalDate");
	var vdate = dateInputElement.value.toString();
	var table = document.getElementById("tab_companies_body");
	for (var i = 0, row; row = table.rows[i]; i++) {
		var calCell = row.querySelectorAll('[name=td_erDate]');
		var calCell2 = row.querySelectorAll('[name=td_currentPrice]');
		var calCell3 = row.querySelectorAll('[name=td_marketCap]');
		if ((calCell[0].innerText == vdate)
				&& (parseFloat(calCell3[0].innerText) > 500)) {
			row.setAttribute("style", "display:table-row");
			if (parseFloat(calCell2[0].innerText) > 100) {
				row.setAttribute("style",
						"display:table-row;background-color:#E1FFA2");
			}
		} else {
			row.setAttribute("style", "display:none")
		}
	}
}

function triggerTableRender2() {
	var dateInputElement = document.getElementById("inputCalDate");
	var vdate = dateInputElement.value.toString();
	$.ajax({
		type : "GET",
		url : "/trading/ercal/"+vdate,
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
