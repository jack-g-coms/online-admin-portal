// FLAGS
module.exports.DEFAULT_LEVEL = 1;
module.exports.PERMISSION_FLAGS = {
    'MANAGE_USERS': 6,
    'DELETE_USERS': 7,
    'CREATE_PORTAL_NOTICE': 7,

    'VIEW_ROBLOX_BANS': 1,
    'CREATE_ROBLOX_BANS': 2,
    'UPDATE_ROBLOX_BANS': 5,
    'DELETE_ROBLOX_BANS': 2,
    'VIEW_ROBLOX_WARNINGS': 1,
    'CREATE_ROBLOX_WARNINGS': 2,
    'UPDATE_ROBLOX_WARNINGS': 5,
    'DELETE_ROBLOX_WARNINGS': 2,

    'VIEW_DISCORD_BANS': 1,
    'CREATE_DISCORD_BANS': 2,
    'UPDATE_DISCORD_BANS': 5,
    'DELETE_DISCORD_BANS': 2,
    'VIEW_DISCORD_MODERATIONS': 1,
    'CREATE_DISCORD_MODERATIONS': 2,
    'UPDATE_DISCORD_MODERATIONS': 5,
    'DELETE_DISCORD_MODERATIONS': 2,

    'BOT_ACTIONS': 7
}

// SETS
module.exports.PERMISSION_SETS = {
    [10]: {
        Name: 'Portal Developer'
    },
    [9]: {
        Name: 'Portal Automated System'
    },
    [8]: {
        Name: 'Portal Director'
    },
    [7]: {
        Name: 'Portal Deputy Director'
    },
    [6]: {
        Name: 'Portal Management'
    },
    [5]: {
        Name: 'Portal Supervisor'
    },
    [2]: {
        Name: 'Portal User'
    },
    [1]: {
        Name: 'Portal Viewer'
    }
}

// FUNCTIONS / UTILITIES
module.exports.getFlags = async (level) => {
    var flags = {};

    for (var flag in this.PERMISSION_FLAGS) {
        if (level >= this.PERMISSION_FLAGS[flag]) {
            flags[flag] = true;
        }
    }

    return flags;
};

module.exports.getPermissionLevelFromNameAsync = (name) => {
    return new Promise((resolve, reject) => {
        for (let level in this.PERMISSION_SETS) {
            if (this.PERMISSION_SETS[level].Name == name) {
                return resolve(level);
            }
        }
        resolve();
    })
}
