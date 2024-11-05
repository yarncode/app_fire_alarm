import { defineStore } from 'pinia';
// import { useSettingStore } from '@/store/setting';
import { io } from 'socket.io-client';
import { Storage } from '@/utils/helper';

export const useSocketStore = defineStore('socket-io', {
  state: () => ({
    _firstConnect: true,
    _socketIo: io(`ws://${Storage.load('hostName')}:${Storage.load('socketPort')}`, { autoConnect: false }),
  }),
  actions: {
    setAuth(token: string) {
      console.log('Socket set auth');
      this._socketIo.auth = { token };

      /* add event to socket */
      if (this._firstConnect) {
        this._socketIo.on('connect', this._onConnect);
        this._socketIo.on('disconnect', this._onDisconnect);
        this._firstConnect = false;
      }

      this._socketIo.disconnect().connect();
    },
    _onConnect() {
      console.log('Client socket connected', this._socketIo.id);
    },
    _onDisconnect() {
      console.log('Client socket disconnected');
    },
  },
  getters: {
    socketIo: (state) => state._socketIo,
  },
});
