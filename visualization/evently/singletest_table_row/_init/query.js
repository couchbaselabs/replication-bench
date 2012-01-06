function(event, arg) {

	var query_options = {};
	
	console.log("v: " + arg.view);
	console.log("tl: " + arg.testlabel);
	
	query_options.view = arg.view;
	query_options.key = arg.testlabel;
	query_options.group_level = 1;
	
	return query_options;
};