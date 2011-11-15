var coux = require("coux").coux;

var MIN_DELAY = 500; //ms ... max delay is 2x min delay

var photo_size = 2 * 1024 * 1024,
    photo = [];
for (var j=0; j < photo_size; j++) {
    photo.push("p");
};
photo = photo.join('');


var thumbnail_size = 200 * 1024,
    thumb = [];
for (var i=0; i < thumbnail_size; i++) {
    thumb.push("t");
};
thumb = thumb.join('');

function makeDoc() {
    var doc;
    if (Math.random() > 0.5) {
        doc = {
            type : "photo",
            owner : "damien",
            tags : ["hiking","vacation"]
        }
    } else {
        doc = {
            type : "thumbnail",
            owner : "yas",
            tags : ["concert"]
        }
    }
    return doc;
}

exports.start = function(notify, dbs) {
    function saveLoop(db) {
        var delay = MIN_DELAY + (Math.random() * MIN_DELAY);
        setTimeout(function() {
            saveDocAndPhoto(db);
            saveLoop(db);
        }, delay);
    }

    function saveDocAndPhoto(db) {
        var doc = makeDoc();
        if (doc.type == "photo") {
            savePhoto(db, doc);
        } else {
            saveThumbnail(db, doc);        
        }
    };

    function saveThumbnail(db, doc) {
        coux.post(db, doc, function(err, ok) {
            // console.log("thumb", ok)
            coux.put([db, ok.id, "thumb", {rev : ok.rev}], thumb, function(err, ok) {
                notify.saved(db, ok.id, ok.rev)
            })
        })
    }

    function savePhoto(db, doc) {
        coux.post(db, doc, function(err, ok) {
            // console.log("photo", ok)
            coux.put([db, ok.id, "photo", {rev : ok.rev}], photo, function(err, ok) {
                notify.saved(db, ok.id, ok.rev)
            })
        })
    }

    dbs.forEach(saveLoop);
};







