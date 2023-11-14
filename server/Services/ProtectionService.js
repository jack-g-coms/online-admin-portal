// CONSTANTS
const UsersService = require('./UsersService');
const PermissionsService = require('./PermissionsService');
const jwt = require('jsonwebtoken');

const ENDPOINT_PERMISSION_FLAGS = {
    '/api/users': PermissionsService.PERMISSION_FLAGS.MANAGE_USERS,
    '/api/users/update': PermissionsService.PERMISSION_FLAGS.MANAGE_USERS,
    '/api/users/delete': PermissionsService.PERMISSION_FLAGS.DELETE_USERS,

    '/api/roblox/bans': PermissionsService.PERMISSION_FLAGS.VIEW_ROBLOX_BANS,
    '/api/roblox/bans/search': PermissionsService.PERMISSION_FLAGS.VIEW_ROBLOX_BANS,
    '/api/roblox/bans/create': PermissionsService.PERMISSION_FLAGS.CREATE_ROBLOX_BANS,
    '/api/roblox/bans/update': PermissionsService.PERMISSION_FLAGS.UPDATE_ROBLOX_BANS,
    '/api/roblox/warnings': PermissionsService.PERMISSION_FLAGS.VIEW_ROBLOX_WARNINGS,
    '/api/roblox/warnings/create': PermissionsService.PERMISSION_FLAGS.CREATE_ROBLOX_WARNINGS,
    '/api/roblox/warnings/update': PermissionsService.PERMISSION_FLAGS.UPDATE_ROBLOX_WARNINGS,
    '/api/roblox/warnings/search': PermissionsService.PERMISSION_FLAGS.VIEW_ROBLOX_WARNINGS
}

// FUNCTIONS
module.exports.privilegedSocket = async(socket, next) => {
    const bearerToken = (socket.handshake.headers.cookie && socket.handshake.headers.cookie.substring(14));

    if (typeof bearerToken != "undefined") {
        if (typeof bearerToken == "undefined") {
            return next(new Error('Unauthorized'));
        }

        jwt.verify(bearerToken, ".OAUTHSECURE", (err, agent) => {
            if (typeof agent == "undefined") {
                return next(new Error('Unauthorized'));
            } else {
                UsersService.searchUserAsync(agent.secret || agent.user.secret)
                    .then((user) => {
                        socket.User = user;
                        next();
                    })
                    .catch(() => {
                        return next(new Error('Unauthorized'));
                    })
            }
        });
    } else {
        return next(new Error('Unauthorized'));
    }
};

module.exports.privilegedCall = async(req, res, next) => {
    const bearerToken = req.cookies[".OAUTHSECURE"]

    if (typeof bearerToken != "undefined") {
        if (typeof bearerToken == "undefined") {
            return res.json({message: "Unauthorized"});
        }

        jwt.verify(bearerToken, ".OAUTHSECURE", (err, agent) => {
            if (typeof agent == "undefined") {
                return res.json({message: "Unauthorized"});
            } else {
                UsersService.searchUserAsync(agent.secret || agent.user.secret)
                    .then((user) => {
                        req.User = user;
                        next();
                    })
                    .catch(() => {
                        return res.json({message: "Unauthorized"});
                    })
            }
        });
    } else {
        return res.json({message: "Unauthorized"});
    }
};

module.exports.requiresAccessLevel = async(req, res, next) => {
    const required_level = ENDPOINT_PERMISSION_FLAGS[req.path];
    if (required_level && req.User && req.User.permissions.Level >= required_level) {
        next();
    } else {
        return res.json({message: "Unauthorized"});
    }
};