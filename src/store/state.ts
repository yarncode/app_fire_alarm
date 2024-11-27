import { defineStore } from 'pinia';

interface PropsState {
  menuSideBar: boolean;
}

export const useStateStore = defineStore('global-state', {
  state: (): PropsState => ({
    menuSideBar: false,
  }),
  actions: {
    openMenuSideBar() {
      this.menuSideBar = true;
    },
    closeMenuSideBar() {
      this.menuSideBar = false;
    },
    toggleMenuSideBar() {
      this.menuSideBar = !this.menuSideBar;
    },
  },
});
