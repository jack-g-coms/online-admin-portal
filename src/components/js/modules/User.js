import { baseUrl } from "../../../shared";
import { socket } from './Socket';

export const login = async (identifier, password) => {
    const response = await fetch(baseUrl + 'api/users/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include', body: JSON.stringify({identifier, password})});
    return response.json();
};

export const logout = async () => {
    const response = await fetch(baseUrl + 'api/users/logout', {method: 'POST', credentials: 'include'});
    return response.json();
};

export const signup = async (email, username, password) => {
    const response = await fetch(baseUrl + 'api/users/sign-up', {method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include', body: JSON.stringify({email, username, password})});
    return response.json();
};

export const search = async (query) => {
    return new Promise((resolve, reject) => {
        socket.emit('searchUsers', query, (res) => {
            resolve(res);
        });
    });
};

export const getUsers = async () => {
    return new Promise((resolve, reject) => {
        socket.emit('getAllUsers', (res) => {
            resolve(res);
        });
    });
};

export const refresh = async () => {
    return new Promise((resolve, reject) => {
        socket.emit('getMe', (res) => {
            resolve(res);
        });
    });
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
        socket.emit('deleteUser', id, (res) => {
            resolve(res);
        });
    });  
};