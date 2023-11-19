// CONSTANTS
const PermissionsService = require('../Services/PermissionsService');
const RobloxModerationService = require('../Services/RobloxModerationService');
const RobloxService = require('../Services/RobloxService');

// GATEWAY
module.exports.gatewayInfo = {
    Name: 'RobloxModeration',
    requiresAccessLevel: (user) => {
        return user.permissions.Flags.VIEW_ROBLOX_BANS && user.permissions.Flags.VIEW_ROBLOX_WARNINGS;
    }
}
module.exports.newSocket = (socket) => {
    // ALL GENERAL PERMITTED SOCKET ENDPOINTS
    socket.on('getAllRobloxBans', (callback) => {
        RobloxModerationService.getAllBans()
            .then(bans => {
                if (bans.length > 0) {
                    callback({message: 'Success', data: bans});
                } else {
                    callback({message: 'Not Found'});
                }
            }).catch((err) => {
                console.log(err);
                callback({message: 'Error'});
            });
    });

    socket.on('searchRobloxBan', (query, callback) => {
        if (!query) return callback({message: 'Error'});
        RobloxModerationService.searchBanAsync(query)
            .then(ban => {
                if (ban) {
                    callback({message: 'Success', data: ban});
                } else {
                    callback({message: 'Not Found'});
                }
            }).catch((err) => {
                console.log(err);
                callback({message: 'Error'});
            });
    });

    socket.on('getAllRobloxWarnings', async (callback) => {
        const { rbxID, moderator, evidence, reason, banType } = body;
        if (!rbxID || !moderator || !evidence || !reason || !banType) return callback({message: 'Error'});

        const outstanding_ban = await RobloxModerationService.searchBanAsync(rbxID);
        if (outstanding_ban) return callback({message: 'Ban Exists', data: outstanding_ban});

        RobloxModerationService.newBanAsync(rbxID, moderator, evidence, reason, banType)
            .then(ban => {
                callback({message: 'Success', data: ban});
            }).catch((err) => {
                console.log(err);
                callback({message: 'Error'});
            });
    });

    socket.on('searchRobloxWarning', async (query, callback) => {
        if (!query) return callback({message: 'Error'});
        RobloxModerationService.seachWarningAsync(query)
            .then(warning => {
                if (warning) {
                    callback({message: 'Success', data: warning});
                } else {
                    callback({message: 'Not Found'});
                }
            }).catch((err) => {
                console.log(err);
                callback({message: 'Error'});
            });
    });

    // PRIVILEGED
    if (socket.User.permissions.Flags.CREATE_ROBLOX_BANS) {
        socket.on('createRobloxBan', async (body, callback) => {
            const { rbxID, moderator, evidence, reason, banType } = body;
            if (!rbxID || !moderator || !evidence || !reason || !banType) return callback({message: 'Error'});
        
            const outstanding_ban = await RobloxModerationService.searchBanAsync(rbxID);
            if (outstanding_ban) return callback({message: 'Ban Exists', data: outstanding_ban});

            const rbxInfo = await RobloxService.getUserByID(rbxID);
            if (!rbxInfo) return callback({message: 'No Roblox User'});
        
            RobloxModerationService.newBanAsync(rbxID, moderator, evidence, reason, banType)
                .then(ban => {
                    ban.username = rbxInfo.name;
                    callback({message: 'Success', data: ban});
                }).catch((err) => {
                    console.log(err);
                    callback({message: 'Error'});
                });
        });
    }

    if (socket.User.permissions.Flags.UPDATE_ROBLOX_BANS) {
        socket.on('updateRobloxBan', async (body, callback) => {
            var { rbxID, moderator, evidence, reason, banType } = body;
            if (!rbxID || (!moderator && !evidence && !reason)) return callback({message: 'Error'});
        
            const outstanding_ban = await RobloxModerationService.searchBanAsync(rbxID);
            if (!outstanding_ban) return callback({message: 'Not Found'});

            var bannedOn = outstanding_ban.bannedOn;
        
            if (!moderator) moderator = outstanding_ban.moderator;
            if (!evidence) evidence = outstanding_ban.evidence;
            if (!reason) reason = outstanding_ban.reason;
            if (!banType) banType = outstanding_ban.banType;
            if (banType.Type != outstanding_ban.banType.Type) bannedOn = Math.round(Date.now() / 1000);
        
            RobloxModerationService.updateBanAsync(rbxID, moderator, evidence, reason, banType, bannedOn)
                .then(() => {
                    callback({message: 'Success'});
                }).catch((err) => {
                    console.log(err);
                    callback({message: 'Error'});
                });
        });
    }

    if (socket.User.permissions.Flags.DELETE_ROBLOX_BANS) {
        socket.on('deleteRobloxBan', async (body, callback) => {
            const { rbxID } = body;
            if (!rbxID) return callback({message: 'Error'});

            const outstanding_ban = await RobloxModerationService.searchBanAsync(rbxID);
            if (!outstanding_ban) return callback({message: 'Not Found'});

            RobloxModerationService.deleteBanAsync(rbxID)
                .then(() => {
                    callback({message: 'Success'});
                }).catch((err) => {
                    console.log(err);
                    callback({message: 'Error'});
                });
        });
    }

    if (socket.User.permissions.Flags.CREATE_ROBLOX_WARNINGS) {
        socket.on('createRobloxWarning', async (body, callback) => {
            const { rbxID, moderator, evidence, reason } = body;
            if (!rbxID || !moderator || !evidence || !reason) return callback({message: 'Error'});
        
            RobloxModerationService.newWarningAsync(rbxID, moderator, evidence, reason)
                .then(warning => {
                    callback({message: 'Success', data: warning});
                }).catch((err) => {
                    console.log(err);
                    callback({message: 'Error'});
                });
        });
    }

    if (socket.User.permissions.Flags.UPDATE_ROBLOX_WARNINGS) {
        socket.on('updateRobloxWarning', async (body, callback) => {
            var { warnID, moderator, evidence, reason, acknowledged } = body;
            if (!warnID || (!moderator && !evidence && !reason && !acknowledged)) return callback({message: 'Error'});
        
            const outstanding_warning = await RobloxModerationService.seachWarningAsync(warnID);
            if (!outstanding_warning) return callback({message: 'Not Found'});
        
            if (!moderator) moderator = outstanding_warning.moderator;
            if (!evidence) evidence = outstanding_warning.evidence;
            if (!reason) reason = outstanding_warning.reason;
            if (!acknowledged) acknowledged = outstanding_warning.acknowledged;
        
            RobloxModerationService.updateWarningAsync(warnID, moderator, evidence, reason, acknowledged)
                .then(() => {
                    callback({message: 'Success'});
                }).catch((err) => {
                    console.log(err);
                    callback({message: 'Error'});
                });
        });
    }

    if (socket.User.permissions.Flags.DELETE_ROBLOX_WARNINGS) {
        socket.on('deleteRobloxWarning', async (body, callback) => {
            const { warnID } = body;
            if (!warnID) return callback({message: 'Error'});

            const outstanding_warning = await RobloxModerationService.seachWarningAsync(warnID);
            if (!outstanding_warning) return callback({message: 'Not Found'});

            RobloxModerationService.deleteWarningAsync(warnID)
                .then(() => {
                    callback({message: 'Success'});
                }).catch((err) => {
                    console.log(err);
                    callback({message: 'Error'});
                });
        });
    }
};