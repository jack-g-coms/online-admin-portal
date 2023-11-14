// CONSTANTS
const axios = require('axios');

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

const getAvatarHeadshot = (rbx_id) => {
    return axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${rbx_id}&size=150x150&format=Png&isCircular=false`);
};

module.exports.getAvatarHeadshot = getAvatarHeadshot;
module.exports.getUser = getUser;