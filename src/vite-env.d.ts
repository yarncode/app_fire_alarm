/// <reference types="vite/client" />
/// <reference types="cordova-plugin-ble-central" />
import { AxiosInstance } from 'axios';

/* declare global $axios in globalProperties */
declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}
