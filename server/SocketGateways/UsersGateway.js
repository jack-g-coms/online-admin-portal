// CONSTANTS
const PermissionsService = require('../Services/PermissionsService');
const UsersService = require('../Services/UsersService');
const RobloxService = require('../Services/RobloxService');

// GATEWAY
module.exports.gatewayInfo = {
    Name: 'Users',
    requiresAccessLevel: (user) => {
        return user.permissions.Flags.MANAGE_USERS;
    }
}

module.exports.newSocket = (socket) => {
    // PRIVILEGED
    if (socket.User.permissions.Flags.MANAGE_USERS) {
        socket.on('getAllUsers', (callback) => {
            UsersService.getAllUsers()
                .then((users) => {
                    if (users.length > 0) {
                        callback({message: 'Success', data: users});
                    } else {
                        callback({message: 'Not Found'});
                    }
                }).catch((err) => {
                    console.log(err);
                    callback({message: 'Error'});
                });
        });

        socket.on('searchUsers', (query, callback) => {
            if (!query) return callback({message: 'Error'});
    
            UsersService.searchUserAsync(query)
                .then(user => {
                    if (user) {
                        callback({message: 'Success', data: user});
                    } else {
                        callback({message: 'Not Found'});
                    }
                }).catch((err) => {
                    console.log(err);
                    callback({message: 'Error'});
                });
        });

        socket.on('updateUser', async (body, callback) => {
            var { id, payload, changes } = body;
            if (!id || !payload || !changes) return callback({message: 'Error'});
        
            const existingUser = await UsersService.searchUserAsync(id);
            if (!existingUser) return callback({message: 'Error'});
        
            if (existingUser.permissions.Level >= socket.User.permissions.Level) return callback({message: 'Unauthorized'});
            if (changes.username) {
                const rbxInfo = await RobloxService.getUser(payload.rbxUser.username);
                if (!rbxInfo) return callback({message: 'No Roblox User'});
        
                const avatarHeadshotUrl = await RobloxService.getAvatarHeadshot(rbxInfo.id);
                if (avatarHeadshotUrl.data.data.errors || avatarHeadshotUrl.data.data.length == 0) return callback({message: 'No Roblox User'}); 
        
                payload.rbxUser = {username: payload.rbxUser.username, id: rbxInfo.id, imageUrl: avatarHeadshotUrl.data.data[0].imageUrl}
            }
        
            if (changes.permissions) {
                const permissionLevel = await PermissionsService.getPermissionLevelFromNameAsync(payload.permissions.Name);
                if (!permissionLevel) return callback({message: 'No Permission Level'});
        
                if (permissionLevel >= socket.User.permissions.Level) return callback({message: 'Unauthorized'});
                payload.permissions.Level = permissionLevel;
            }
        
            UsersService.updateUserAsync(id, payload.email, payload.rbxUser, payload.permissions.Level, Boolean(payload.verified).valueOf())
                .then(() => {
                    callback({message: 'Success'});
                }).catch((err) => {
                    console.log(err);
                    callback({message: 'Error'})
                });
        });
    }

    if (socket.User.permissions.Flags.DELETE_USERS) {
        socket.on('deleteUser', async (body, callback) => {
            const { id } = body;
            if (!id) return callback({message: 'Error'});
        
            const existingUser = await UsersService.searchUserAsync(id);
            if (!existingUser) return callback({message: 'Error'});
        
            UsersService.deleteUserAsync(id)
                .then(() => {
                    callback({message: 'Success'});
                }).catch((err) => {
                    console.log(err);
                    callback({message: 'Error'})
                });
        });
    }
}