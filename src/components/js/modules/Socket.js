import { io } from 'socket.io-client';
import config from "../../../config.json";

export const socket = io(config.baseUrl, {withCredentials: true, transports: ['websocket'], path: '/api/gateway'});