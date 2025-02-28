// CONSTANTS
const ProtectionService = require('../Services/ProtectionService');
const RobloxModerationService = require('../Services/RobloxModerationService');
const DiscordModerationService = require('../Services/DiscordModerationService');
const Server = process.Server;

// GET
Server.get('/api/statistics/weekly', ProtectionService.requiresRobloxPlaceId, ProtectionService.requiresAPIKey, async (req, res) => {
    const [pastWeeksBansRoblox, pastWeeksWarningsRoblox, thisWeeksTopBanModeratorRoblox, thisWeeksTopWarningModeratorRoblox] = await RobloxModerationService.getWeeklyStatistics();
    const [pastWeeksBansDiscord, pastWeeksModerationsDiscord, thisWeeksTopBanModeratorDiscord, thisWeeksTopModerationModeratorDiscord] = await DiscordModerationService.getWeeklyStatistics();

    res.json({
        message: 'Success',
        data: {
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
        }
    });
});
