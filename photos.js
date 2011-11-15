var coux = require("coux").coux;

exports.start = function(dbs) {
    console.log('kick it', dbs)
    dbs.forEach(saveLoop);
};

var MIN_DELAY = 500; //ms ... max delay is 2x min delay

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

function saveDocAndPhoto(db) {
    var doc = makeDoc();
    if (doc.type == "photo") {
        savePhoto(db, doc);
    } else {
        saveThumbnail(db, doc);        
    }
};

var photo_size = 2 * 1024 * 1024,
    photo = [];
for (var j=0; j < photo_size; j++) {
    photo.push("p");
};
photo = photo.join('');

function savePhoto(db, doc) {
    coux.post(db, doc, function(err, ok) {
        console.log("photo", ok)
        coux.put([db, ok.id, "photo", {rev : ok.rev}], photo, function(err, ok) {
            console.log("put photo bin", err, ok)
        })
    })
}

var thumbnail_size = 200 * 1024,
    thumb = [];
for (var i=0; i < thumbnail_size; i++) {
    thumb.push("t");
};
thumb = thumb.join('');

function saveThumbnail(db, doc) {
    coux.post(db, doc, function(err, ok) {
        console.log("thumb", ok)
        coux.put([db, ok.id, "thumb", {rev : ok.rev}], thumb, function(err, ok) {
            console.log("put thumb bin", err, ok)
        })
    })
}

function saveLoop(db) {
    var delay = MIN_DELAY + (Math.random() * MIN_DELAY);
    setTimeout(function() {
        console.log("save doc", db)
        saveDocAndPhoto(db);
        saveLoop(db);
    }, delay);
}

