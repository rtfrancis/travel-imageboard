const express = require("express");
const app = express();
const db = require("./db.js");

const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const s3 = require("./s3");
const config = require("./config");

var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(
    require("body-parser").urlencoded({
        extended: false
    })
);
const bodyParser = require("body-parser");

app.use(bodyParser.json());

app.use(express.static("./public"));
app.use(express.static("uploads"));

app.get("/images", function(req, res) {
    Promise.all([db.getImages(), db.getCount()])
        .then(function([results1, results2]) {
            res.json({
                images: results1.rows,
                count: results2.rows[0].count
            });
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    return db
        .uploadImages(
            config.s3Url + req.file.filename,
            req.body.username,
            req.body.title,
            req.body.description
        )
        .then(function(result) {
            res.json({
                img: result.rows[0]
            });
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.get("/images/:id", function(req, res) {
    db
        .getImageById(req.params.id)
        .then(function(result) {
            res.json(result.rows[0]);
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.post("/comments/", function(req, res) {
    db
        .uploadComments(req.body.username, req.body.comment, req.body.image_id)
        .then(function(result) {
            res.json(result.rows[0]);
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.get("/comments/:id", function(req, res) {
    db
        .getComments(req.params.id)
        .then(function(result) {
            res.json(result.rows);
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.get("/moreimages/:id", function(req, res) {
    db
        .getMoreImages(req.params.id)
        .then(function(results) {
            res.json(results.rows);
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.listen(8080, () => console.log(`i'm listening`));
