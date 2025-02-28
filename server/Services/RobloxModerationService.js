// CONSTANTS
const sqlite3 = require('sqlite3').verbose();
const moment = require("moment");
const uuid = require('uuid').v4;
const axios = require('axios');
const path = require('path');

const RobloxService = require("./RobloxService");
const RomeSupport = require("../API/RomeSupport");
const DiscordModerationService = require("./DiscordModerationService");
const Database = new sqlite3.Database(path.join(__dirname, '..', '..', 'data', 'Moderations.db'));

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

const SupportAccount = new RomeSupport.Account("staffheads@romestaff.com", "crazymonster2005");

// FUNCTIONS / UTILITIES
// ROBLOX / BANS
module.exports.sendMessage = async (topic, message) => {
    try {
        const response = await axios.post(
            `https://apis.roblox.com/messaging-service/v1/universes/1704509623/topics/${topic}`,
            {"message": JSON.stringify(message)},
            {headers: {
                'x-api-key': process.env.OPEN_CLOUD_KEY,
                'Content-Type': 'application/json'
            }}
        );

        if (response) {
            return response.status == 200;
        }
    } catch (err) {
        console.log(err)
        return false;
    }
};

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
            async (err) => {
                if (!err) {
                    await this.newWarningAsync(rbxID, moderator, evidence, `${reason} (Game Banned)`);
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

module.exports.getModeratorReport = async (from, to, moderator) => {
    var statistics = [
        new Promise((resolve, reject) => {
            Database.get(
                `SELECT COUNT(*) as count FROM Bans WHERE bannedOn <= ? AND bannedOn >= ? AND moderator = ?`,
                [to, from, moderator],
                (err, rows) => {
                    if (!err) {
                        resolve(rows);
                    } else {
                        reject(err);
                    }
                }
            )
        }),
        new Promise((resolve, reject) => {
            Database.get(
                `SELECT COUNT(*) as count FROM Warnings WHERE warnedOn <= ? AND warnedOn >= ? AND moderator = ?`,
                [to, from, moderator],
                (err, rows) => {
                    if (!err) {
                        resolve(rows);
                    } else {
                        reject(err);
                    }
                }
            )
        })
    ];

    return Promise.all(statistics);
};

module.exports.getModerationReport = async (from, to) => {
    var promises = [
        new Promise((resolve, reject) => {
            Database.all(
                `SELECT moderator AS Moderator, COUNT(*) AS RobloxBans FROM Bans WHERE bannedOn <= ? AND bannedOn >= ? GROUP BY moderator`,
                [to, from],
                (err, rows) => {
                    if (!err) {
                        var result = {};
                        for (var i = 0; i < rows.length; i++) {
                            result[rows[i].Moderator] = rows[i].RobloxBans
                        }
                        resolve(result);
                    } else {
                        reject(err);
                    }
                }
            )
        }),
        new Promise((resolve, reject) => {
            Database.all(
                `SELECT moderator AS Moderator, COUNT(*) AS RobloxWarnings FROM Warnings WHERE warnedOn <= ? AND warnedOn >= ? GROUP BY moderator`,
                [to, from],
                (err, rows) => {
                    if (!err) {
                        var result = {};
                        for (var i = 0; i < rows.length; i++) {
                            result[rows[i].Moderator] = rows[i].RobloxWarnings
                        }
                        resolve(result);
                    } else {
                        reject(err);
                    }
                }
            )
        }),
        new Promise((resolve, reject) => {
            Database.all(
                `SELECT moderator AS Moderator, COUNT(*) AS DiscordBans FROM DiscordBans WHERE bannedOn <= ? AND bannedOn >= ? GROUP BY moderator`,
                [to, from],
                (err, rows) => {
                    if (!err) {
                        var result = {};
                        for (var i = 0; i < rows.length; i++) {
                            rows[i].Moderator = rows[i].Moderator.toString().substring(0, rows[i].Moderator.toString().length - 1);
                            result[rows[i].Moderator] = rows[i].DiscordBans;
                        }
                        resolve(result);
                    } else {
                        reject(err);
                    }
                }
            )
        }),
        new Promise((resolve, reject) => {
            Database.all(
                `SELECT moderator AS Moderator, COUNT(*) AS DiscordModerations FROM DiscordModerations WHERE moderatedOn <= ? AND moderatedOn >= ? GROUP BY moderator`,
                [to, from],
                (err, rows) => {
                    if (!err) {
                        var result = {};
                        for (var i = 0; i < rows.length; i++) {
                            rows[i].Moderator = rows[i].Moderator.toString().substring(0, rows[i].Moderator.toString().length - 1);
                            result[rows[i].Moderator] = rows[i].DiscordModerations;
                        }
                        resolve(result);
                    } else {
                        reject(err);
                    }
                }
            )
        }),
    ];

    return new Promise(async(resolve, reject) => {
        var [rbxBans, rbxWarnings, disBans, disModerations] = await Promise.all(promises);
        var result = {};
        await SupportAccount.get();

        for (var mod in rbxBans) {
            var bans = rbxBans[mod];
            if (!result[mod]) result[mod] = {};
            result[mod].RobloxBans = bans;
        }

        for (var mod in rbxWarnings) {
            var warnings = rbxWarnings[mod];
            if (!result[mod]) result[mod] = {};
            result[mod].RobloxWarnings = warnings;
        }

        for (var mod in disBans) {
            var rbxId = await DiscordModerationService.discordToRbx(mod);
            var bans = disBans[mod];
            if (!rbxId) continue;
            if (!result[rbxId]) result[rbxId] = {};
            result[rbxId].DiscordBans = bans;
        }

        for (var mod in disModerations) {
            var rbxId = await DiscordModerationService.discordToRbx(mod);
            var moderations = disModerations[mod];
            if (!rbxId) continue;
            if (!result[rbxId]) result[rbxId] = {};
            result[rbxId].DiscordModerations = moderations;
        }

        for (var mod in result) {
            var row = result[mod];

            var user = await RobloxService.getUserByID(mod);
            var staffRank = await RobloxService.getGroupRank(mod, 5363208);
            var userSupport = await SupportAccount.sendAPI('get', `api/accounts/search?query=${mod}`);

            if (user) row.User = user;
            row.StaffRank = staffRank;
            if (userSupport.data) row.Tickets = userSupport.data.ticketsClaimed;

            var avatarHeadshotUrl = await RobloxService.getAvatarHeadshot(mod);
            if (!avatarHeadshotUrl.data.data.errors && avatarHeadshotUrl.data.data.length > 0) row.Headshot = avatarHeadshotUrl.data.data[0].imageUrl;

            if (!row.DiscordBans) row.DiscordBans = 0;
            if (!row.DiscordModerations) row.DiscordModerations = 0;
            if (!row.Tickets) row.Tickets = 0;
            if (!row.RobloxWarnings) row.RobloxWarnings = 0;
            if (!row.RobloxBans) row.RobloxBans = 0;
        }
        
        resolve(Object.values(result));
    });
};

module.exports.getMonthlyStatistics = async (year, month) => {
    var statistics = [
        new Promise((resolve, reject) => {
            if (year) {
                Database.all(
                    `SELECT CAST(strftime('%m', DATETIME(bannedOn, 'unixepoch', 'localtime')) as decimal) as Month, COUNT(*) as Bans FROM Bans WHERE strftime('%Y', DATETIME(bannedOn, 'unixepoch', 'localtime')) = ? GROUP BY Month ORDER BY Month DESC LIMIT 12`,
                    [String(year)],
                    (err, rows) => {
                        if (err) {
                            resolve(false);
                        } else {
                            resolve(rows);
                        }
                    }
                )
            } else {
                Database.all(
                    `SELECT CAST(strftime('%m', DATETIME(bannedOn, 'unixepoch', 'localtime')) as decimal) as Month, COUNT(*) as Bans FROM Bans WHERE strftime('%Y', DATETIME(bannedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Month ORDER BY Month DESC LIMIT 12`,
                    [],
                    (err, rows) => {
                        if (err) {
                            resolve(false);
                        } else {
                            resolve(rows);
                        }
                    }
                )
            }
        }),
        new Promise((resolve, reject) => {
            if (year) {
                Database.all(
                    `SELECT CAST(strftime('%m', DATETIME(warnedOn, 'unixepoch', 'localtime')) as decimal) as Month, COUNT(*) as Warnings FROM Warnings WHERE strftime('%Y', DATETIME(warnedOn, 'unixepoch', 'localtime')) = ? GROUP BY Month ORDER BY Month DESC LIMIT 12`,
                    [String(year)],
                    (err, rows) => {
                        if (err) {
                            resolve(false);
                        } else {
                            resolve(rows);
                        }
                    }
                ) 
            } else {
                Database.all(
                    `SELECT CAST(strftime('%m', DATETIME(warnedOn, 'unixepoch', 'localtime')) as decimal) as Month, COUNT(*) as Warnings FROM Warnings WHERE strftime('%Y', DATETIME(warnedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Month ORDER BY Month DESC LIMIT 12`,
                    [],
                    (err, rows) => {
                        if (err) {
                            resolve(false);
                        } else {
                            resolve(rows);
                        }
                    }
                )
            }
        }),
        new Promise((resolve, reject) => {
            Database.all(
                `SELECT RTRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(reason, '1', ''), '/', ''), '2', ''), '3', ''), '4', ''), '5', '')) as editedReason, CAST(strftime('%m', DATETIME(bannedOn, 'unixepoch', 'localtime')) as decimal) as Month, COUNT(reason) as Occurrences FROM Bans WHERE strftime('%Y', DATETIME(bannedOn, 'unixepoch', 'localtime')) = ? AND Month = ? GROUP BY editedReason, Month ORDER BY Month, Occurrences DESC LIMIT 5`,
                [String(year), month],
                (err, rows) => {
                    if (err) {
                        resolve(false);
                    } else {
                        var formattedResults = [];
                        for (var i = 0; i < rows.length; i++) {
                            formattedResults.push(rows[i].editedReason);
                        }
                        resolve(formattedResults);
                    }
                }
            )
        }),
        new Promise((resolve, reject) => {
            Database.all(
                `SELECT RTRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(reason, '1', ''), '/', ''), '2', ''), '3', ''), '4', ''), '5', '')) as editedReason, CAST(strftime('%m', DATETIME(warnedOn, 'unixepoch', 'localtime')) as decimal) as Month, COUNT(reason) as Occurrences FROM Warnings WHERE strftime('%Y', DATETIME(warnedOn, 'unixepoch', 'localtime')) = ? AND Month = ? GROUP BY editedReason, Month ORDER BY Month, Occurrences DESC LIMIT 5`,
                [String(year), month],
                (err, rows) => {
                    if (err) {
                        resolve(false);
                    } else {
                        var formattedResults = [];
                        for (var i = 0; i < rows.length; i++) {
                            formattedResults.push(rows[i].editedReason);
                        }
                        resolve(formattedResults);
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
                "SELECT CAST(strftime('%W', DATETIME(bannedOn, 'unixepoch', 'localtime')) as decimal) as Week, COUNT(*) as Bans FROM Bans WHERE strftime('%Y', DATETIME(bannedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Week ORDER BY Week DESC LIMIT 5",
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
                "SELECT CAST(strftime('%W', DATETIME(warnedOn, 'unixepoch', 'localtime')) as decimal) as Week, COUNT(*) as Warnings FROM Warnings WHERE strftime('%Y', DATETIME(warnedOn, 'unixepoch', 'localtime')) = strftime('%Y', DATE('now')) GROUP BY Week ORDER BY Week DESC LIMIT 5",
                [],
                (err, rows) => {
                    if (err) {
                        resolve(false);
                    } else {
                        if (!rows[0] || rows[0].Week != week) {
                            rows.unshift({Week: week, Warnings: 0});
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