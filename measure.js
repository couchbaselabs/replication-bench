// connect to changes on 'device' dbs
// am notified of each save when it occurs
// when it shows up there, that counts as a local save,
// when it shows up on master, that counts a remote save
// when it shows up on other devices, it is a round trip

// need to track each doc & rev....


exports.start = function(dbs, cb) {
    var master = dbs[0]
        , dbs2 = dbs.slice(1)
        ;
    var state = {};
    // when the doc is in enough dbs, report
    var notify = {
        saved : function(db, id, rev) {
            // note that this doc was saved to db X
            var revpos = parseInt(rev.split('-')[0]);
            state[id] = state[id] || {};
            state[id].saved = {rev:revpos, time : new Date()};
            console.log(id, 'saved', db, rev)
        },
        cloud : function(id, rev) {
            // note that this doc is in master
            var revpos = parseInt(rev.split('-')[0]);
            state[id] = state[id] || {};
            state[id].cloud = {rev:revpos, time : new Date()};
            console.log(id, 'cloud', rev)
        },
        device : function(db, id, rev) {
            // note that this doc is on device X
            var revpos = parseInt(rev.split('-')[0]);
            state[id] = state[id] || {};
            state[id].devices = state[id].devices || [];
            state[id].devices.push({db:db, rev:revpos, time : new Date()});
            console.log(id, 'device', db, rev)
        }
    }
    

    
    // coux(master)
    
    cb(notify)
};