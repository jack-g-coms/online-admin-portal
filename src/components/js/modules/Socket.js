import { io } from 'socket.io-client';
import { baseUrl } from "../../../shared";

export const socket = io(baseUrl, {withCredentials: true, transports: ['websocket']});