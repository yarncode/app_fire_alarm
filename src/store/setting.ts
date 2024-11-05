import { defineStore } from 'pinia';
import { PayloadConfigEnv } from '@/config';

import { Storage } from '@/utils/helper';

interface SettingStore extends PayloadConfigEnv {
  [key: string]: any;
}

export const useSettingStore = defineStore('setting-store', {
  state: (): SettingStore => ({
    server: {
      hostName: Storage.loadValueByKey('hostName', 'localhost'),
      apiPort: Storage.loadValueByKey('apiPort', 3300),
      socketPort: Storage.loadValueByKey('socketPort', 3000),
      entryPath: Storage.loadValueByKey('entryPath', 'api'),
      apiVersion: Storage.loadValueByKey('apiVersion', 'v1'),
    },
  }),
  actions: {
    _setHostName(hostName: string) {
      this.server.hostName = hostName;
      Storage.setValueByKey('hostName', hostName);
    },
    _setApiPort(apiPort: number) {
      this.server.apiPort = apiPort;
      Storage.setValueByKey('apiPort', apiPort);
    },
    _setSocketPort(socketPort: number) {
      this.server.socketPort = socketPort;
      Storage.setValueByKey('socketPort', socketPort);
    },
    _setEntryPath(entryPath: string) {
      this.server.entryPath = entryPath;
      Storage.setValueByKey('entryPath', entryPath);
    },
    _setApiVersion(apiVersion: string) {
      this.server.apiVersion = apiVersion;
      Storage.setValueByKey('apiVersion', apiVersion);
    },
  },
  getters: {
    _hostName: (state) => state.server.hostName,
    _apiPort: (state) => state.server.apiPort,
    _socketPort: (state) => state.server.socketPort,
    _entryPath: (state) => state.server.entryPath,
    _apiVersion: (state) => state.server.apiVersion,
  },
});
