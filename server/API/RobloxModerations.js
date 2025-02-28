// CONSTANTS
const ProtectionService = require('../Services/ProtectionService');
const RobloxService = require('../Services/RobloxService')
const RobloxModerationService = require('../Services/RobloxModerationService');
const Server = process.Server;

// GET
Server.get('/api/roblox/bans', ProtectionService.requiresRobloxPlaceId, ProtectionService.requiresAPIKey, (req, res) => {
    RobloxModerationService.getAllBans(50)
        .then(async bans => {
            if (bans.length > 0) {
                for (var i = 0; i < bans.length; i++) {
                    var rbxUser = await RobloxService.getUserByID(bans[i].rbxID);
                    bans[i].rbxUser = rbxUser;
                }
                res.json({message: 'Success', data: bans});
            } else {
                res.json({message: 'Not Found'});
            }
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

Server.get('/api/roblox/bans/search', ProtectionService.requiresRobloxPlaceId, ProtectionService.requiresAPIKey, (req, res) => {
    const { query } = req.query;
    if (!query) return res.json({message: 'Error'});

    RobloxModerationService.searchBanAsync(query)
        .then(async ban => {
            if (ban) {
                var rbxUser = await RobloxService.getUserByID(ban.rbxID);
                ban.rbxUser = rbxUser;
                
                res.json({message: 'Success', data: ban});
            } else {
                res.json({message: 'Not Found'});
            }
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

Server.get('/api/roblox/warnings', ProtectionService.requiresRobloxPlaceId, ProtectionService.requiresAPIKey, async (req, res) => {
    RobloxModerationService.getAllWarnings()
        .then(warnings => {
            if (warnings.length > 0) {
                res.json({message: 'Success', data: warnings});
            } else {
                res.json({message: 'Not Found'});
            }
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

Server.get('/api/roblox/warnings/search', ProtectionService.requiresRobloxPlaceId, ProtectionService.requiresAPIKey, async (req, res) => {
    const { query, acknowledgement } = req.query;
    if (!query) return res.json({message: 'Error'});

    RobloxModerationService.getUserWarnings(query, acknowledgement)
        .then(warnings => {
            if (warnings.length > 0) {
                res.json({message: 'Success', data: warnings});
            } else {
                res.json({message: 'Not Found'});
            }
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

// POST
Server.post('/api/roblox/bans/create', ProtectionService.requiresRobloxPlaceId, ProtectionService.requiresAPIKey, async (req, res) => {
    const { rbxID, moderator, evidence, reason, banType } = req.body;
    if (!rbxID || !moderator || !evidence || !reason || !banType) return res.json({message: 'Error'});

    const outstanding_ban = await RobloxModerationService.searchBanAsync(rbxID);
    if (outstanding_ban) return res.json({message: 'Ban Exists', data: outstanding_ban});

    RobloxModerationService.newBanAsync(rbxID, moderator, evidence, reason, banType)
        .then(ban => {
            res.json({message: 'Success', data: ban});
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

Server.post('/api/roblox/bans/delete', ProtectionService.requiresRobloxPlaceId, ProtectionService.requiresAPIKey, async (req, res) => {
    const { rbxID, moderator } = req.body;
    if (!rbxID || !moderator) return res.json({message: 'Error'});

    const outstanding_ban = await RobloxModerationService.searchBanAsync(rbxID);
    if (!outstanding_ban) return res.json({message: 'Not Found'});

    RobloxModerationService.deleteBanAsync(rbxID)
        .then(() => {
            res.json({message: 'Success'});
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

Server.post('/api/roblox/bans/update', ProtectionService.requiresRobloxPlaceId, ProtectionService.requiresAPIKey, async (req, res) => {
    var { rbxID, moderator, evidence, reason } = req.body;
    if (!rbxID || (!moderator && !evidence && !reason)) return res.json({message: 'Error'});

    const outstanding_ban = await RobloxModerationService.searchBanAsync(rbxID);
    if (!outstanding_ban) return res.json({message: 'Not Found'});

    if (!moderator) moderator = outstanding_ban.moderator;
    if (!evidence) evidence = outstanding_ban.evidence;
    if (!reason) reason = outstanding_ban.reason;

    RobloxModerationService.updateBanAsync(rbxID, moderator, evidence, reason)
        .then(() => {
            res.json({message: 'Success'});
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

Server.post('/api/roblox/warnings/create', ProtectionService.requiresRobloxPlaceId, ProtectionService.requiresAPIKey, async (req, res) => {
    const { rbxID, moderator, evidence, reason } = req.body;
    if (!rbxID || !moderator || !evidence || !reason) return res.json({message: 'Error'});

    RobloxModerationService.newWarningAsync(rbxID, moderator, evidence, reason)
        .then(warning => {
            res.json({message: 'Success', data: warning});
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

Server.post('/api/roblox/warnings/delete', ProtectionService.requiresRobloxPlaceId, ProtectionService.requiresAPIKey, async (req, res) => {
    const { rbxID, warnID, moderator } = req.body;
    if (!warnID || !rbxID || !moderator) return res.json({message: 'Error'});

    const outstanding_warning = await RobloxModerationService.searchWarningAsync(warnID);
    if (!outstanding_warning) return res.json({message: 'Not Found'});

    RobloxModerationService.deleteWarningAsync(rbxID, warnID)
        .then(() => {
            res.json({message: 'Success'});
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

Server.post('/api/roblox/warnings/update', ProtectionService.requiresRobloxPlaceId, ProtectionService.requiresAPIKey, async (req, res) => {
    var { rbxID, warnID, moderator, evidence, reason, acknowledged } = req.body;
    if (!warnID || !rbxID || (!moderator && !evidence && !reason && !acknowledged)) return res.json({message: 'Error'});

    const outstanding_warning = await RobloxModerationService.searchWarningAsync(warnID);
    if (!outstanding_warning) return res.json({message: 'Not Found'});

    if (!moderator) moderator = outstanding_warning.moderator;
    if (!evidence) evidence = outstanding_warning.evidence;
    if (!reason) reason = outstanding_warning.reason;
    if (!acknowledged) acknowledged = outstanding_warning.acknowledged;

    RobloxModerationService.updateWarningAsync(rbxID, warnID, moderator, evidence, reason, acknowledged)
        .then(() => {
            res.json({message: 'Success'});
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});