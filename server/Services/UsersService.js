// CONSTANTS
const sqlite3 = require('sqlite3').verbose();

const uuid = require('uuid').v4;
const fs = require('fs');
const bCrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PermissionsService = require('./PermissionsService');

const databaseExists = fs.existsSync('./data/Database.db');
const Database = new sqlite3.Database('./data/Database.db');

// INIT
Database.serialize(() => {
    if (!databaseExists) {
        Database.run(
            'CREATE TABLE Users(email TEXT, rbxUser TEXT, password TEXT, accountCreated INTEGER, id TEXT, permissionLevel INTEGER, verified INTEGER)'
        );
    }
});

// CLASSES
const User = class {
    #password; // Keep private, even if encrypted.
    constructor(row) {
        (async () => {
            this.email = row.email;
            this.rbxUser = JSON.parse(row.rbxUser);
            this.#password = row.password;
            this.accountCreated = row.accountCreated;
            this.id = row.id;
            this.permissions = PermissionsService.PERMISSION_SETS[row.permissionLevel]
            this.permissions.Level = row.permissionLevel;
            this.permissions.Flags = await PermissionsService.getFlags(row.permissionLevel);
            this.verified = row.verified == 1
        })();
    }

    login(password, callback) {
        bCrypt.compare(password, this.#password, callback);
    }

    createJSONWebToken(callback) {
        jwt.sign({secret: this.id}, '.OAUTHSECURE', callback);
    }
};

// FUNCTIONS / UTILITIES
module.exports.getAllUsers = async () => {
    return new Promise((resolve, reject) => {
        Database.all(
            'SELECT * FROM Users',
            (err, rows) => {
                if (!err) {
                    var resolved_rows = [];
                    for (var i = 0; i < rows.length; i++) {
                        resolved_rows.push(new User(rows[i]));
                    }

                    resolve(resolved_rows);
                } else {
                    reject();
                }
            }
        )
    });
};

module.exports.searchUserAsync = async (query) => {
    return new Promise((resolve, reject) => {
        Database.get(
            `SELECT * FROM Users WHERE email = ? OR json_extract(rbxUser, '$.username') = ? OR json_extract(rbxUser, '$.id') = ? OR id = ?`,
            [query, query, Number(query), query],
            (err, row) => {
                if (!err) {
                    if (row) {
                        resolve(new User(row));
                    } else {
                        resolve();
                    }
                } else {
                    reject(err);
                }
            }
        )
    });
};

module.exports.createUserAsync = async (email, rbxUser, password) => {
    return new Promise((resolve, reject) => {
        const user_id = uuid();
        const account_created = Math.round(Date.now() / 1000);

        bCrypt.genSalt(1, (err, salt) => {
            bCrypt.hash(password, salt, (err, hash) => {
                Database.run(
                    'INSERT INTO Users(email, rbxUser, password, accountCreated, id, permissionLevel, verified) VALUES(?,?,?,?,?,?,?)',
                    [email, JSON.stringify(rbxUser), hash, account_created, user_id, PermissionsService.DEFAULT_LEVEL, 0],
                    (err) => {
                        if (!err) {
                            resolve(new User({email, rbxUser: JSON.stringify(rbxUser), password: hash, accountCreated: account_created, id: user_id, permissionLevel: PermissionsService.DEFAULT_LEVEL, verified: 0}));
                        } else {
                            reject(err);
                        }
                    }
                )
            });
        });
    })
};

module.exports.updateUserAsync = async (id, email, rbxUser, permissionLevel, verified) => {
    return new Promise((resolve, reject) => {
        Database.run(
            'UPDATE Users SET email = ?, rbxUser = ?, permissionLevel = ?, verified = ? WHERE id = ?',
            [email, JSON.stringify(rbxUser), permissionLevel, verified, id],
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

module.exports.deleteUserAsync = async (id) => {
    return new Promise((resolve, reject) => {
        Database.run(
            'DELETE FROM Users WHERE id = ?',
            [id],
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