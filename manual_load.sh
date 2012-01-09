// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
// either express or implied.
//
// See the License for the specific language governing permissions
// and limitations under the License.

// copyright 2012 Couchbase

var LOAD = process.env.LOAD || "im"
    ;


var coux = require('coux').coux
    , e = require('errlog').e
    , fs = require('fs')
    , url = require('url')
    , load = require(__dirname + '/' + LOAD)
    , jchrisUtils = require(__dirname + '/jchrisUtils')
    , asyncFold = jchrisUtils.asyncFold
    ;

// dummy notifier, so we can re-use workloads
var notify = {
    start : function(db, id) {
    },
    saved : function(db, id, rev) {
    },
    cloud : function(id, rev) {
    }
};


var db = process.argv[2];
console.log('db is ' + db);
console.log('Deleting database');
coux.del(db, function(err, ok) {
    if (err && err.error != "not_found") {
        console.log(err)
    } else {
        console.log('Creating database');
        coux.put(db, e(function() {
            console.log('Starting workload');
            load.start(notify, [db]);
        }))
    }
})
