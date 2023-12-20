// CONSTANTS
const UsersService = require('../Services/UsersService');
const ProtectionService = require('../Services/ProtectionService');
const PermissionsService = require('../Services/PermissionsService');
const RobloxService = require('../Services/RobloxService');
const Server = process.Server;

// GET
Server.get('/api/users/me', ProtectionService.privilegedCall, async (req, res) => {
    return res.json({message: 'Success', data: req.User});
});

Server.get('/api/users/search', async (req, res) => {
    const { query } = req.query;
    if (!query) return callback({message: 'Error'});
    
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
    const { email, username, discordid, password } = req.body;
    if (!email || !username || !discordid || !password) return res.json({message: 'Error'});

    const rbxInfo = await RobloxService.getUser(username);
    if (!rbxInfo) return res.json({message: 'No Roblox User'});

    const existingUser = await UsersService.searchUserAsync(rbxInfo.id) || await UsersService.searchUserAsync(email);
    if (existingUser) return res.json({message: 'Login'});

    const avatarHeadshotUrl = await RobloxService.getAvatarHeadshot(rbxInfo.id);
    if (avatarHeadshotUrl.data.data.errors || avatarHeadshotUrl.data.data.length == 0) return res.json({message: 'No Roblox User'});

    UsersService.createUserAsync(email, {username, id: rbxInfo.id, imageUrl: avatarHeadshotUrl.data.data[0].imageUrl}, discordid, password)
        .then(user => { 
            res.json({message: 'Success', data: user});
        }).catch((err) => {
            console.log(err);
            res.json({message: 'Error'});
        });
});

Server.post('/api/users/logout', async (req, res) => {
    res.clearCookie('.OAUTHSECURE');
    res.json({message: 'Success'});
});