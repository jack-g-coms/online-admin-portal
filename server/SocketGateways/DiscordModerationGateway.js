// CONSTANTS
const PermissionsService = require('../Services/PermissionsService');
const DiscordModerationService = require('../Services/DiscordModerationService');

// GATEWAY
module.exports.gatewayInfo = {
    Name: 'DiscordModeration',
    requiresAccessLevel: (user) => {
        return user.permissions.Flags.VIEW_DISCORD_BANS && user.permissions.Flags.VIEW_DISCORD_MODERATIONS;
    }
}

module.exports.newSocket = (socket) => {
    // ALL GENERAL PERMITTED SOCKET ENDPOINTS
    socket.on('getAllDiscordBans', (callback) => {
        DiscordModerationService.getAllBans()
            .then(bans => {
                if (bans.length > 0) {
                    callback({message: 'Success', data: bans});
                } else {
                    callback({message: 'Not Found'});
                }
            }).catch(() => {
                callback({message: 'Error'});
            });
    });

    socket.on('getAllDiscordModerations', (callback) => {
        DiscordModerationService.getAllModerations()
            .then(moderations => {
                if (moderations.length > 0) {
                    callback({message: 'Success', data: moderations});
                } else {
                    callback({message: 'Not Found'});
                }
            }).catch(() => {
                callback({message: 'Error'});
            });
    });

    socket.on('getUserDiscordModerations', (query, callback) => {
        DiscordModerationService.getUserModerations(query)
            .then(moderations => {
                if (moderations.length > 0) {
                    callback({message: 'Success', data: moderations});
                } else {
                    callback({message: 'Not Found'});
                }
            }).catch(() => {
                callback({message: 'Error'});
            });
    });

    socket.on('getActiveDiscordModerations', (callback) => {
        DiscordModerationService.getActiveModerations()
            .then(moderations => {
                if (moderations.length > 0) {
                    callback({message: 'Success', data: moderations});
                } else {
                    callback({message: 'Not Found'});
                }
            }).catch(() => {
                callback({message: 'Error'});
            });
    });

    socket.on('searchDiscordBan', (query, callback) => {
        if (!query) return callback({message: 'Error'});
        DiscordModerationService.searchBanAsync(query)
            .then(ban => {
                if (ban) {
                    callback({message: 'Success', data: ban});
                } else {
                    callback({message: 'Not Found'});
                }
            }).catch(() => {
                callback({message: 'Error'});
            });
    });

    socket.on('searchDiscordModeration', (query, callback) => {
        if (!query) return callback({message: 'Error'});
        DiscordModerationService.searchModerationAsync(query)
            .then(moderation => {
                if (moderation) {
                    callback({message: 'Success', data: moderation});
                } else {
                    callback({message: 'Not Found'});
                }
            }).catch(() => {
                callback({message: 'Error'});
            });
    });

    // PRIVILEGED
    if (socket.User.permissions.Flags.CREATE_DISCORD_BANS) {
        socket.on('createDiscordBan', async (body, callback) => {
            const { discordID, moderator, evidence, reason, banType } = body;
            if (!discordID || !moderator || !evidence || !reason || !banType) return callback({message: 'Error'});
        
            const outstanding_ban = await DiscordModerationService.searchBanAsync(discordID);
            if (outstanding_ban) return callback({message: 'Ban Exists', data: outstanding_ban});

            const modType = (banType.Type == 'Permanent' && 'Permanent Ban') || 'Ban';
            var extraInfo = {}
            if (banType.Type != "Permanent") {
                extraInfo = {length: banType.Time, expires: Math.round(Date.now() / 1000) + banType.Time}
            } else {
                extraInfo = {active: true}
            }
            if (!extraInfo.length && !extraInfo.expires && !extraInfo.active) return callback({message: 'Error'});

            process.io.to('Automation').emit('createDiscordModeration', {discordID, moderator, moderationType: modType, evidence, reason, extraInfo, banType});
            callback({message: 'Success'});
        });
    }

    if (socket.User.permissions.Flags.UPDATE_DISCORD_BANS) {
        socket.on('updateDiscordBan', async (body, callback) => {
            var { discordID, moderator, evidence, reason, banType } = body;
            if (!discordID) return callback({message: 'Error'});
        
            const outstanding_ban = await DiscordModerationService.searchBanAsync(discordID);
            const linked_moderation = await DiscordModerationService.getActiveModerationAsync(discordID, ['Ban', 'Permanent Ban'])
            if (!outstanding_ban || !linked_moderation) return callback({message: 'Not Found'});

            var bannedOn = outstanding_ban.bannedOn;
        
            if (!moderator) moderator = outstanding_ban.moderator + 'a';
            if (!evidence) evidence = outstanding_ban.evidence;
            if (!reason) reason = outstanding_ban.reason;
            if (!banType) banType = outstanding_ban.banType;

            var extraInfo = {};
            var modType = '';
            if (banType.Type != 'Permanent') {
                modType = 'Ban'
                extraInfo = {length: banType.Time, expires: bannedOn + banType.Time}
            } else {
                modType = 'Permanent Ban'
                extraInfo = {active: true}
            }

            if (!extraInfo.length && !extraInfo.expires && !extraInfo.active) return callback({message: 'Error'});;

            process.io.to('Automation').emit('updateDiscordModeration', linked_moderation, {discordID, moderator, moderationType: modType, evidence, reason, extraInfo, banType, bannedOn});
            callback({message: 'Success'});
        });
    }

    if (socket.User.permissions.Flags.DELETE_DISCORD_BANS) {
        socket.on('deleteDiscordBan', async (body, callback) => {
            const { discordID } = body;
            if (!discordID) return callback({message: 'Error'});

            const activeModeration = await DiscordModerationService.getActiveModerationAsync(discordID, ['Ban', 'Permanent Ban']);
            const outstanding_ban = await DiscordModerationService.searchBanAsync(discordID);

            if (!outstanding_ban) return callback({message: 'Not Found'});

            process.io.to('Automation').emit('deactivateDiscordModeration', activeModeration);
            callback({message: 'Success'});
        });
    }

    if (socket.User.permissions.Flags.CREATE_DISCORD_MODERATIONS) {
        socket.on('createDiscordModeration', async (body, callback) => {
            const { discordID, moderator, moderationType, evidence, extraInfo, reason } = body;
            if (!discordID || !moderator || !moderationType || !evidence || !reason) return callback({message: 'Error'});

            process.io.to('Automation').emit('createDiscordModeration', {discordID, moderator, moderationType, evidence, reason, extraInfo});
            callback({message: 'Success'});
        });
    }

    if (socket.User.permissions.Flags.UPDATE_DISCORD_MODERATIONS) {
        socket.on('updateDiscordModeration', async (body, callback) => {
            const { moderationID, moderator, evidence, extraInfo, reason } = body;
            if (!moderationID) return callback({message: 'Not Found'});

            const outstanding_moderation = await DiscordModerationService.searchModerationAsync(moderationID);
            if (!outstanding_moderation) return callback({message: 'Not Found'});
            
            if (outstanding_moderation.isActive && (outstanding_moderation.moderationType == 'Ban' || outstanding_moderation.moderationType == 'Permanent Ban')) {
                return callback({message: 'Updating bans is not supported on the discord moderation page.'});
            }
        
            if (!moderator) moderator = outstanding_moderation.moderator + 'a';
            if (!evidence) evidence = outstanding_moderation.evidence;
            if (!reason) reason = outstanding_moderation.reason;
            if (!extraInfo) extraInfo = outstanding_moderation.extraInfo;

            const new_moderation = {
                moderator,
                evidence,
                reason,
                extraInfo
            };

            process.io.to('Automation').emit('updateDiscordModeration', outstanding_moderation, new_moderation);
            callback({message: 'Success'});
        });
    }

    if (socket.User.permissions.Flags.DELETE_DISCORD_MODERATIONS) {
        socket.on('deleteDiscordModeration', async (body, callback) => {
            const { moderationID } = body;
            if (!moderationID) return callback({message: 'Not Found'});

            const outstanding_moderation = await DiscordModerationService.searchModerationAsync(moderationID);
            if (!outstanding_moderation) return callback({message: 'Not Found'});

            if (outstanding_moderation.isActive && (outstanding_moderation.moderationType == 'Ban' || outstanding_moderation.moderationType == 'Permanent Ban')) {
                return callback({message: 'Deleting active moderations of this type is not supported on the moderations page'});
            }

            process.io.to('Automation').emit('deleteDiscordModeration', outstanding_moderation);
            callback({message: 'Success'});
        });
    }
};