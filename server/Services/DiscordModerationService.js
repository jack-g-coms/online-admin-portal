// CONSTANTS
const sqlite3 = require('sqlite3').verbose();
const moment = require("moment");
const uuid = require('uuid').v4;

const Database = new sqlite3.Database('./data/Moderations.db');
const tempDatabase = new sqlite3.Database('./data/Administration.db');
const cachedDiscordData = {};

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

tempDatabase.get(
    'SELECT * FROM Bans',
    (err, rows) => {
        console.log(rows);
        for (var i = 0; i < rows.length; i++) {

        }
    }
)

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
                        const linkedModeration = await this.getUserActiveModerationAsync(ban.discordID, ['Permanent Ban', 'Ban']);

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
            `SELECT * FROM DiscordModerations WHERE moderationID = ?`,
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

module.exports.getUserModerations = async (query, modType) => {
    return new Promise((resolve, reject) => {
        if (modType) {
            Database.all(
                `SELECT * FROM DiscordModerations WHERE discordID = ? AND moderationType = ? ORDER BY moderatedOn DESC`,
                [query + 'a', modType],
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
        } else {
            Database.all(
                `SELECT * FROM DiscordModerations WHERE discordID = ? ORDER BY moderatedOn DESC`,
                [query + 'a'],
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
        }
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

module.exports.getUserActiveModerationAsync = async (discordID, type) => {
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
        } else if (typeof type == 'object') {
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
        } else {
            Database.all(
                'SELECT * FROM DiscordModerations WHERE discordID = ? AND extraInfo != ?',
                [discordID + 'a', '{}'],
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

module.exports.getDiscordUserInfo = async (discordId) => {
    return new Promise((resolve, rejected) => {
        if (cachedDiscordData[discordId]) {
            return resolve(cachedDiscordData[discordId]);
        }

        if (process.DiscordAutomationSocket) {
            process.DiscordAutomationSocket.emit('getDiscordUserAutomation', discordId, (response) => {
                if (response.message == 'Success') {
                    cachedDiscordData[discordId] = response.data;
                    resolve(response.data);
                } else {
                    rejected();
                }
            });
        } else {
            rejected();
        }
    });
};

module.exports.getMonthlyStatistics = async () => {
    var month = moment().month() + 1;
    var statistics = [
        new Promise((resolve, reject) => {
            Database.all(
                "SELECT CAST(strftime('%m', DATETIME(bannedOn, 'unixepoch', 'localtime')) as decimal) as Month, COUNT(*) as Bans FROM DiscordBans WHERE strftime('%Y', DATETIME(bannedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Month ORDER BY Month DESC LIMIT 12",
                [],
                (err, rows) => {
                    if (err) {
                        resolve(false);
                    } else {
                        if (!rows[0] || rows[0].Month != month) {
                            rows.unshift({Month: month, Bans: 0});
                        }
                        resolve(rows);
                    }
                }
            )
        }),
        new Promise((resolve, reject) => {
            Database.all(
                "SELECT CAST(strftime('%m', DATETIME(moderatedOn, 'unixepoch', 'localtime')) as decimal) as Month, COUNT(*) as Moderations FROM DiscordModerations WHERE strftime('%Y', DATETIME(moderatedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Month ORDER BY Month DESC LIMIT 12",
                [],
                (err, rows) => {
                    if (err) {
                        resolve(false);
                    } else {
                        if (!rows[0] || rows[0].Month != month) {
                            rows.unshift({Month: month, Moderations: 0});
                        }
                        resolve(rows);
                    }
                }
            )
        })
    ];

    return Promise.all(statistics);
};

module.exports.getWeeklyStatistics = async () => {
    const week = moment().isoWeek();
    var statistics = [
        new Promise((resolve, reject) => {
            Database.all(
                "SELECT CAST(strftime('%W', DATETIME(bannedOn, 'unixepoch', 'localtime')) as decimal) as Week, COUNT(*) as Bans FROM DiscordBans WHERE strftime('%Y', DATETIME(bannedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Week ORDER BY Week DESC LIMIT 5",
                [],
                (err, rows) => {
                    if (err) {
                        resolve(false);
                    } else {
                        if (!rows[0] || rows[0].Week != week) {
                            rows.unshift({Week: week, Bans: 0});
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
                        if (!rows[0] || rows[0].Week != week) {
                            rows.unshift({Week: week, Moderations: 0});
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
                async (err, rows) => {
                    if (rows[0]) {
                        if (rows[0].Week != week) {
                            rows.unshift({Week: week, Moderator: 'none'});
                        } else {
                            var userDiscordInfo;
                            rows[0].Moderator = rows[0].Moderator.toString().substring(0, rows[0].Moderator.toString().length - 1);

                            try {
                                userDiscordInfo = await this.getDiscordUserInfo(rows[0].Moderator);
                            } catch {}

                            if (userDiscordInfo) {
                                rows[0].Moderator = userDiscordInfo.username;
                            }
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
                "SELECT CAST(strftime('%W', DATETIME(moderatedOn, 'unixepoch', 'localtime')) as decimal) as Week, moderator AS Moderator, COUNT(*) AS Moderations FROM DiscordModerations WHERE strftime('%Y', DATETIME(moderatedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Moderator, Week ORDER BY Week DESC, Moderations DESC LIMIT 1",
                [],
                async (err, rows) => {
                    if (rows[0]) {
                        if (rows[0].Week != week) {
                            rows.unshift({Week: week, Moderator: 'none'});
                        } else {
                            var userDiscordInfo;
                            rows[0].Moderator = rows[0].Moderator.toString().substring(0, rows[0].Moderator.toString().length - 1);

                            try {
                                userDiscordInfo = await this.getDiscordUserInfo(rows[0].Moderator);
                            } catch {}

                            if (userDiscordInfo) {
                                rows[0].Moderator = userDiscordInfo.username;
                            }
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