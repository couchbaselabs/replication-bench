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

exports.asyncFold = function(array, fun, done, fanout) {
    fanout = fanout || 1;
    var length = array.length, offset = -1, countdown = length,
        cb = function() {
            countdown--;
            var i, todo = Math.min(fanout, length - (offset+1)); // length - offset = rest
            if (offset+1 < length) {
                for (i=0; i < todo; i++) {
                    offset++
                    fun(array[offset], cb, offset)
                };
            } else {
                // call done only after the last time
                if (countdown < 0) {
                    done();
                }
            }
        };
    cb();
};
