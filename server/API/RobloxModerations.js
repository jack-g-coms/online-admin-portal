// CONSTANTS
const ProtectionService = require('../Services/ProtectionService');
const RobloxModerationService = require('../Services/RobloxModerationService');
const Server = process.Server;

// GET
Server.get('/api/roblox/bans', ProtectionService.privilegedCall, ProtectionService.requiresAccessLevel, async (req, res) => {
    RobloxModerationService.getAllBans()
        .then(bans => {
            if (bans.length > 0) {
                res.json({message: 'Success', data: bans});
            } else {
                res.json({message: 'Not Found'});
            }
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

Server.get('/api/roblox/bans/search', ProtectionService.privilegedCall, ProtectionService.requiresAccessLevel, async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json({message: 'Error'});

    RobloxModerationService.searchBanAsync(query)
        .then(ban => {
            if (ban) {
                res.json({message: 'Success', data: ban});
            } else {
                res.json({message: 'Not Found'});
            }
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

Server.get('/api/roblox/warnings', ProtectionService.privilegedCall, ProtectionService.requiresAccessLevel, async (req, res) => {
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

Server.get('/api/roblox/warnings/search', ProtectionService.privilegedCall, ProtectionService.requiresAccessLevel, async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json({message: 'Error'});

    RobloxModerationService.seachWarningAsync(query)
        .then(warning => {
            if (warning) {
                res.json({message: 'Success', data: warning});
            } else {
                res.json({message: 'Not Found'});
            }
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

// POST
Server.post('/api/roblox/bans/create', ProtectionService.privilegedCall, ProtectionService.requiresAccessLevel, async (req, res) => {
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

Server.post('/api/roblox/bans/update', ProtectionService.privilegedCall, ProtectionService.requiresAccessLevel, async (req, res) => {
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

Server.post('/api/roblox/warnings/create', ProtectionService.privilegedCall, ProtectionService.requiresAccessLevel, async (req, res) => {
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

Server.post('/api/roblox/warnings/update', ProtectionService.privilegedCall, ProtectionService.requiresAccessLevel, async (req, res) => {
    var { warnID, moderator, evidence, reason, acknowledged } = req.body;
    if (!warnID || (!moderator && !evidence && !reason && !acknowledged)) return res.json({message: 'Error'});

    const outstanding_warning = await RobloxModerationService.seachWarningAsync(warnID);
    if (!outstanding_warning) return res.json({message: 'Not Found'});

    if (!moderator) moderator = outstanding_warning.moderator;
    if (!evidence) evidence = outstanding_warning.evidence;
    if (!reason) reason = outstanding_warning.reason;
    if (!acknowledged) acknowledged = outstanding_warning.acknowledged;

    RobloxModerationService.updateWarningAsync(warnID, moderator, evidence, reason, acknowledged)
        .then(() => {
            res.json({message: 'Success'});
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});