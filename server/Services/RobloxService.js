// CONSTANTS
const axios = require('axios');

const cachedGroupInfo = {};

// FUNCTIONS
const getUser = async (id) => {
    return new Promise((resolve, reject) => {
        axios.post(`https://users.roblox.com/v1/usernames/users`, {'usernames': [id], 'excludeBannedUsers': true})
            .then((response) => {
                if (response.data.data.length > 0) {
                    resolve(response.data.data[0]);
                } else {
                    resolve();
                }
            }).catch(console.log);
    });
};

const getUserByID = async (id) => {
    return new Promise((resolve, reject) => {
        axios.get('https://users.roblox.com/v1/users/' + id)
            .then((response) => {
                if (!response.data.errors) {
                    resolve(response.data);
                } else {
                    resolve();
                }
            }).catch(err => {
                resolve();
            });
    });
};

const getGroupRank = async (rbxId, groupId) => {
    return new Promise((resolve, reject) => {
        if (cachedGroupInfo[rbxId]) {
            cachedGroupInfo[rbxId].map((groupInfo, _) => {
                if (groupInfo.group.id == groupId) {
                    return resolve(groupInfo.role);
                }
            }); 
            resolve(false);
        } else {
            axios.get(`https://groups.roblox.com/v2/users/${rbxId}/groups/roles`)
                .then((response) => {
                    cachedGroupInfo[rbxId] = response.data.data;
                    response.data.data.map((groupInfo, _) => {
                        if (groupInfo.group.id == groupId) {
                            return resolve(groupInfo.role);
                        }
                    }); 
                    resolve(false);
                })
                .catch(() => {
                    resolve(false);
                });
        }
    });
}

const getAvatarHeadshot = (rbx_id) => {
    return axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${rbx_id}&size=150x150&format=Png&isCircular=false`);
};

module.exports.getAvatarHeadshot = getAvatarHeadshot;
module.exports.getUser = getUser;
module.exports.getUserByID = getUserByID;
module.exports.getGroupRank = getGroupRank;