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

// copyright 2011 Couchbase
// 
// how many databases can a single server support, 
// where each database is replicating with one client?

var FILTER = false
    , CONTINUOUS = true
    , LOAD = "photos"
    ;

var coux = require('coux').coux
    , e = require('errlog').e
    , fs = require('fs')
    , url = require('url')
    , load = require(__dirname + '/' + LOAD)
    , measure = require(__dirname + '/measure')
    , jchrisUtils = require(__dirname + '/jchrisUtils')
    , asyncFold = jchrisUtils.asyncFold
    ;


// first line is the master server (not db)
// the other lines are clients - for each client we also create a database on the master
// it will have the same name as the device db + "cloud"
var dbs = fs.readFileSync(__dirname + "/multi_dbs.txt", "utf8").split(/\n/);

var master = dbs.shift();

var masterDbs = dbs.map(function(db) {
    var uri = url.parse(db)
        , dbName = uri.pathname.split('/')[1];
    return master + dbName + "cloud";
});

// create databases
asyncFold(masterDbs.concat(dbs), function(db, cb) {
    coux.del(db, function(err, ok) {
        if (err && err.error != "not_found") {
            console.log(err)
        } else {
            coux.put(db, e(function() {
                cb()
            }))
        }
    })
}, function() {
    // setup replication from devices <-> master
    // replication is triggered on the devices
    
    asyncFold(dbs, function(db, cb, i) {
        var rpc = url.parse(db)
            , dbName = rpc.pathname.split('/')[1];
        rpc.pathname = "/_replicate";
        var replicator = url.format(rpc);
        coux.post(replicator, {
            continuous : CONTINUOUS,
            source : dbName,
            target : masterDbs[i]
        }, e(function() {
            coux.post(replicator, {
                continuous : CONTINUOUS,
                source : masterDbs[i],
                target : dbName
            }, e(cb));
        }))
    }, function() {
        console.log("multi replication is running, start the measurement")
        measure.multi(dbs, masterDbs, function(notify) {
            console.log("measure is running, start the load")
            load.start(notify, dbs);
        })
    });
    
});

