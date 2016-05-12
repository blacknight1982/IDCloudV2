function decayCalculation(){
	var symbolSelect = $('#symbolSelect').val()
	if(symbolSelect != ""){
		var postData = {
	            symbol: symbolSelect,
	            fromDate: $('#fromDate').val(),
	            toDate: $('#toDate').val(),
	        }
		 $.ajax({
	         type: 'POST',
	         data: postData,
	         url: '/decay',
	         dataType: 'JSON'
	     }).done(function(response) {
	    	
	    	 $('#result').html('Decay value:' + response.value)
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