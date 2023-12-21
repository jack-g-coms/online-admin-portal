import { socket } from './Socket';

export const getBans = async () => {
    return new Promise((resolve, reject) => {
        socket.emit('getAllRobloxBans', (res) => {
            resolve(res);
        });
    });
};

export const searchBan = async (rbxID) => {
    return new Promise((resolve, reject) => {
        socket.emit('searchRobloxBan', rbxID, (res) => {
            resolve(res);
        });
    });
};

export const newBan = async (rbxID, moderator, evidence, reason, banType) => {
    return new Promise((resolve, reject) => {
        socket.emit('createRobloxBan', {rbxID, moderator, evidence, reason, banType}, (res) => {
            resolve(res);
        });
    });
};

export const updateBan = async (rbxID, moderator, evidence, reason, banType) => {
    return new Promise((resolve, reject) => {
        socket.emit('updateRobloxBan', {rbxID, moderator, evidence, reason, banType}, (res) => {
            resolve(res);
        });
    });
};

export const deleteBan = async (rbxID) => {
    return new Promise((resolve, reject) => {
        socket.emit('deleteRobloxBan', {rbxID}, (res) => {
            resolve(res);
        });
    });
};

export const getWarnings = async () => {
    return new Promise((resolve, reject) => {
        socket.emit('getAllRobloxWarnings', (res) => {
            resolve(res);
        });
    });
};

export const getModerationProfile = async (rbxID) => {
    return new Promise((resolve, reject) => {
        socket.emit('getRobloxModerationProfile', rbxID, (res) => {
            resolve(res);
        });
    });
};

export const searchWarning = async (warnID) => {
    return new Promise((resolve, reject) => {
        socket.emit('searchRobloxWarning', warnID, (res) => {
            resolve(res);
        });
    });
};

export const newWarning = async (rbxID, moderator, evidence, reason) => {
    return new Promise((resolve, reject) => {
        socket.emit('createRobloxWarning', {rbxID, moderator, evidence, reason}, (res) => {
            resolve(res);
        });
    });
};

export const updateWarning = async (rbxID, warnID, moderator, evidence, reason, acknowledged) => {
    return new Promise((resolve, reject) => {
        socket.emit('updateRobloxWarning', {rbxID, warnID, moderator, evidence, reason, acknowledged}, (res) => {
            resolve(res);
        });
    });
};

export const deleteWarning = async (rbxID, warnID) => {
    return new Promise((resolve, reject) => {
        socket.emit('deleteRobloxWarning', {rbxID, warnID}, (res) => {
            resolve(res);
        });
    });
};