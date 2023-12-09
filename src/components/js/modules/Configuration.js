import { socket } from './Socket';

export const getConfiguration = async () => {
    return new Promise((resolve, reject) => {
        socket.emit('getConfiguration', (res) => {
            resolve(res);
        });
    });
};

export const updateConfiguration = async (announcement) => {
    return new Promise((resolve, reject) => {
        socket.emit('updateConfiguration', announcement, (res) => {
            resolve(res);
        });
    });
}; 