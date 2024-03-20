import { socket } from './Socket';

export const getModerationStatistics = async () => {
    return new Promise((resolve, reject) => {
        socket.emit('getModerationStatistics', (res) => {
            resolve(res);
        });
    });
};

export const getMonthReport = async (year, month) => {
    return new Promise((resolve, reject) => {
        socket.emit('generateMonthlyReport', year, month, (res) => {
            resolve(res);
        });
    });
};

export const getModeratorReport = async (from, to, moderatorRbx, moderatorDiscord) => {
    return new Promise((resolve, reject) => {
        socket.emit('getModeratorReport', from, to, moderatorRbx, moderatorDiscord, (res) => {
            resolve(res);
        });
    });
};