import { defineStore } from 'pinia';

export type TokenType = 'runtime_token' | 'refresh_token';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    runtime_token: localStorage.getItem('runtime_token') || '',
    refresh_token: localStorage.getItem('refresh_token') || '',
  }),
  actions: {
    setToken(type: TokenType, token: string) {
      this[type] = token;
      localStorage.setItem(type, token);
    },
  },
  getters: {
    runtimeToken: (state) => state.runtime_token,
    refreshToken: (state) => state.refresh_token,
  },
});
