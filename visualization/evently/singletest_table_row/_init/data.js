function(data, e) {
	
	console.log("d e: ");
	console.log(e);
	console.log("d data: ");
	console.log(data);
	
	var result = {
			label: e.data.args.rowlabel,
			min: (data.rows[0].value.min).toFixed(2),
			avg: (data.rows[0].value.sum / data.rows[0].value.count).toFixed(2),
			max: (data.rows[0].value.max).toFixed(2)
		};
	
	console.log("result: ");
	console.log(result);
	
	return result;
}