import config from "../../../config.json";
import { socket } from './Socket';

var cachedGroupInfo = {};

export const login = async (identifier, password) => {
    const response = await fetch(config.baseApiUrl + '/users/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include', body: JSON.stringify({identifier, password})});
    return response.json();
};

export const logout = async () => {
    const response = await fetch(config.baseApiUrl + '/users/logout', {method: 'POST', credentials: 'include'});
    return response.json();
};

export const signup = async (email, username, discordid, password) => {
    const response = await fetch(config.baseApiUrl + '/users/sign-up', {method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include', body: JSON.stringify({email, username, discordid, password})});
    return response.json();
};

export const search = async (query) => {
    const response = await fetch(config.baseApiUrl + '/users/search?query=' + query, {method: 'GET', credentials: 'include'});
    return response.json();
};

export const getUsers = async () => {
    return new Promise((resolve, reject) => {
        socket.emit('getAllUsers', (res) => {
            resolve(res);
        });
    });
};

export const refresh = async () => {
    const response = await fetch(config.baseApiUrl + '/users/me', {method: 'GET', credentials: 'include'});
    return response.json();
};

export const update = async (id, payload, changes) => {
    return new Promise((resolve, reject) => {
        socket.emit('updateUser', {id, payload, changes}, (res) => {
            resolve(res);
        });
    }); 
};

export const deleteUser = async (id) => {
    return new Promise((resolve, reject) => {
        socket.emit('deleteUser', {id}, (res) => {
            resolve(res);
        });
    });  
};

export const saveDiscordEmbed = async (embedInfo, name) => {
    return new Promise((resolve, reject) => {
        socket.emit('saveDiscordEmbed', embedInfo, name, (res) => {
            resolve(res);
        });
    });
};

export const getGroupRank = async (rbxid, groupid) => {
    return new Promise((resolve, reject) => {
        if (cachedGroupInfo[rbxid] != undefined) {
            console.log("history")
            resolve(cachedGroupInfo[rbxid])
        } else {
            fetch(config.baseApiUrl + `/roblox/groupRoles/${rbxid}`, {credentials: 'include'})
                .then((response) => response.json())
                .then((response) => {
                    response.data.map((groupInfo, _) => {
                        if (groupInfo.group.id == groupid) {
                            cachedGroupInfo[rbxid] = groupInfo.role;
                            return resolve(groupInfo.role);
                        }
                    }); 
                    cachedGroupInfo[rbxid] = false;
                    resolve(false);
                })
                .catch((err) => {
                    resolve(false);
                });
        }
    });
};