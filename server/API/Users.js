// CONSTANTS
const UsersService = require('../Services/UsersService');
const ProtectionService = require('../Services/ProtectionService');
const PermissionsService = require('../Services/PermissionsService');
const RobloxService = require('../Services/RobloxService');
const Server = process.Server;

// GET
Server.get('/api/users', ProtectionService.privilegedCall, ProtectionService.requiresAccessLevel, async (req, res) => {
    UsersService.getAllUsers()
        .then((users) => {
            if (users.length > 0) {
                res.json({message: 'Success', data: users});
            } else {
                res.json({message: 'Not Found'});
            }
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

Server.get('/api/users/me', ProtectionService.privilegedCall, async (req, res) => {
    res.json({message: 'Success', data: req.User});
});

Server.get('/api/users/search', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json({message: 'Error'});
    
    UsersService.searchUserAsync(query)
        .then(user => {
            if (user) {
                res.json({message: 'Success', data: user});
            } else {
                res.json({message: 'Not Found'});
            }
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

// POST
Server.post('/api/users/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.json({message: 'Error'});

    const User = await UsersService.searchUserAsync(identifier);
    if (!User) return res.json({message: 'Signup'});

    User.login(password, (err, isLoggedIn) => {
        if (!err && isLoggedIn) {
            if (!User.verified) {
                return res.json({message: 'Verify'});
            }

            User.createJSONWebToken((err, token) => {
                if (!err) {
                    res.cookie('.OAUTHSECURE', `${token}`, {expire: 2147483647, httpOnly: true, sameSite: 'none', secure: true});
                    res.json({message: 'Success', data: User});
                } else {
                    res.json({message: 'Error'});
                }
            });
        } else {
            res.json({message: 'Invalid Credentials'});
        }
    });
});

Server.post('/api/users/sign-up', async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) return res.json({message: 'Error'});

    const rbxInfo = await RobloxService.getUser(username);
    if (!rbxInfo) return res.json({message: 'No Roblox User'});

    const existingUser = await UsersService.searchUserAsync(rbxInfo.id) || await UsersService.searchUserAsync(email);
    if (existingUser) return res.json({message: 'Login'});

    const avatarHeadshotUrl = await RobloxService.getAvatarHeadshot(rbxInfo.id);
    if (avatarHeadshotUrl.data.data.errors || avatarHeadshotUrl.data.data.length == 0) return res.json({message: 'No Roblox User'});

    UsersService.createUserAsync(email, {username, id: rbxInfo.id, imageUrl: avatarHeadshotUrl.data.data[0].imageUrl}, password)
        .then(user => { 
            res.json({message: 'Success', data: user});
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

Server.post('/api/users/update', ProtectionService.privilegedCall, ProtectionService.requiresAccessLevel, async (req, res) => {
    var { id, payload, changes } = req.body;
    if (!id || !payload || !changes) return res.json({message: 'Error'});

    const existingUser = await UsersService.searchUserAsync(id);
    if (!existingUser) return res.json({message: 'Error'});

    if (existingUser.permissions.Level >= req.User.permissions.Level) return res.json({message: 'Unauthorized'});
    if (changes.username) {
        const rbxInfo = await RobloxService.getUser(payload.rbxUser.username);
        if (!rbxInfo) return res.json({message: 'No Roblox User'});

        const avatarHeadshotUrl = await RobloxService.getAvatarHeadshot(rbxInfo.id);
        if (avatarHeadshotUrl.data.data.errors || avatarHeadshotUrl.data.data.length == 0) return res.json({message: 'No Roblox User'}); 

        payload.rbxUser = {username: payload.rbxUser.username, id: rbxInfo.id, imageUrl: avatarHeadshotUrl.data.data[0].imageUrl}
    }

    if (changes.permissions) {
        const permissionLevel = await PermissionsService.getPermissionLevelFromNameAsync(payload.permissions.Name);
        if (!permissionLevel) return res.json({message: 'No Permission Level'});

        if (permissionLevel >= req.User.permissions.Level) return res.json({message: 'Unauthorized'});
        payload.permissions.Level = permissionLevel;
    }

    UsersService.updateUserAsync(id, payload.email, payload.rbxUser, payload.permissions.Level, Boolean(payload.verified).valueOf())
        .then(() => {
            res.json({message: 'Success'});
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'})
        });
}); 

Server.post('/api/users/delete', ProtectionService.privilegedCall, ProtectionService.requiresAccessLevel, async (req, res) => {
    const { id } = req.body;
    if (!id) return res.json({message: 'Error'});

    const existingUser = await UsersService.searchUserAsync(id);
    if (!existingUser) return res.json({message: 'Error'});

    UsersService.deleteUserAsync(id)
        .then(() => {
            res.json({message: 'Success'});
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'})
        });
});

Server.post('/api/users/logout', async (req, res) => {
    res.clearCookie('.OAUTHSECURE');
    res.json({message: 'Success'});
});