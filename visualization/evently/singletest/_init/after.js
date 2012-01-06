function(e, p) {
	console.log(e);
	console.log(p);
	
	var rowdata = e.rows;
	
	
	
	/* Sizing and scales. */
	var w = 400,
	    h = 100,
	    x = pv.Scale.linear(rowdata, function(d) { return d.key[1]; }).range(0, w),
	    y = pv.Scale.linear(0, pv.max(rowdata, function(d) { return d.doc.time_to_master; })).range(0, h);

	/* The root panel. */
	var vis = new pv.Panel()
	    .canvas($(this).attr('id'))
	    .width(w)
	    .height(h)
	    .bottom(20)
	    .left(40)
	    .right(10)
	    .top(5);

	/* X-axis ticks. */
	vis.add(pv.Rule)
	    .data(x.ticks())
	    .visible(function(d) { return d > 0; })
	    .left(x)
	    .strokeStyle("#eee")
	  .add(pv.Rule)
	    .bottom(-5)
	    .height(5)
	    .strokeStyle("#000")
	  .anchor("bottom").add(pv.Label)
	    .text(x.tickFormat);

	/* Y-axis ticks. */
	vis.add(pv.Rule)
	    .data(y.ticks(5))
	    .bottom(y)
	    .strokeStyle(function(d) { return d ? "#eee" : "#000"; })
	  .anchor("left").add(pv.Label)
	    .text(y.tickFormat);


//	vis.add(pv.Bar)
//	    .data(rowdata)
//	    .left(function(d) { return x(d.key[1]); })
//	    .bottom(0)
//	    .height(function(d) { return y(d.doc.max_to_devices); })
//	    .width(2)
//	    .strokeStyle("#F00");
//
//	vis.add(pv.Bar)
//	    .data(rowdata)
//	    .left(function(d) { return  x(d.key[1]); })
//	    .bottom(0)
//	    .height(function(d) { return y(d.doc.avg_to_devices); })
//	    .width(2)
//	    .strokeStyle("#0F0");
//
//	vis.add(pv.Bar)
//	    .data(rowdata)
//	    .left(function(d) { return x(d.key[1]); })
//	    .bottom(0)
//	    .height(function(d) { return y(d.doc.min_to_device); })
//	    .width(2)
//	    .strokeStyle("#00F");
	
	vis.add(pv.Bar)
    .data(rowdata)
    .left(function(d) { return x(d.key[1]); })
    .bottom(0)
    .height(function(d) { return y(d.doc.time_to_master); })
    .width(2)
    .strokeStyle("#00F");	

	vis.render();

};