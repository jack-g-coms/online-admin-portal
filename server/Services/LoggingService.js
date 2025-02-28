// CONSTANTS
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const Database = new sqlite3.Database(path.join(__dirname, '..', '..', 'data', 'Database.db'));

const UsersService = require('./UsersService');
const uuid = require('uuid').v4;

const Log = class {
    constructor(row) {
        this.user = JSON.parse(row.user);
        this.action = row.action;
        this.timestamp = row.timestamp;
        this.logID = row.logID;
    }
};

// FUNCTIONS / UTILITIES
module.exports.getAllLogs = () => {
    return new Promise((resolve, reject) => {
        Database.all(
            'SELECT * FROM Logs ORDER BY timestamp DESC',
            (err, rows) => {
                if (!err) {
                    var resolved_rows = [];
                    for (var i = 0; i < rows.length; i++) {
                        resolved_rows.push(new Log(rows[i]));
                    }
                    resolve(resolved_rows)
                } else {
                    reject(err);
                }
            }
        )
    });
};

module.exports.newLog = (userId, action) => {
    return new Promise(async (resolve, reject) => {
        var timestamp = Math.round(Date.now() / 1000);
        var logID = uuid().substring(1, 15);

        var user = await UsersService.searchUserAsync(userId);
        if (!user) return reject('No User');

        delete user.savedEmbeds;

        Database.run(
            'INSERT INTO Logs(user,action,timestamp,logID) VALUES(?,?,?,?)',
            [JSON.stringify(user), action, timestamp, logID],
            (err) => {
                if (!err) {
                    resolve(new Log({
                        user: JSON.stringify(user), action, timestamp, logID
                    }));
                } else {
                    reject(err);
                }
            }
        )
    });
};

module.exports.deleteLog = (logID) => {
    return new Promise((resolve, reject) => {
        Database.run(
            'DELETE FROM Logs WHERE logID = ?',
            [logID],
            (err) => {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            }
        )
    });
};