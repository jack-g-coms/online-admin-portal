// CONSTANTS
const PermissionsService = require('../Services/PermissionsService');
const RobloxModerationService = require('../Services/RobloxModerationService');
const DiscordModerationService = require('../Services/DiscordModerationService');

// GATEWAY
module.exports.gatewayInfo = {
    Name: 'Statistics',
}

module.exports.newSocket = (socket) => {
    // ALL GENERAL PERMITTED SOCKET ENDPOINTS
    socket.on('getModerationStatistics', async (callback) => {
        const [pastWeeksBansRoblox, pastWeeksWarningsRoblox, thisWeeksTopBanModeratorRoblox, thisWeeksTopWarningModeratorRoblox] = await RobloxModerationService.getStatistics();
        const [pastWeeksBansDiscord, pastWeeksModerationsDiscord, thisWeeksTopBanModeratorDiscord, thisWeeksTopModerationModeratorDiscord] = await DiscordModerationService.getStatistics();

        callback({
            message: 'Success',
            Discord: {
                pastWeeksBans: pastWeeksBansDiscord,
                pastWeeksModerations: pastWeeksModerationsDiscord,
                thisWeeksTopBanModerator: thisWeeksTopBanModeratorDiscord,
                thisWeeksTopModerationModerator: thisWeeksTopModerationModeratorDiscord
            },
            Roblox: {
                pastWeeksBans: pastWeeksBansRoblox,
                pastWeeksWarnings: pastWeeksWarningsRoblox,
                thisWeeksTopBanModerator: thisWeeksTopBanModeratorRoblox,
                thisWeeksTopWarningModerator: thisWeeksTopWarningModeratorRoblox
            }
        });
    });
}