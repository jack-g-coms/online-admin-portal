import { socket } from './Socket';

export const getConfiguration = async () => {
    return new Promise((resolve, reject) => {
        socket.emit('getConfiguration', (res) => {
            resolve(res);
        });
    });
};

export const updateConfiguration = (announcement, devNotice) => {
    return new Promise((resolve, reject) => {
        socket.emit('updateConfiguration', {announcement, devNotice}, (res) => {
            resolve(res);
        });
    });
}; 