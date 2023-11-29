import { socket } from './Socket';

export const getBans = async () => {
    return new Promise((resolve, reject) => {
        socket.emit('getAllDiscordBans', (res) => {
            resolve(res);
        });
    });
};

export const searchBan = async (discordID) => {
    return new Promise((resolve, reject) => {
        socket.emit('searchDiscordBan', discordID, (res) => {
            resolve(res);
        });
    });
};

export const newBan = async (discordID, moderator, evidence, reason, banType) => {
    return new Promise((resolve, reject) => {
        socket.emit('createDiscordBan', {discordID, moderator, evidence, reason, banType}, (res) => {
            resolve(res);
        });
    });
};

export const updateBan = async (discordID, moderator, evidence, reason, banType) => {
    return new Promise((resolve, reject) => {
        socket.emit('updateDiscordBan', {discordID, moderator, evidence, reason, banType}, (res) => {
            resolve(res);
        });
    });
};

export const deleteBan = async (discordID) => {
    return new Promise((resolve, reject) => {
        socket.emit('deleteDiscordBan', {discordID}, (res) => {
            resolve(res);
        });
    });
};

export const getModerations = async () => {
    return new Promise((resolve, reject) => {
        socket.emit('getAllDiscordModerations', (res) => {
            resolve(res);
        });
    });
};

export const searchModeration = async (moderationID) => {
    return new Promise((resolve, reject) => {
        socket.emit('searchDiscordModeration', moderationID, (res) => {
            resolve(res);
        });
    });
};

export const newModeration = async (discordID, moderator, moderationType, evidence, extraInfo, reason) => {
    return new Promise((resolve, reject) => {
        socket.emit('createDiscordModeration', {discordID, moderator, moderationType, evidence, extraInfo, reason}, (res) => {
            resolve(res);
        });
    });
};

export const updateModeration = async (moderationID, moderator, evidence, extraInfo, reason) => {
    return new Promise((resolve, reject) => {
        socket.emit('updateDiscordModeration', {moderationID, moderator, evidence, extraInfo, reason}, (res) => {
            resolve(res);
        });
    });
};

export const deleteModeration = async (moderationID) => {
    return new Promise((resolve, reject) => {
        socket.emit('deleteDiscordModeration', {moderationID}, (res) => {
            resolve(res);
        });
    });
};