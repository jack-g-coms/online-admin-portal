// CONSTANTS
const PermissionsService = require('../Services/PermissionsService');
const ConfigurationService = require('../Services/ConfigurationService');

// GATEWAY
module.exports.gatewayInfo = {
    Name: 'Configuration',
    Unsecure: true
}

module.exports.newSocket = (socket) => {
    // ALL GENERAL PERMITTED SOCKET ENDPOINTS
    socket.on('getConfiguration', (callback) => {
        ConfigurationService.getConfiguration()
            .then(config => {
                callback(config);
            }).catch(err => callback(false));
    });

    // REQUIRES ACCESS LEVEL    
    if (socket.User && socket.User.permissions.Flags.CREATE_PORTAL_NOTICE) {
        socket.on('updateConfiguration', async (body, callback) => {
            var { announcement, devNotice } = body;
            const current_config = await ConfigurationService.getConfiguration();
    
            if (!announcement && announcement != '') announcement = current_config.Announcement;
            if (!devNotice && devNotice != '') devNotice = current_config.DevNotice;
    
            ConfigurationService.updateConfiguration(announcement, devNotice)
                .then(() => {
                    callback(true);
                }).catch(err => callback(false));
        });
    }
}