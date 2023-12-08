// CONSTANTS
const sqlite3 = require('sqlite3').verbose();
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
module.exports.getAllBans = async () => {
    return new Promise((resolve, reject) => {
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

module.exports.getUserWarnings = async (rbxID) => {
    return new Promise((resolve, reject) => {
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
    });
};

module.exports.searchWarningAsync = async (query) => {
    return new Promise((resolve, reject) => {
        Database.get(
            `SELECT * FROM Warnings WHERE rbxID = ? OR warnID = ?`,
            [query, query],
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

module.exports.updateWarningAsync = async (warnID, moderator, evidence, reason, acknowledged) => {
    return new Promise((resolve, reject) => {
        Database.run(
            'UPDATE Warnings SET moderator = ?, evidence = ?, reason = ?, acknowledged = ? WHERE warnID = ?',
            [moderator, JSON.stringify(evidence || []), reason, acknowledged, warnID],
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

module.exports.deleteWarningAsync = async (warnID) => {
    return new Promise((resolve, reject) => {
        Database.run(
            'DELETE FROM Warnings WHERE warnID = ?',
            [warnID],
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
    var statistics = [
        new Promise((resolve, reject) => {
            Database.all(
                "SELECT strftime('%W', DATETIME(ROUND(bannedOn / 1000), 'localtime')) as Week, COUNT(*) as Bans FROM Bans GROUP BY Week LIMIT 5",
                [],
                (err, rows) => {
                    if (err) {
                        resolve(false);
                    } else {
                        resolve(rows);
                    }
                }
            )
        }),
        new Promise((resolve, reject) => {
            Database.all(
                "SELECT strftime('%W', DATETIME(ROUND(warnedOn / 1000), 'localtime')) as Week, COUNT(*) as Warnings FROM Warnings GROUP BY Week LIMIT 5",
                [],
                (err, rows) => {
                    if (err) {
                        resolve(false);
                    } else {
                        resolve(rows);
                    }
                }
            )
        }),
        new Promise((resolve, reject) => {
            Database.all(
                "SELECT strftime('%W', DATETIME(ROUND(Bans.bannedOn / 1000), 'localtime')) as Week, Bans.moderator AS Moderator, COUNT(*) AS Moderations FROM Bans GROUP BY Moderator, Week ORDER BY Week ASC, Moderations DESC LIMIT 1",
                [],
                (err, rows) => {
                    if (rows[0]) {
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
                "SELECT strftime('%W', DATETIME(ROUND(Warnings.warnedOn / 1000), 'localtime')) as Week, Warnings.moderator AS Moderator, COUNT(*) AS Moderations FROM Warnings GROUP BY Moderator, Week ORDER BY Week ASC, Moderations DESC LIMIT 1",
                [],
                (err, rows) => {
                    if (rows[0]) {
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