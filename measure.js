// connect to changes on 'device' dbs
// am notified of each save when it occurs
// when it shows up there, that counts as a local save,
// when it shows up on master, that counts a remote save
// when it shows up on other devices, it is a round trip

// need to track each doc & rev....

var coux = require('coux').coux
, follow = require('follow')
, jchrisUtils = require(__dirname + '/jchrisUtils')
, asyncFold = jchrisUtils.asyncFold
;

var MIN_DEVICES = 10;

function subscribeDb(db, fun) {
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

exports.start = function(dbs, ready) {
    var master = dbs[0]
        , dbs2 = dbs.slice(1)
        ;
    var state = {};
    // when the doc is in enough dbs, report
    function maybeReport(id) {
        var stats = state[id];
        if (stats.saved && stats.cloud && stats.devices) {
            if (Object.keys(stats.devices).length >= MIN_DEVICES) {
                console.log(id, stats)                
            }
        }
    }
    
    
    
    var notify = {
        saved : function(db, id, rev) {
            // note that this doc was saved to db X
            var revpos = parseInt(rev.split('-')[0]);
            state[id] = state[id] || {};
            state[id].saved = {rev:revpos, time : new Date()};
            maybeReport(id)
            // console.log(id, 'saved', db, rev)
        },
        cloud : function(id, rev) {
            // note that this doc is in master
            var revpos = parseInt(rev.split('-')[0]);
            state[id] = state[id] || {};
            state[id].cloud = {rev:revpos, time : new Date()};
            maybeReport(id)
            // console.log(id, 'cloud', rev)
        },
        device : function(db, id, rev) {
            // note that this doc is on device X
            var revpos = parseInt(rev.split('-')[0]);
            state[id] = state[id] || {};
            state[id].devices = state[id].devices || {};
            state[id].devices[db] = {rev:revpos, time : new Date()};
            maybeReport(id)
            // console.log(id, 'device', db, rev)
        }
    };
    asyncFold(dbs2, function(db, cb) {
        subscribeDb(db, function(change) {
            notify.device(db, change.id, change.changes[0].rev)
        });
        cb();
    }, function() {
        subscribeDb(master, function(change) {
            notify.cloud(change.id, change.changes[0].rev)
        })
        ready(notify);
    });
};