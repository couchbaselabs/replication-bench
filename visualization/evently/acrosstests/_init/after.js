function(e, p) {
	console.log(e);
	console.log(p);
	
	var rowdata = e.rows;
	
	
	
	/* Sizing and scales. */
	var w = 400,
	    h = 400,
	    x = pv.Scale.linear(rowdata, function(d) { return d.key; }).range(0, w),
	    y = pv.Scale.linear(0, pv.max(rowdata, function(d) { return d.value.max; })).range(0, h);

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

	
	vis.add(pv.Line)
    .data(rowdata)
    .left(function(d) { return x(d.key); })
    .bottom(function(d) { return y(d.value.max); })
    .lineWidth(3)
    .strokeStyle("#F00");
	
	
	vis.add(pv.Line)
    .data(rowdata)
    .left(function(d) { return x(d.key); })
    .bottom(function(d) { return y(d.value.sum / d.value.count); })
    .lineWidth(3)
    .strokeStyle("#0F0");

	vis.render();

};