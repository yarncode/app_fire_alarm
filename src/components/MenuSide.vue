<template>
  <n-drawer v-model:show="menuSideBar" :width="'75%'" placement="right" :auto-focus="false">
    <n-drawer-content title="Menu">
      <n-list clickable>
        <n-list-item
          v-show="$route.name !== item.nameRoute"
          v-for="item in listMenu"
          :key="item.label"
          @click="handleItemClick(item)"
        >
          {{ item.label }}
        </n-list-item>
      </n-list>
    </n-drawer-content>
  </n-drawer>
</template>

<script lang="ts" setup>
import { NDrawer, NDrawerContent, NList, NListItem, useDialog } from 'naive-ui';
import { useSocketStore } from '@/store/socket';
import { useStateStore } from '@/store/state';
import { useAuthStore } from '@/store/auth';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

type MenuItemType = 'route' | 'action';

interface MenuItemCustom {
  type: MenuItemType;
  label: string;
  nameRoute?: string;
  icon: unknown | string;
  action?: () => void;
}

const router = useRouter();
const dialog = useDialog();
const _sSocket = useSocketStore();
const authStore = useAuthStore();
const { menuSideBar } = storeToRefs(useStateStore());
const { toggleMenuSideBar } = useStateStore();

const listMenu: Array<MenuItemCustom> = [
  {
    label: 'Home',
    type: 'route',
    nameRoute: 'Home',
    icon: 'fi fi-rr-house-blank',
  },
  {
    label: 'Logout',
    type: 'action',
    icon: 'fi fi-ts-arrow-left-from-arc',
    action() {
      /* do something here */
      dialog.warning({
        title: 'Confirm',
        content: 'Are you sure logout?',
        positiveText: 'Sure',
        negativeText: 'Cancel',
        onPositiveClick: () => {
          /* logout token session */
          authStore.logout();
          /* logout socket connection */
          _sSocket.logout();

          router.push({ name: 'Account' });
        },
        onNegativeClick: () => {},
      });
    },
  },
];

const handleItemClick = (menu: MenuItemCustom) => {
  if (menu.type === 'action') {
    if (menu?.action) {
      menu.action();
    }
  } else if (menu.type === 'route' && menu?.nameRoute) {
    router.push({ name: menu.nameRoute });
  }
  /* close menu */
  toggleMenuSideBar();
};
</script>
