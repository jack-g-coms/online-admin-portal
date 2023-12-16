const fs = require('fs');
const ProtectionService = require('./Services/ProtectionService');

const io = process.io;
const gateways = {};

io.use(ProtectionService.privilegedSocket);
io.on('connection', (socket) => {
    var connected_gateways = [];
    for (var gateway in gateways) {
        gateway = gateways[gateway];
        if ((socket.User && gateway.gatewayInfo.requiresAccessLevel && gateway.gatewayInfo.requiresAccessLevel(socket.User)) || (!gateway.gatewayInfo.requiresAccessLevel && socket.User) || gateway.gatewayInfo.Unsecure) {
            gateway.newSocket(socket);
            connected_gateways.push(gateway.gatewayInfo.Name);
        }
        console.log(connected_gateways)
    }

    socket.Gateways = connected_gateways;
    socket.on('getConnectedGateways', (callback) => {
        callback(socket.Gateways);
    });

    // Ensure that emitted events are finding a listener or fail
    socket.onAny((eventName, ...args) => {
        if (Object.keys(socket._events).indexOf(eventName) == -1) {
            args[args.length - 1]({message: 'No Event Handler'});
        };
    });

    console.log(socket.User);

    // Join permitted rooms
    if (socket.User && socket.User.permissions.Name == 'Portal Automated System') {
        console.log(socket.User);
        socket.join('Automation');
    }
});

fs.readdir('./server/SocketGateways', (err, files) => {
    const jsFile = files.filter(f => f.split('.').pop() === 'js');
    if (jsFile.length <= 0) { return };

    jsFile.forEach((f, i) => {
        gateways[f] = require(`./SocketGateways/${f}`);
    });
});