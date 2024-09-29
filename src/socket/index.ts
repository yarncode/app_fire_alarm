import { io } from "socket.io-client";
import { main_config, CONFIG_ENV } from '../config';

const config = main_config[CONFIG_ENV];
const socket = io(`ws://${config.server.hostName}:${config.server.socketPort}`)

export default socket;
