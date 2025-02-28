// CONSTANTS
const PermissionsService = require('../Services/PermissionsService');
const DiscordModerationService = require('../Services/DiscordModerationService');
const RobloxModerationService = require('../Services/RobloxModerationService');

// GATEWAY
module.exports.gatewayInfo = {
    Name: 'Automation',
    requiresAccessLevel: (user) => {
        return user.permissions.Name == 'Portal Automated System';
    }
}

module.exports.newSocket = (socket) => {
    // DISCORD MODERATION
    socket.on('deactivatedDiscordModerationAutomation', async (moderationID, callback) => {
        const moderation = await DiscordModerationService.searchModerationAsync(moderationID);
        if (!moderation) callback({message: 'Not Found'});

        if (moderation.moderationType == 'Ban' || moderation.moderationType == 'Permanent Ban') {
            DiscordModerationService.deleteBanAsync(moderation.discordID)
                .catch(() => {
                    callback({message: 'Error'});
                });
        }

        DiscordModerationService.updateModerationAsync(moderationID, moderation.moderationType, moderation.moderator, moderation.evidence, moderation.reason, {})
            .then(() => {
                callback({message: 'Success'});
            }).catch(() => {
                callback({message: 'Error'});
            });
    });

    socket.on('deletedDiscordModerationAutomation', async (moderationID, callback) => {
        const moderation = await DiscordModerationService.searchModerationAsync(moderationID);
        if (!moderation) callback({message: 'Not Found'});

        DiscordModerationService.deleteModerationAsync(moderationID)
            .then(() => {
                callback({message: 'Success'});
            }).catch(() => {
                callback({message: 'Error'});
            });
    });

    socket.on('updatedDiscordModerationAutomation', async (moderationID, updatedModeration, callback) => {
        const moderation = await DiscordModerationService.searchModerationAsync(moderationID);
        if (!moderation) callback({message: 'Not Found'});

        if (updatedModeration.moderationType == 'Ban' || updatedModeration.moderationType == 'Permanent Ban') {
            DiscordModerationService.updateBanAsync(updatedModeration.discordID, updatedModeration.moderator || moderation.moderator, updatedModeration.evidence || moderation.evidence, updatedModeration.reason || moderation.reason, updatedModeration.banType, updatedModeration.bannedOn)
                .catch(() => {
                    callback({message: 'Error'});
                });
        }

        DiscordModerationService.updateModerationAsync(moderationID, updatedModeration.moderationType || moderation.moderationType, updatedModeration.moderator || moderation.moderator, updatedModeration.evidence || moderation.evidence, updatedModeration.reason || moderation.reason, updatedModeration.extraInfo || {})
            .then(() => {
                callback({message: 'Success'});
            }).catch(() => {
                callback({message: 'Error'});
            });
    });

    socket.on('createdDiscordModerationAutomation', async (newModeration, callback) => {
        if (newModeration.moderationType == 'Ban' || newModeration.moderationType == 'Permanent Ban') {
            DiscordModerationService.newBanAsync(newModeration.discordID, newModeration.moderator, newModeration.evidence, newModeration.reason, newModeration.banType)
                .catch(() => {
                    callback({message: 'Error'});
                });
        } else if (newModeration.moderationType == 'Global Ban') {
            try {
                const gBan = await DiscordModerationService.newGlobalBan(newModeration.discordID, newModeration.robloxID, newModeration.moderator, newModeration.reason);
                if (newModeration.robloxID) {
                    const rbxBan = await RobloxModerationService.searchBanAsync(newModeration.robloxID);
                    if (rbxBan) {
                        await RobloxModerationService.updateBanAsync(newModeration.robloxID, rbxBan.moderator, rbxBan.evidence, `${rbxBan.reason} -> Global Ban`, {Type: 'Permanent'}, rbxBan.bannedOn);
                    } else {
                        const newBan = await RobloxModerationService.newBanAsync(newModeration.robloxID, 4847290779, [], 'Global Ban', {Type: 'Permanent'});
                        RobloxModerationService.sendMessage('applyModeration', Object.assign({}, {modType: 'Ban'}, newBan));
                    }
                }
                callback({message: 'Success', data: gBan});
            } catch {
                callback({message: 'Error'});
            }
            return
        }

        DiscordModerationService.newModerationAsync(newModeration.discordID, newModeration.moderator, newModeration.moderationType, newModeration.evidence, newModeration.extraInfo || {}, newModeration.reason)
            .then(moderation => {
                callback({message: 'Success', data: moderation});
            }).catch((err) => {
                callback({message: 'Error'});
            });
    });

    socket.on('deletedGlobalBanAutomation', async (discordID, callback) => {
        const outstanding_ban = await DiscordModerationService.searchGlobalBan(discordID);
        if (!outstanding_ban) callback({message: 'Not Found'});

        try {
            await DiscordModerationService.deleteGlobalBan(discordID);
            if (outstanding_ban.robloxID) {
                const ban = await RobloxModerationService.searchBanAsync(outstanding_ban.robloxID);
                if (ban && ban.reason.includes('Global Ban')) {
                    await RobloxModerationService.deleteBanAsync(outstanding_ban.robloxID);
                }
            }
            callback({message: 'Success'});
        } catch {
            callback({message: 'Error'});
        }
    });
}