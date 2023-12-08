import { socket } from './Socket';

export const getRobloxModerationStatistics = async () => {
    return new Promise((resolve, reject) => {
        socket.emit('getRobloxModerationStatistics', (res) => {
            resolve(res);
        });
    });
};