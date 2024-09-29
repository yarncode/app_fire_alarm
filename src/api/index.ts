import axios from 'axios';
import { main_config, CONFIG_ENV } from '../config';
import { useAuthStore } from '@/store/auth';

const config = main_config[CONFIG_ENV];
const api = axios.create({
  baseURL: `http://${config.server.hostName}:${config.server.apiPort}/${config.server.entryPath}/${config.server.apiVersion}`,
});

api.interceptors.request.use(
  function (config) {
    const authStore = useAuthStore();
    // console.log(config.url);
    if (authStore.runtimeToken && config.url !== '/account/refresh-token') {
      config.headers['_token'] = authStore.runtimeToken;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

export default api;
