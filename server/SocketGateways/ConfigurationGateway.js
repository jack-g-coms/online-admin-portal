// CONSTANTS
const PermissionsService = require('../Services/PermissionsService');
const ConfigurationService = require('../Services/ConfigurationService');

// GATEWAY
module.exports.gatewayInfo = {
    Name: 'Configuration',
}

module.exports.newSocket = (socket) => {
    // ALL GENERAL PERMITTED SOCKET ENDPOINTS
    socket.on('getConfiguration', (callback) => {
        ConfigurationService.getConfiguration()
            .then(config => {
                callback(config);
            }).catch(err => callback(false));
    });

    socket.on('updateConfiguration', (announcement, callback) => {
        ConfigurationService.updateConfiguration(announcement || '')
            .then(() => {
                callback(announcement);
            }).catch(err => callback(false));
    });
}