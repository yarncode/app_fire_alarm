import { defineStore } from 'pinia';
import instanceSocket from '@/socket';

export const useSocketStore = defineStore('socket-io', {
  state: () => ({
    _socketIo: instanceSocket,
  }),
  actions: {},
  getters: {
    socketIo: (state) => state._socketIo,
  },
});
