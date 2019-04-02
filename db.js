var spicedPg = require("spiced-pg");

var db = spicedPg(process.env.DATABASE_URL || "postgres:postgres:postgres@localhost:5432/travelboard");

module.exports.getImages = function getImages() {
    return db.query(`SELECT * FROM images
                ORDER BY created_at DESC LIMIT 6
        `);
};
module.exports.getCount = function getCount() {
    return db.query(`SELECT COUNT (*) FROM images`);
};

module.exports.uploadImages = function uploadImages(
    url,
    username,
    title,
    description
) {
    return db.query(
        `INSERT INTO images (url, username, title, description)
            VALUES ($1, $2, $3, $4)
            RETURNING id, url, title`,
        [url, username, title, description]
    );
};

module.exports.getImageById = function getImageById(imageId) {
    return db.query(
        `SELECT * FROM images
    WHERE id = $1
    `,
        [imageId]
    );
};

module.exports.uploadComments = function uploadComments(
    username,
    comment,
    image_id
) {
    return db.query(
        `INSERT INTO comments (username, comment, image_id)
    VALUES ($1, $2, $3)
    RETURNING *`,
        [username, comment, image_id]
    );
};

module.exports.getComments = function getComments(imageId) {
    return db.query(
        `SELECT * FROM comments
        WHERE image_id = $1
        ORDER BY created_at DESC`,
        [imageId]
    );
};

module.exports.getMoreImages = function getMoreImages(imageId) {
    return db.query(
        `SELECT * FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 6
        `,
        [imageId]
    );
};
