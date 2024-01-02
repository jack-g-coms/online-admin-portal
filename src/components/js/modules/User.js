import { baseUrl } from "../../../shared";
import { socket } from './Socket';

export const login = async (identifier, password) => {
    const response = await fetch(baseUrl + '/users/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include', body: JSON.stringify({identifier, password})});
    return response.json();
};

export const logout = async () => {
    const response = await fetch(baseUrl + '/users/logout', {method: 'POST', credentials: 'include'});
    return response.json();
};

export const signup = async (email, username, discordid, password) => {
    const response = await fetch(baseUrl + '/users/sign-up', {method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include', body: JSON.stringify({email, username, discordid, password})});
    return response.json();
};

export const search = async (query) => {
    const response = await fetch(baseUrl + '/users/search?query=' + query, {method: 'GET', credentials: 'include'});
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
    const response = await fetch(baseUrl + '/users/me', {method: 'GET', credentials: 'include'});
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