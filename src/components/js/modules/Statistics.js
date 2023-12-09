import { socket } from './Socket';

export const getModerationStatistics = async () => {
    return new Promise((resolve, reject) => {
        socket.emit('getModerationStatistics', (res) => {
            resolve(res);
        });
    });
};