import { baseUrl } from "../../../shared";

export const getBans = async () => {
    const response = await fetch(baseUrl + 'api/roblox/bans', {method: 'GET', credentials: 'include'});
    return response.json();
};

export const searchBan = async (rbxID) => {
    const response = await fetch(baseUrl + 'api/roblox/bans/search?query=' + rbxID, {method: 'GET', credentials: 'include'});
    return response.json();
};

export const newBan = async (rbxID, moderator, evidence, reason, banType) => {
    const response = await fetch(baseUrl + 'api/roblox/bans/create', {method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({rbxID, moderator, evidence, reason, banType})});
    return response.json();
};

export const updateBan = async (rbxID, moderator, evidence, reason) => {
    const response = await fetch(baseUrl + 'api/roblox/bans/update', {method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({rbxID, moderator, evidence, reason})});
};

export const getWarnings = async () => {
    const response = await fetch(baseUrl + 'api/roblox/warnings', {method: 'GET', credentials: 'include'});
    return response.json();
};

export const searchWarning = async (warnID) => {
    const response = await fetch(baseUrl + 'api/roblox/warnings/search?query=' + warnID, {method: 'GET', credentials: 'include'});
    return response.json();
};

export const newWarning = async (rbxID, moderator, evidence, reason) => {
    const response = await fetch(baseUrl + 'api/roblox/warnings/create', {method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({rbxID, moderator, evidence, reason})});
    return response.json();
};

export const updateWarning = async (warnID, moderator, evidence, reason, acknowledged) => {
    const response = await fetch(baseUrl + 'api/roblox/warnings/update', {method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({warnID, moderator, evidence, reason, acknowledged})});
};