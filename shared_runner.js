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
// how many devices can a single database support for shared replication?
// w/ option to filter TODO
var FILTER = process.env.FILTER ? true : false
    , CONTINUOUS = true
    , LOAD = process.env.LOAD || "photos"
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


// first database is the master
var dbs = fs.readFileSync(__dirname + "/shared_dbs.txt", "utf8").split(/\n/);
// more gracefully handle new-line at the end of the file
dbs = dbs.filter(function(val) {
	return !(val === "" || typeof val == "undefined" || val === null);
});

console.log("deleting and creating databases");

// create databases (first one is master)
asyncFold(dbs, function(db, cb) {
    console.log("del", db)
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
    console.log("setting up replications");

    // setup replication from devices <-> master
    var master = dbs[0]
        , dbs2 = dbs.slice(1)
        ;
    
    
    function triggerRepsAndGo() {
        asyncFold(dbs2, function(db, cb) {
            var rpc = url.parse(db)
                , dbName = rpc.pathname.split('/')[1];
            rpc.pathname = "/_replicate";
            var replicator = url.format(rpc);
            coux.post(replicator, {
                continuous : CONTINUOUS,
                source : dbName,
                target : master
            }, e(function() {
                var repdef = {
                    continuous : CONTINUOUS,
                    source : master,
                    target : dbName
                };
                if (FILTER) {
                    repdef.filter = "filter/random";
                    repdef.query_params = {rand:Math.round(Math.random() * 100).toString()};
                }
                coux.post(replicator, repdef, e(function() {
                    cb()
                }));
            }))
        }, function() {
            console.log("replication is running, start the measurement")
            measure.start(dbs, function(notify) {
                console.log("measure is running, start the load: "+LOAD)
                load.start(notify, dbs2);
            })
        }, 10);
    };
    
    
    if (FILTER) {
        console.log("setting up filter fun");
        var filterFun = 'fun(Doc, Req) -> GetFrom = fun(Key, {Plist}) -> proplists:get_value(Key, Plist, null) end, Rand = GetFrom(<<"rand">>, GetFrom(<<"query">>, Req)), case GetFrom(<<"rand">>, Doc) of Rand -> true; _ -> false end end.';
        var ddoc = {
            language: "erlang",
            filters : {    
                random : filterFun
            }
        }  ;
        // var config = url.parse(master)
        //     , dbName = config.pathname.split('/')[1];
        // config.pathname = "/_config/native_query_servers/erlang";
        // config = url.format(config);
        // coux.put(config,'{couch_native_process, start_link, []}')
        coux.put([master, "_design/filter"], ddoc, e(function(err, ok) {
            triggerRepsAndGo()
        }));
    } else {
        triggerRepsAndGo()
    }
    
}, 5);

