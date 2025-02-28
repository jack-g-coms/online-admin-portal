const LoggingService = require('../Services/LoggingService');

// GATEWAY
module.exports.gatewayInfo = {
    Name: 'Logs',
    requiresAccessLevel: (user) => {
        return user.permissions.Flags.VIEW_LOGS;
    }
}

module.exports.newSocket = (socket) => {
    socket.on('getAllLogs', (callback) => {
        LoggingService.getAllLogs()
            .then(logs => {
                if (logs.length > 0) {
                    callback({message: 'Success', data: logs});
                } else {
                    callback({message: 'Not Found'});
                }
            }).catch(() => {
                console.log(err);
                callback({message: 'Error'});
            });
    });
}