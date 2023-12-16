// CONSTANTS
const PermissionsService = require('../Services/PermissionsService');
const DiscordModerationService = require('../Services/DiscordModerationService');

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

    socket.on('updatedDiscordModerationAutomation', async (moderationID, updatedModeration) => {
        const moderation = await DiscordModerationService.searchModerationAsync(moderationID);
        if (!moderation) callback({message: 'Not Found'});

        if (updatedModeration.moderationType == 'Ban' || updatedModeration.moderationType == 'Permanent Ban') {
            DiscordModerationService.updateBanAsync(updatedModeration.discordID, updatedModeration.moderator, updatedModeration.evidence, updatedModeration.reason, updatedModeration.banType, updatedModeration.bannedOn)
                .catch(() => {
                    callback({message: 'Error'});
                });
        }

        DiscordModerationService.updateModerationAsync(moderationID, updatedModeration.moderationType, updatedModeration.moderator, updatedModeration.evidence, updatedModeration.reason, updatedModeration.extraInfo || {})
            .then(() => {
                callback({message: 'Success'});
            }).catch(() => {
                callback({message: 'Error'});
            });
    });

    socket.on('createdDiscordModerationAutomation', async (newModeration) => {
        if (newModeration.moderationType == 'Ban' || newModeration.moderationType == 'Permanent Ban') {
            DiscordModerationService.newBanAsync(newModeration.discordID, newModeration.moderator, newModeration.evidence, newModeration.reason, newModeration.banType)
                .catch(() => {
                    callback({message: 'Error'});
                });
        }

        DiscordModerationService.newModerationAsync(newModeration.discordID, newModeration.moderator, newModeration.moderationType, newModeration.evidence, newModeration.extraInfo || {}, newModeration.reason)
            .then(moderation => {
                callback({message: 'Success', data: moderation});
            }).catch((err) => {
                callback({message: 'Error'});
            });
    });
}