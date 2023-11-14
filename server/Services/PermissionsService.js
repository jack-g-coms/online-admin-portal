// FLAGS
module.exports.DEFAULT_LEVEL = 1;
module.exports.PERMISSION_FLAGS = {
    'MANAGE_USERS': 8,
    'DELETE_USERS': 9
}

// SETS
module.exports.PERMISSION_SETS = {
    [10]: {
        Name: 'Head of Technical Services'
    },
    [9]: {
        Name: 'Head of Staff'
    },
    [8]: {
        Name: 'Deputy Head of Staff'
    },
    [1]: {
        Name: 'User'
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
