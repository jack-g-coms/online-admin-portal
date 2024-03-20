import { socket } from './Socket';

export const getLogs = async () => {
    return new Promise((resolve, reject) => {
        socket.emit('getAllLogs', (res) => {
            resolve(res);
        });
    });
};