// CONSTANTS
const PermissionsService = require('../Services/PermissionsService');
const RobloxModerationService = require('../Services/RobloxModerationService');

// GATEWAY
module.exports.gatewayInfo = {
    Name: 'Statistics',
}

module.exports.newSocket = (socket) => {
    // ALL GENERAL PERMITTED SOCKET ENDPOINTS
    socket.on('getRobloxModerationStatistics', async (callback) => {
        RobloxModerationService.getStatistics().then(stats => {
            const [pastWeeksBans, pastWeeksWarnings, thisWeeksTopBanModerator, thisWeeksTopWarningModerator] = stats;
            callback({ 
                message: 'Success',
                pastWeeksBans,
                pastWeeksWarnings,
                thisWeeksTopBanModerator,
                thisWeeksTopWarningModerator
            });
        });
    });
}