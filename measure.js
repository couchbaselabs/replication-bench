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

// connect to changes on 'device' dbs
// am notified of each save when it occurs
// when it shows up there, that counts as a local save,
// when it shows up on master, that counts a remote save
// when it shows up on other devices, it is a round trip

// need to track each doc & rev....

var coux = require('coux').coux
, e = require('errlog').e
, jchrisUtils = require(__dirname + '/jchrisUtils')
, asyncFold = jchrisUtils.asyncFold
;

var MIN_DEVICES = 10;

function subscribeDb(db, fun) {
    console.log(db)
    function getChanges(since) {
        coux({url:db + "/_changes?feed=longpoll&since="+since, agent:false}, 
        function(err, changes) {
            if (err) {
                console.log("getChanges", err)
            } else {
                changes.results.forEach(fun)
                getChanges(changes.last_seq);
            }
        })
    }
    getChanges(0);
};

exports.multi = function(dbs, masters, ready) {
    var state = {};
    
    function maybeReport(id) {
        var stats = state[id]
        , ready_devices = []
        ;
        if (stats.saved && stats.cloud) {
            report(id, stats);
        }
    }
    
    function report(id, stats) {
        // report gives id, time on local, time to master, min, avg, max time to devices
        var reportData = {
            time_to_local : stats.saved.time - stats.start
            , time_to_master : stats.cloud.time - stats.start
        };
        console.log(id, reportData);
        delete state[id];
    }
    
    var notify = {
        start : function(db, id) {
            state[id] = state[id] || {};
            state[id].start = new Date();
        },
        saved : function(db, id, rev) {
            // note that this doc was saved to db X
            var revpos = parseInt(rev.split('-')[0]);
            state[id] = state[id] || {};
            state[id].saved = {rev:revpos, time : new Date()};
            maybeReport(id)
        },
        cloud : function(id, rev) {
            // note that this doc is in master
            var revpos = parseInt(rev.split('-')[0]);
            state[id] = state[id] || {};
            state[id].cloud = {rev:revpos, time : new Date()};
            maybeReport(id)
        }
    };
    asyncFold(masters, function(db, cb) {
        subscribeDb(db, function(change) {
            notify.cloud(change.id, change.changes[0].rev)
        });
        cb();
    }, function() {
        ready(notify);
    });
};

exports.start = function(dbs, ready) {
    var master = dbs[0]
        , dbs2 = dbs.slice(1)
        ;
    var state = {};
    var seq = 0;
    
    // when the doc is in enough dbs, report
    function maybeReport(id) {
        var stats = state[id]
        , ready_devices = []
        ;
        if (stats.start && stats.cloud) {
            report(id, stats, ready_devices);                
        }
    }
    function report(id, stats) {
        // report gives id, time on local, time to master
        var reportData = { 
            _id: id
            , test_label: process.env.TEST_LABEL
            , seq: seq++
            , time_to_master : stats.cloud.time - stats.start
            , start : stats.start.getTime()
            , device_time : stats.device_time
        };
        console.log(reportData);
        if(process.env.TEST_RESULTS_DATABASE) {
           coux.post(process.env.TEST_RESULTS_DATABASE, reportData, function(err, ok) { 
               // fire and forget, ignore success/failure
              });
        }
        delete state[id];
    }
    
    
    var notify = {
        start : function(db, id) {
            state[id] = state[id] || {};
            state[id].start = new Date();
        },
        cloud : function(id, rev) {
            // note that this doc is in master
            var revpos = parseInt(rev.split('-')[0]);
            state[id] = state[id] || {};
            state[id].cloud = {rev:revpos, time : new Date()};
            maybeReport(id)
        },
        device : function(id) {
            var time = new Date().getTime();
            console.log("device "+id)
            if(process.env.TEST_RESULTS_DATABASE) {
                coux([process.env.TEST_RESULTS_DATABASE, id], function(err, doc) { 
                    if (err && err.error == 'not_found') {
                        state[id] = state[id] || {};
                        state[id].device_time = time;
                    } else {
                        doc.device_time = time;
                        coux.post(process.env.TEST_RESULTS_DATABASE, doc, e(function() {}));
                    }
                });
            }
        }
    };
    subscribeDb(master, function(change) {
        notify.cloud(change.id, change.changes[0].rev)
    })
    
    asyncFold(dbs2, function(db, cb) {
        if (Math.random() < 0.1) {
            subscribeDb(db, function(change) {
                notify.device(change.id)
            })
        }
        cb()
    }, function() {
        ready(notify);
    });
};
