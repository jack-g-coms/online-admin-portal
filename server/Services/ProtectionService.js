// CONSTANTS
const UsersService = require('./UsersService');
const PermissionsService = require('./PermissionsService');
const jwt = require('jsonwebtoken');

const API_KEY = '41812b38-ef54-4380-bea9-129e2359e4ce';
const AUTHORIZED_PLACEIDS = ['18510698024'];
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

const getCookie = (cookieString, cookieName) => {
    const splitCookieString = cookieString.split(';');
    var cookie;

    for (var i = 0; i < splitCookieString.length; i++) {
        var indexCookie = splitCookieString[i].replace(/\s/g, '');
        if (indexCookie.substring(0, cookieName.length) == cookieName) {
            cookie = indexCookie.substring(cookieName.length + 1);
        }
    }

    return cookie;
};

// FUNCTIONS
module.exports.requiresAPIKey = async (req, res, next) => {
    if (req.headers['key'] != API_KEY) {
        return res.json({message: 'Unauthorized'});
    };
    next();
};

module.exports.requiresRobloxPlaceId = async (req, res, next) => {
    if (!req.headers['roblox-id'] || !(AUTHORIZED_PLACEIDS.includes(req.headers['roblox-id'])) || req.headers['key'] != API_KEY) {
        return res.json({message: 'Unauthorized'});
    };
    next();
};

module.exports.privilegedSocket = async(socket, next) => {
    const bearerToken = socket.handshake.headers.cookie && getCookie(socket.handshake.headers.cookie, '.OAUTHSECURE');

    if (typeof bearerToken != "undefined") {
        jwt.verify(bearerToken, ".OAUTHSECURE", (err, agent) => {
            if (typeof agent != "undefined") {
                UsersService.searchUserAsync(agent.secret || agent.user.secret)
                    .then((user) => {
                        socket.User = user;
                        next();
                    }).catch(console.log);
            } else {
                next();
            }
        });
    } else {
        next();
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