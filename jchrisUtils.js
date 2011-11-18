exports.asyncFold = function(array, fun, done) {
    var offset = -1
        , cb = function() {
            offset++;
            if (offset < array.length) {
                fun(array[offset], cb, offset)
            } else {
                done();
            }
        };
    cb();
};
