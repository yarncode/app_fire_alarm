<template>
  <n-config-provider :theme="theme === 'dark' ? darkTheme : lightTheme">
    <n-message-provider :max="1">
      <ion-page>
        <ion-header v-show="$route.name !== 'Account'" :translucent="true">
          <ion-toolbar>
            <ion-title>{{ title }}</ion-title>
            <ion-buttons slot="primary">
              <n-button @click="toggleDrawer" tertiary circle class="mr-3">
                <template #icon>
                  <n-icon>
                    <GridOutline />
                  </n-icon>
                </template>
              </n-button>
            </ion-buttons>
          </ion-toolbar>
          <n-drawer v-model:show="activeDrawer" :width="'75%'" placement="right">
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
        </ion-header>
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </ion-page>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { IonHeader, IonPage, IonTitle, IonToolbar, IonButtons } from '@ionic/vue';
import { ref, computed, onUnmounted } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import {
  darkTheme,
  lightTheme,
  NConfigProvider,
  NMessageProvider,
  NButton,
  NIcon,
  NDrawer,
  NDrawerContent,
  NList,
  NListItem,
} from 'naive-ui';
import { GridOutline } from '@vicons/ionicons5';
import { useAuthStore } from '@/store/auth';
import { useSocketStore } from '@/store/socket';

interface ConfigTheme {
  theme: 'dark' | 'light';
}

type MenuItemType = 'route' | 'action';

interface MenuItemCustom {
  type: MenuItemType;
  label: string;
  nameRoute?: string;
  action?: () => void;
}

let configThemeOrigin: ConfigTheme = {
  theme: 'dark',
};
const authStore = useAuthStore();
const socketStore = useSocketStore();
const activeDrawer = ref(false);
const router = useRouter();
const route = useRoute();
const listMenu: Array<MenuItemCustom> = [
  {
    label: 'Home',
    type: 'route',
    nameRoute: 'Home',
  },
  {
    label: 'Profile',
    type: 'route',
    nameRoute: 'Profile',
  },
  {
    label: 'Logout',
    type: 'action',
    action() {
      /* do something here */
      authStore.logout();
      router.push({ name: 'Account' });
    },
  },
];

let present_title = '';
const configTheme = localStorage.getItem('theme-config');
/* load theme */
const theme = ref(configThemeOrigin.theme);
const title = computed(() => {
  const existNameRoute = listMenu.find((item) => item?.nameRoute === route.name);
  if (existNameRoute) {
    present_title = existNameRoute.label;
    return existNameRoute.label;
  }
  return present_title;
});

socketStore.socketIo.on('connect', () => {
  console.log('connected: ', socketStore.socketIo.id);
});

socketStore.socketIo.on('disconnect', () => {
  console.log('disconnected: ', socketStore.socketIo.id);
});

if (socketStore.socketIo.connected) {
  socketStore.socketIo.connect();
}

try {
  /* config nbot found */
  if (configTheme == null) {
    configThemeOrigin = {
      theme: 'dark',
    };
    localStorage.setItem('theme-config', JSON.stringify(configThemeOrigin));
  } else {
    configThemeOrigin = JSON.parse(configTheme);
  }
} catch (error) {
  console.error(error);
}

const changeTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme-config', JSON.stringify({ theme: theme.value }));
};

const toggleDrawer = () => {
  activeDrawer.value = !activeDrawer.value;
};

const handleItemClick = (menu: MenuItemCustom) => {
  if (menu.type === 'action') {
    if (menu?.action) {
      menu.action();
    }
  } else if (menu.type === 'route' && menu?.nameRoute) {
    router.push({ name: menu.nameRoute });
  }
  /* close menu */
  toggleDrawer();
};

onUnmounted(() => {
  /* remove event */
  socketStore.socketIo.off('connect');
  socketStore.socketIo.off('disconnect');

  /* disconnect socketIo */
  socketStore.socketIo.disconnect();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
