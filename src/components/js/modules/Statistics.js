import { socket } from './Socket';

export const getModerationStatistics = async () => {
    return new Promise((resolve, reject) => {
        socket.emit('getModerationStatistics', (res) => {
            resolve(res);
        });
    });
};

export const getMonthReport = async (month) => {
    return new Promise((resolve, reject) => {
        socket.emit('generateMonthlyReport', month, (res) => {
            resolve(res);
        });
    });
}