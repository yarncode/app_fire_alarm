<template>
  <wrap-provider>
    <n-layout has-sider class="h-screen">
      <n-layout>
        <n-layout-content class="h-full px-10 py-5">
          <div v-if="$route.name !== 'Account'" class="flex items-center mb-5">
            <p class="text-md">Server status:</p>
            <p
              class="ml-2 px-2 rounded-md shadow"
              :class="socketIo.connected ? 'bg-green-500 shadow-green-500' : 'bg-slate-500 shadow-slate-500'"
            >
              {{ socketIo.connected ? 'connected' : 'disconnected' }}
            </p>
          </div>
          <menu-side />
          <setting-float-button />
          <router-view v-slot="{ Component, route }">
            <transition name="fade" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </wrap-provider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { NLayout, NLayoutContent } from 'naive-ui';

import WrapProvider from './components/WrapProvider.vue';
import SettingFloatButton from './components/SettingFloatButton.vue';
import MenuSide from './components/MenuSide.vue';

import { useSocketStore } from '@/store/socket';
import { storeToRefs } from 'pinia';

const { socketIo } = storeToRefs(useSocketStore());
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
