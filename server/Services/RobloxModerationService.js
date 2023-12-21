// CONSTANTS
const sqlite3 = require('sqlite3').verbose();
const moment = require("moment");
const uuid = require('uuid').v4;

const RobloxService = require("./RobloxService");
const Database = new sqlite3.Database('./data/Moderations.db');

// CLASSES
const Ban = class {
    constructor(row) {
        this.rbxID = row.rbxID;
        this.moderator = row.moderator;
        this.evidence = JSON.parse(row.evidence);
        this.reason = row.reason;
        this.banType = JSON.parse(row.banType);
        this.bannedOn = row.bannedOn;
    }
};

const Warning = class {
    constructor(row) {
        this.rbxID = row.rbxID;
        this.moderator = row.moderator;
        this.evidence = JSON.parse(row.evidence);
        this.reason = row.reason;
        this.acknowledged = row.acknowledged;
        this.warnedOn = row.warnedOn;
        this.warnID = row.warnID;
    }
};

// FUNCTIONS / UTILITIES
// ROBLOX / BANS
module.exports.getAllBans = async (limit) => {
    return new Promise((resolve, reject) => {
        if (!limit) {
            Database.all(
                'SELECT * FROM Bans ORDER BY bannedOn DESC',
                (err, rows) => {
                    if (!err) {
                        var resolved_rows = [];
                        for (var i = 0; i < rows.length; i++) {
                            resolved_rows.push(new Ban(rows[i]));
                        }
    
                        resolve(resolved_rows);
                    } else {
                        reject(err);
                    }
                }
            )
        } else {
            Database.all(
                'SELECT * FROM Bans ORDER BY bannedOn DESC LIMIT ?',
                [limit],
                (err, rows) => {
                    if (!err) {
                        var resolved_rows = [];
                        for (var i = 0; i < rows.length; i++) {
                            resolved_rows.push(new Ban(rows[i]));
                        }
    
                        resolve(resolved_rows);
                    } else {
                        reject(err);
                    }
                }
            )
        }
    });
};

module.exports.searchBanAsync = async (query) => {
    return new Promise((resolve, reject) => {
        Database.get(
            `SELECT * FROM Bans WHERE rbxID = ?`,
            [query],
            (err, row) => {
                if (!err) {
                    if (row) {
                        resolve(new Ban(row));
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

module.exports.newBanAsync = async (rbxID, moderator, evidence, reason, banType) => {
    const bannedOn = Math.round(Date.now() / 1000);

    return new Promise((resolve, reject) => {
        Database.run(
            'INSERT INTO Bans(rbxID, moderator, evidence, reason, banType, bannedOn) VALUES(?,?,?,?,?,?)',
            [rbxID, moderator, JSON.stringify(evidence || []), reason, JSON.stringify(banType), bannedOn],
            (err) => {
                if (!err) {
                    resolve(new Ban({rbxID, moderator, evidence: JSON.stringify(evidence), reason, banType: JSON.stringify(banType), bannedOn}));
                } else {
                    reject(err);
                }
            }
        )
    });
};

module.exports.updateBanAsync = async (rbxID, moderator, evidence, reason, banType, bannedOn) => {
    return new Promise((resolve, reject) => {
        Database.run(
            'UPDATE Bans SET moderator = ?, evidence = ?, reason = ?, banType = ?, bannedOn = ? WHERE rbxID = ?',
            [moderator, JSON.stringify(evidence || []), reason, JSON.stringify(banType || {}), bannedOn, rbxID],
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

module.exports.deleteBanAsync = async (rbxID) => {
    return new Promise((resolve, reject) => {
        Database.run(
            'DELETE FROM Bans WHERE rbxID = ?',
            [rbxID],
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

// ROBLOX / WARNINGS
module.exports.getAllWarnings = async () => {
    return new Promise((resolve, reject) => {
        Database.all(
            'SELECT * FROM Warnings ORDER BY warnedOn DESC',
            (err, rows) => {
                if (!err) {
                    var resolved_rows = [];
                    for (var i = 0; i < rows.length; i++) {
                        resolved_rows.push(new Warning(rows[i]));
                    }

                    resolve(resolved_rows);
                } else {
                    reject(err);
                }
            }
        )
    });
};

module.exports.getUserWarnings = async (rbxID, acknowledgement) => {
    return new Promise((resolve, reject) => {
        if (!acknowledgement) {
            Database.all(
                'SELECT * FROM Warnings WHERE rbxID = ? ORDER BY warnedOn DESC',
                [rbxID],
                (err, rows) => {
                    if (!err) {
                        var resolved_rows = [];
                        for (var i = 0; i < rows.length; i++) {
                            resolved_rows.push(new Warning(rows[i]));
                        }
    
                        resolve(resolved_rows);
                    } else {
                        reject(err);
                    }
                }
            )
        } else {
            Database.all(
                'SELECT * FROM Warnings WHERE rbxID = ? AND acknowledged = ? ORDER BY warnedOn DESC',
                [rbxID, acknowledgement],
                (err, rows) => {
                    if (!err) {
                        var resolved_rows = [];
                        for (var i = 0; i < rows.length; i++) {
                            resolved_rows.push(new Warning(rows[i]));
                        }
    
                        resolve(resolved_rows);
                    } else {
                        reject(err);
                    }
                }
            )
        }
    });
};

module.exports.searchWarningAsync = async (query) => {
    return new Promise((resolve, reject) => {
        Database.get(
            `SELECT * FROM Warnings WHERE warnID = ?`,
            [query],
            (err, row) => {
                if (!err) {
                    if (row) {
                        resolve(new Warning(row));
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

module.exports.newWarningAsync = async (rbxID, moderator, evidence, reason) => {
    const warnedOn = Math.round(Date.now() / 1000);
    const warnID = uuid().substring(1, 15);

    return new Promise((resolve, reject) => {
        Database.run(
            'INSERT INTO Warnings(rbxID, moderator, evidence, reason, acknowledged, warnedOn, warnID) VALUES(?,?,?,?,?,?,?)',
            [rbxID, moderator, JSON.stringify(evidence || []), reason, 0, warnedOn, warnID],
            (err) => {
                if (!err) {
                    resolve(new Warning({rbxID, moderator, evidence: JSON.stringify(evidence), reason, acknowledged: 0, warnedOn, warnID}));
                } else {
                    reject(err);
                }
            }
        )
    });
};

module.exports.updateWarningAsync = async (rbxID, warnID, moderator, evidence, reason, acknowledged) => {
    return new Promise((resolve, reject) => {
        Database.run(
            'UPDATE Warnings SET moderator = ?, evidence = ?, reason = ?, acknowledged = ? WHERE warnID = ? AND rbxID = ?',
            [moderator, JSON.stringify(evidence || []), reason, acknowledged, warnID, rbxID],
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

module.exports.deleteWarningAsync = async (rbxID, warnID) => {
    return new Promise((resolve, reject) => {
        Database.run(
            'DELETE FROM Warnings WHERE warnID = ? AND rbxID = ?',
            [warnID, rbxID],
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

module.exports.getStatistics = async () => {
    const week = moment().isoWeek();
    var statistics = [
        new Promise((resolve, reject) => {
            Database.all(
                "SELECT CAST(strftime('%W', DATETIME(bannedOn, 'unixepoch', 'localtime')) as decimal) as Week, COUNT(*) as Bans FROM Bans WHERE strftime('%Y', DATETIME(bannedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Week ORDER BY Week DESC LIMIT 5",
                [],
                (err, rows) => {
                    if (err) {
                        resolve(false);
                    } else {
                        if (rows[0] && rows[0].Week != week) {
                            rows.unshift({Week: week, Bans: 0});
                        } else if (!rows[0]) {
                            return resolve(false);
                        }
                        resolve(rows);
                    }
                }
            )
        }),
        new Promise((resolve, reject) => {
            Database.all(
                "SELECT CAST(strftime('%W', DATETIME(warnedOn, 'unixepoch', 'localtime')) as decimal) as Week, COUNT(*) as Warnings FROM Warnings WHERE strftime('%Y', DATETIME(warnedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Week ORDER BY Week DESC LIMIT 5",
                [],
                (err, rows) => {
                    if (err) {
                        resolve(false);
                    } else {
                        if (rows[0] && rows[0].Week != week) {
                            rows.unshift({Week: week, Warnings: 0});
                        } else if (!rows[0]) {
                            return resolve(false);
                        }
                        resolve(rows);
                    }
                }
            )
        }),
        new Promise((resolve, reject) => {
            Database.all(
                "SELECT CAST(strftime('%W', DATETIME(bannedOn, 'unixepoch', 'localtime')) as decimal) as Week, moderator AS Moderator, COUNT(*) AS Bans FROM Bans WHERE strftime('%Y', DATETIME(bannedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Moderator, Week ORDER BY Week DESC, Bans DESC LIMIT 1",
                [],
                (err, rows) => {
                    if (rows[0]) {
                        if (rows[0].Week != week) {
                            rows[0] = {Week: week, Moderator: 'none'};
                            resolve(rows[0]);
                        }

                        RobloxService.getUserByID(rows[0].Moderator)
                            .then(rbxUser => {
                                if (!rbxUser) return resolve(false);

                                rows[0].Moderator = rbxUser;
                                resolve(rows[0]);
                            });
                    } else {
                        resolve(false);
                    }
                }
            )
        }),
        new Promise((resolve, reject) => {
            Database.all(
                "SELECT CAST(strftime('%W', DATETIME(warnedOn, 'unixepoch', 'localtime')) as decimal) as Week, moderator AS Moderator, COUNT(*) AS Warnings FROM Warnings WHERE strftime('%Y', DATETIME(warnedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Moderator, Week ORDER BY Week DESC, Warnings DESC LIMIT 1",
                [],
                (err, rows) => {
                    if (rows[0]) {
                        if (rows[0].Week != week) {
                            rows[0] = {Week: week, Moderator: 'none'};
                            resolve(rows[0]);
                        }
                        
                        RobloxService.getUserByID(rows[0].Moderator)
                            .then(rbxUser => {
                                if (!rbxUser) return resolve(false);

                                rows[0].Moderator = rbxUser;
                                resolve(rows[0]);
                            });
                    } else {
                        resolve(false);
                    }
                }
            )
        })
    ];

    return Promise.all(statistics);
};