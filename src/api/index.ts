import axios from 'axios';
import { main_config, CONFIG_ENV } from '../config';

const config = main_config[CONFIG_ENV];
const api = axios.create({
  baseURL: `http://${config.server.hostName}:${config.server.apiPort}/${config.server.entryPath}/${config.server.apiVersion}`,
});

export default api;
