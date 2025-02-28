// CONSTANTS
const PermissionsService = require('../Services/PermissionsService');
const DiscordModerationService = require('../Services/DiscordModerationService');
const LoggingService = require('../Services/LoggingService');

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

    socket.on('getDiscordModerationProfile', async (discordID, callback) => {
        if (!discordID) return callback({message: 'Error'});

        DiscordModerationService.getDiscordUserInfo(discordID)
            .then(async (discordUser) => {
                const ban = await DiscordModerationService.searchBanAsync(discordID);
                const moderations = await DiscordModerationService.getUserModerations(discordID);

                callback({message: 'Success', data: {
                    discordUser,
                    avatarHeadshotUrl: discordUser.displayAvatarURL,
                    ban,
                    moderations
                }});
            }).catch(() => {
                callback({message: 'Not Found'})
            });
        
    });

    socket.on('getUserDiscordModerations', (body, callback) => {
        const {discordid, modType} = body;
        if (!discordid) return callback({message: 'Error'});

        DiscordModerationService.getUserModerations(discordid, modType)
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

    socket.on('getUserActiveDiscordModerations', (body, callback) => {
        const {discordid, modType} = body;
        if (!discordid) return callback({message: 'Error'});

        DiscordModerationService.getUserActiveModerationAsync(discordid, modType)
            .then(moderations => {
                if ((!modType && moderations.length > 0) || (modType && moderations)) {
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
    if (socket.User.permissions.Flags.BOT_ACTIONS) {
        socket.on('sendDiscordEmbed', async (embedInfo, callback) => {
            if (!embedInfo) return callback({message: 'Error'});
            if (!embedInfo.messageSendType || (embedInfo.messageSendType == 'User' && !embedInfo.userID) || (embedInfo.messageSendType == 'Channel' && (!embedInfo.serverID || !embedInfo.channelID))) {
                callback({message: 'Error'});
                return;
            }
            if (!embedInfo.title) return callback({message: 'Error'});

            if (process.DiscordAutomationSocket) {
                process.DiscordAutomationSocket.emit('sendDiscordEmbedAutomation', embedInfo, (response) => {
                    callback(response);
                    LoggingService.newLog(socket.User.id, `${socket.User.rbxUser.username} executed a bot action: Send Embed`);
                });
            } else {
                callback({message: 'Error'});
            }
        });
    }

    if (socket.User.permissions.Flags.VIEW_GLOBAL_BANS) {
        socket.on('getAllGlobalBans', (callback) => {
            DiscordModerationService.getAllGlobalBans()
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

        socket.on('searchGlobalBan', (query, callback) => {
            DiscordModerationService.searchGlobalBan(query)
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
    }

    if (socket.User.permissions.Flags.CREATE_GLOBAL_BANS) {
        socket.on('createGlobalBan', async (body, callback) => {
            const { discordID, robloxID, moderator, reason } = body;
            if (!discordID || !moderator || !reason) return callback({message: 'Error'});

            const outstanding_ban = await DiscordModerationService.searchGlobalBan(discordID) || await DiscordModerationService.searchGlobalBan(robloxID);
            if (outstanding_ban) return callback({message: 'Ban Exists', data: outstanding_ban});

            process.io.to('Automation').emit('createDiscordModeration', {discordID, robloxID, moderator, moderationType: 'Global Ban', reason});
            callback({message: 'Success'});
            
            if (robloxID) {
                LoggingService.newLog(socket.User.id, `${socket.User.rbxUser.username} created a Global Ban for ${discordID} including a Roblox Ban for ${robloxID}`);
            } else {
                LoggingService.newLog(socket.User.id, `${socket.User.rbxUser.username} created a Global Ban for ${discordID} not including a Roblox Ban`);
            }
        });
    }

    if (socket.User.permissions.Flags.UPDATE_GLOBAL_BANS) {
        socket.on('updateGlobalBan', async (body, callback) => {
            var { identifier, moderator, reason } = body;
            if (!identifier) return callback({message: 'Error'});

            const outstanding_ban = await DiscordModerationService.searchGlobalBan(identifier);
            if (!moderator) moderator = outstanding_ban.moderator;
            if (!reason) reason = outstanding_ban.reason;

            DiscordModerationService.updateGlobalBan(identifier, moderator, reason)
                .then(() => {
                    callback({message: 'Success'});
                    LoggingService.newLog(socket.User.id, `${socket.User.rbxUser.username} updated Global Ban ${identifier}`);
                }).catch(() => {
                    callback({message: 'Error'});
                });
        });
    }

    if (socket.User.permissions.Flags.DELETE_GLOBAL_BANS) {
        socket.on('deleteGlobalBan', async (identifier, callback) => {
            if (!identifier) return callback({message: 'Error'});

            const outstanding_ban = await DiscordModerationService.searchGlobalBan(identifier);
            if (!outstanding_ban) return callback({message: 'Not Found'});

            process.io.to('Automation').emit('deleteGlobalBan', outstanding_ban);
            callback({message: 'Success'});
            LoggingService.newLog(socket.User.id, `${socket.User.rbxUser.username} deleted Global Ban ${identifier}`);
        });
    }

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
            LoggingService.newLog(socket.User.id, `${socket.User.rbxUser.username} created a Discord Ban for ${discordID}`);
        });
    }

    if (socket.User.permissions.Flags.UPDATE_DISCORD_BANS) {
        socket.on('updateDiscordBan', async (body, callback) => {
            var { discordID, moderator, evidence, reason, banType } = body;
            if (!discordID) return callback({message: 'Error'});
        
            const outstanding_ban = await DiscordModerationService.searchBanAsync(discordID);
            const linked_moderation = await DiscordModerationService.getUserActiveModerationAsync(discordID, ['Ban', 'Permanent Ban'])
            if (!outstanding_ban || !linked_moderation) return callback({message: 'Not Found'});

            var bannedOn = outstanding_ban.bannedOn;
        
            if (!moderator) moderator = outstanding_ban.moderator;
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
            LoggingService.newLog(socket.User.id, `${socket.User.rbxUser.username} updated Discord Ban ${discordID}`);
        });
    }

    if (socket.User.permissions.Flags.DELETE_DISCORD_BANS) {
        socket.on('deleteDiscordBan', async (body, callback) => {
            const { discordID } = body;
            if (!discordID) return callback({message: 'Error'});

            const activeModeration = await DiscordModerationService.getUserActiveModerationAsync(discordID, ['Ban', 'Permanent Ban']);
            const outstanding_ban = await DiscordModerationService.searchBanAsync(discordID);

            if (!outstanding_ban) return callback({message: 'Not Found'});

            process.io.to('Automation').emit('deactivateDiscordModeration', activeModeration);
            callback({message: 'Success'});
            LoggingService.newLog(socket.User.id, `${socket.User.rbxUser.username} deleted Discord Ban ${discordID}`);
        });
    }

    if (socket.User.permissions.Flags.CREATE_DISCORD_MODERATIONS) {
        socket.on('createDiscordModeration', async (body, callback) => {
            const { discordID, moderator, moderationType, evidence, extraInfo, reason } = body;
            if (!discordID || !moderator || !moderationType || !evidence || !reason) return callback({message: 'Error'});

            process.io.to('Automation').emit('createDiscordModeration', {discordID, moderator, moderationType, evidence, reason, extraInfo});
            callback({message: 'Success'});
            LoggingService.newLog(socket.User.id, `${socket.User.rbxUser.username} created a Discord Moderation of type ${moderationType} for ${discordID}`);
        });
    }

    if (socket.User.permissions.Flags.UPDATE_DISCORD_MODERATIONS) {
        socket.on('updateDiscordModeration', async (body, callback) => {
            var { moderationID, moderator, evidence, extraInfo, reason } = body;
            if (!moderationID) return callback({message: 'Not Found'});

            const outstanding_moderation = await DiscordModerationService.searchModerationAsync(moderationID);
            if (!outstanding_moderation) return callback({message: 'Not Found'});
            
            if (outstanding_moderation.isActive && (outstanding_moderation.moderationType == 'Ban' || outstanding_moderation.moderationType == 'Permanent Ban')) {
                return callback({message: 'Updating bans is not supported on the discord moderation page.'});
            }
        
            if (!moderator) moderator = outstanding_moderation.moderator;
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
            LoggingService.newLog(socket.User.id, `${socket.User.rbxUser.username} updated a Discord Moderation ${moderationID} for ${outstanding_moderation.discordID}`);
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
            LoggingService.newLog(socket.User.id, `${socket.User.rbxUser.username} deleted a Discord Moderation ${moderationID} for ${outstanding_moderation.discordID}`);
        });
    }
};