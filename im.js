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

var coux = require("coux").coux
, e = require('errlog').e
;

var MIN_DELAY = 30 * 1000; //ms ... max delay is 2x min delay



function makeDoc() {
    var doc;
    if (Math.random() > 0.5) {
        doc = {
            type : "im",
            author : "jchris",
            message : "I put a Couch in your Couch so you can rest while you REST"
        }
    } else {
        doc = {
            type : "im",
            author : "marty",
            message : "we don't need simulators"
        }
    }
    return doc;
}

var ranDb = {};
exports.start = function(notify, dbs) {
    function saveLoop(db) {
        var delay;
        if (ranDb[db]) {
            delay = MIN_DELAY + (Math.random() * MIN_DELAY);
        } else {
            delay = Math.random() * MIN_DELAY;
            ranDb[db] = true;
        }
        setTimeout(function() {
            saveIM(db, makeDoc());
            saveLoop(db);
        }, delay);
    }

    function saveIM(db, doc) {
        coux.post(db, doc, e(function(err, ok) {
            notify.start(db, ok.id);
        }))
    }

    dbs.forEach(saveLoop);
};







