function(event, view) {

	var query_options = {};
	
	//view = "10devices_1server";
	
	
	query_options.view = 'data_points_by_label_seq';
	query_options.start_key = JSON.stringify([view]);
	query_options.end_key = JSON.stringify([view, "_"]);
	query_options.include_docs = true;
	
	return query_options;
};