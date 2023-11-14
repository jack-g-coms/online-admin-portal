import { baseUrl } from "../../../shared";

export const getUsers = async () => {
    const response = await fetch(baseUrl + 'api/users', {method: 'GET', credentials: 'include'});
    return response.json();
};

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
    const response = await fetch(baseUrl + 'api/users/search?query=' + query, {method: 'GET', credentials: 'include'});
    return response.json();
};

export const refresh = async () => {
    const response = await fetch(baseUrl + 'api/users/me', {method: 'GET', credentials: 'include'});
    return response.json();
};

export const update = async (id, payload, changes) => {
    const response = await fetch(baseUrl + 'api/users/update', {method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include', body: JSON.stringify({id, payload, changes})});
    return response.json();  
};

export const deleteUser = async (id) => {
    const response = await fetch(baseUrl + 'api/users/delete', {method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include', body: JSON.stringify({id})});
    return response.json();  
}