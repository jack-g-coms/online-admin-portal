// CONSTANTS
const sqlite3 = require('sqlite3').verbose();
const uuid = require('uuid').v4;

const Database = new sqlite3.Database('./data/Database.db');

// FUNCTIONS / UTILITIES
module.exports.getConfiguration = () => {
    return new Promise((resolve, reject) => {
        Database.get(
            "SELECT * FROM Configuration",
            [],
            (err, row) => {
                if (!err) {
                    resolve(row);
                } else {
                    reject(err);      
                }
            }
        )
    });
}

module.exports.updateConfiguration = (announcement, devNotice) => {
    return new Promise((resolve, reject) => {
        Database.run(
            "UPDATE Configuration SET Announcement = ?, DevNotice = ?",
            [announcement, devNotice],
            (err) => {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            }
        )
    });
}

