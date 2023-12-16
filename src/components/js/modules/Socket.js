import { io } from 'socket.io-client';
import { baseUrl } from "../../../shared";

export const socket = io('https://portal.romestaff.com', {withCredentials: true, transports: ['websocket'], path: '/api/gateway'});