// CONSTANTS
const sqlite3 = require('sqlite3').verbose();
const uuid = require('uuid').v4;

const Database = new sqlite3.Database('./data/Moderations.db');

// CLASSES
const Ban = class {
    constructor(row) {
        this.discordID = row.discordID.toString().substring(0, row.discordID.toString().length - 1);
        this.moderator = row.moderator.toString().substring(0, row.moderator.toString().length - 1);
        this.evidence = JSON.parse(row.evidence);
        this.reason = row.reason;
        this.banType = JSON.parse(row.banType);
        this.bannedOn = row.bannedOn;
    }
};

const Moderation = class {
    constructor(row) {
        this.discordID = row.discordID.toString().substring(0, row.discordID.toString().length - 1);
        this.moderator = row.moderator.toString().substring(0, row.moderator.toString().length - 1);
        this.moderationType = row.moderationType;
        this.evidence = JSON.parse(row.evidence);
        this.reason = row.reason;
        this.moderatedOn = row.moderatedOn;
        this.moderationID = row.moderationID;
        this.extraInfo = JSON.parse(row.extraInfo);
        this.isActive = row.extraInfo != '{}';
    }
};

// FUNCTIONS / UTILITIES
// DISCORD / BANS
module.exports.getAllBans = async () => {
    return new Promise((resolve, reject) => {
        Database.all(
            'SELECT * FROM DiscordBans ORDER BY bannedOn DESC',
            async (err, rows) => {
                if (!err) {
                    var resolved_rows = [];
                    for (var i = 0; i < rows.length; i++) {
                        const ban = new Ban(rows[i]);
                        const linkedModeration = await this.getActiveModerationAsync(ban.discordID, ['Permanent Ban', 'Ban']);

                        if (linkedModeration) {
                            ban.linkedModeration = linkedModeration;
                        }
                        resolved_rows.push(ban);
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
            `SELECT * FROM DiscordBans WHERE discordID = ?`,
            [query + 'a'],
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

module.exports.newBanAsync = async (discordID, moderator, evidence, reason, banType) => {
    const bannedOn = Math.round(Date.now() / 1000);

    return new Promise((resolve, reject) => {
        Database.run(
            'INSERT INTO DiscordBans(discordID, moderator, evidence, reason, banType, bannedOn) VALUES(?,?,?,?,?,?)',
            [discordID + 'a', moderator + 'a', JSON.stringify(evidence || []), reason, JSON.stringify(banType), bannedOn],
            (err) => {
                if (!err) {
                    resolve(new Ban({discordID: discordID + 'a', moderator: moderator + 'a', evidence: JSON.stringify(evidence), reason, banType: JSON.stringify(banType), bannedOn}));
                } else {
                    reject(err);
                }
            }
        )
    });
};

module.exports.updateBanAsync = async (discordID, moderator, evidence, reason, banType, bannedOn) => {
    return new Promise((resolve, reject) => {
        Database.run(
            'UPDATE DiscordBans SET moderator = ?, evidence = ?, reason = ?, banType = ?, bannedOn = ? WHERE discordID = ?',
            [moderator + 'a', JSON.stringify(evidence || []), reason, JSON.stringify(banType || {}), bannedOn, discordID + 'a'],
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

module.exports.deleteBanAsync = async (discordID) => {
    return new Promise((resolve, reject) => {
        Database.run(
            'DELETE FROM DiscordBans WHERE discordID = ?',
            [discordID + 'a'],
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

// DISCORD / MODERATIONS
module.exports.getAllModerations = async () => {
    return new Promise((resolve, reject) => {
        Database.all(
            'SELECT * FROM DiscordModerations ORDER BY moderatedOn DESC',
            (err, rows) => {
                if (!err) {
                    var resolved_rows = [];
                    for (var i = 0; i < rows.length; i++) {
                        resolved_rows.push(new Moderation(rows[i]));
                    }

                    resolve(resolved_rows);
                } else {
                    reject(err);
                }
            }
        )
    });
};

module.exports.searchModerationAsync = async (query) => {
    return new Promise((resolve, reject) => {
        Database.get(
            `SELECT * FROM DiscordBans WHERE moderationID = ?`,
            [query],
            (err, row) => {
                if (!err) {
                    if (row) {
                        resolve(new Moderation(row));
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

module.exports.getActiveModerations = async () => {
    return new Promise((resolve, reject) => {
        Database.all(
            'SELECT * FROM DiscordModerations WHERE extraInfo != ? ORDER BY moderatedOn DESC',
            ['{}'],
            (err, rows) => {
                if (!err) {
                    var resolved_rows = [];
                    for (var i = 0; i < rows.length; i++) {
                        resolved_rows.push(new Moderation(rows[i]));
                    }

                    resolve(resolved_rows);
                } else {
                    reject(err);
                }
            }
        )
    });
};

module.exports.getActiveModerationAsync = async (discordID, type) => {
    return new Promise((resolve, reject) => {
        if (typeof type == 'string') {
            Database.get(
                'SELECT * FROM DiscordModerations WHERE discordID = ? AND moderationType = ? AND extraInfo != ?',
                [discordID + 'a', type, '{}'],
                (err, row) => {
                    if (!err) {
                        if (row) {
                            resolve(new Moderation(row));
                        } else {
                            resolve();
                        }
                    } else {
                        reject(err);
                    }
                }
            )
        } else {
            Database.get(
                'SELECT * FROM DiscordModerations WHERE discordID = ? AND moderationType IN (?,?) AND extraInfo != ?',
                [discordID + 'a', type[0], type[1], '{}'],
                (err, row) => {
                    if (!err) {
                        if (row) {
                            resolve(new Moderation(row));
                        } else {
                            resolve();
                        }
                    } else {
                        reject(err);
                    }
                }
            )
        }
    });
};

module.exports.newModerationAsync = async (discordID, moderator, moderationType, evidence, extraInfo, reason) => {
    const moderatedOn = Math.round(Date.now() / 1000);
    const moderationID = uuid().substring(1, 15);

    return new Promise((resolve, reject) => {
        Database.run(
            'INSERT INTO DiscordModerations(discordID, moderator, moderationType, evidence, reason, moderatedOn, moderationID, extraInfo) VALUES(?,?,?,?,?,?,?,?)',
            [discordID + 'a', moderator + 'a', moderationType, JSON.stringify(evidence), reason, moderatedOn, moderationID, JSON.stringify(extraInfo || {})],
            (err) => {
                if (!err) {
                    resolve(new Moderation({discordID: discordID + 'a', moderator: moderator + 'a', moderationType, evidence: JSON.stringify(evidence), reason, moderatedOn, moderationID, extraInfo: JSON.stringify(extraInfo || {})}));
                } else {
                    reject(err);
                }
            }
        )
    });
};

module.exports.updateModerationAsync = async (moderationID, moderationType, moderator, evidence, reason, extraInfo) => {
    return new Promise((resolve, reject) => {
        Database.run(
            'UPDATE DiscordModerations SET moderator = ?, moderationType = ?, evidence = ?, reason = ?, extraInfo = ? WHERE moderationID = ?',
            [moderator + 'a', moderationType, JSON.stringify(evidence), reason, JSON.stringify(extraInfo || {}), moderationID],
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

module.exports.deleteModerationAsync = async (moderationID) => {
    return new Promise((resolve, reject) => {
        Database.run(
            'DELETE FROM DiscordModerations WHERE moderationID = ?',
            [moderationID],
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
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), 0, 1);
    const week = Math.ceil((((currentDate.getTime() - firstDay.getTime()) / 86400000) + firstDay.getDay() + 1) / 7);

    var statistics = [
        new Promise((resolve, reject) => {
            Database.all(
                "SELECT CAST(strftime('%W', DATETIME(bannedOn, 'unixepoch', 'localtime')) as decimal) as Week, COUNT(*) as Bans FROM DiscordBans WHERE strftime('%Y', DATETIME(bannedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Week ORDER BY Week DESC LIMIT 5",
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
                "SELECT CAST(strftime('%W', DATETIME(moderatedOn, 'unixepoch', 'localtime')) as decimal) as Week, COUNT(*) as Moderations FROM DiscordModerations WHERE strftime('%Y', DATETIME(moderatedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Week ORDER BY Week DESC LIMIT 5",
                [],
                (err, rows) => {
                    if (err) {
                        resolve(false);
                    } else {
                        if (rows[0] && rows[0].Week != week) {
                            rows.unshift({Week: week, Moderations: 0});
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
                "SELECT CAST(strftime('%W', DATETIME(bannedOn, 'unixepoch', 'localtime')) as decimal) as Week, moderator AS Moderator, COUNT(*) AS Bans FROM DiscordBans WHERE strftime('%Y', DATETIME(bannedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Moderator, Week ORDER BY Week DESC, Bans DESC LIMIT 1",
                [],
                (err, rows) => {
                    if (rows[0]) {
                        if (rows[0].Week != week) {
                            rows.unshift({Week: week, Moderator: 'none'});
                        } else {
                            rows[0].Moderator = rows[0].Moderator.toString().substring(0, rows[0].Moderator.toString().length - 1);
                        }
                        resolve(rows[0]);
                    } else {
                        resolve(false);
                    }
                }
            )
        }),
        new Promise((resolve, reject) => {
            Database.all(
                "SELECT strftime('%W', DATETIME(ROUND(DiscordModerations.moderatedOn / 1000), 'localtime')) as Week, DiscordModerations.moderator AS Moderator, COUNT(*) AS Moderations FROM DiscordModerations GROUP BY Moderator, Week ORDER BY Week ASC, Moderations DESC LIMIT 1",
                [],
                (err, rows) => {
                    if (rows[0]) {
                        if (rows[0].Week != "00") {
                            rows.unshift({Week: '00', Moderator: 'none'});
                        } else {
                            rows[0].Moderator = rows[0].Moderator.toString().substring(0, rows[0].Moderator.toString().length - 1);
                        }
                        resolve(rows[0]);
                    } else {
                        resolve(false);
                    }
                }
            )
        })
    ];

    return Promise.all(statistics);
};