// copyright 2011 Couchbase
// 
// how many devices can a single database support for shared replication?
// w/ option to filter
var FILTER = false;

var coux = require('coux').coux
    , e = require('errlog').e
    , fs = require('fs')
    ;

// first database is the master
var dbs = fs.readFileSync(__dirname + "/dbs.txt", "utf8").split(/\n/);

// create databases (first one is master)
function createDbs(i, done) {
    coux.put(dbs[i], (function(e, ok) {
        if (e && e.error != "file_exists") {
            console.log(e)
        } else {
            if (i+1 < dbs.length) {
                createDbs(i+1, done);
            } else {
                done()
            }
        }
    }))
}
createDbs(0, function() {
    coux("http://localhost:5984/", function(err, resp) {
        console.log(resp)
    });
});


