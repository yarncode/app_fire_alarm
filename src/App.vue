<template>
  <n-config-provider :theme="theme === 'dark' ? darkTheme : lightTheme">
    <n-message-provider :max="1">
      <ion-page>
        <ion-header :translucent="true">
          <ion-toolbar>
            <ion-title>Cấu hình thiết bị</ion-title>
            <n-button
              style="margin-right: 1rem"
              slot="end"
              type="primary"
              round
              @click="changeTheme"
              >Go {{ theme === "dark" ? "light" : "dark" }}</n-button
            >
          </ion-toolbar>
        </ion-header>
        <router-view />
      </ion-page>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/vue";
import { ref } from "vue";
import { RouterView } from "vue-router";
import {
  darkTheme,
  lightTheme,
  NConfigProvider,
  NButton,
  NMessageProvider,
} from "naive-ui";

interface ConfigTheme {
  theme: "dark" | "light";
}

let configThemeOrigin: ConfigTheme = {
  theme: "dark",
};

const configTheme = localStorage.getItem("theme-config");

try {
  /* config nbot found */
  if (configTheme == null) {
    configThemeOrigin = {
      theme: "dark",
    };
    localStorage.setItem("theme-config", JSON.stringify(configThemeOrigin));
  } else {
    configThemeOrigin = JSON.parse(configTheme);
  }
} catch (error) {
  console.error(error);
}

/* load theme */
const theme = ref(configThemeOrigin.theme);

const changeTheme = () => {
  theme.value = theme.value === "dark" ? "light" : "dark";
  localStorage.setItem("theme-config", JSON.stringify({ theme: theme.value }));
};
</script>

<style>
* {
  user-select: none;
}
</style>
