import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import { useSettingStore } from '@/store/setting';

const api = axios.create();

api.interceptors.request.use(
  function (config) {
    const authStore = useAuthStore();
    const { _hostName, _apiPort, _apiVersion, _entryPath } = useSettingStore();
    // console.log(config.url);
    config.baseURL = `http://${_hostName}:${_apiPort}/${_entryPath}/${_apiVersion}`;
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
