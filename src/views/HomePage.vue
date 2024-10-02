<template>
  <ion-content :fullscreen="true">
    <div style="margin: 0 0.5rem; height: 100%; display: flex; flex-direction: column">
      <div style="width: 100%; padding: 0.5rem 0; display: flex; justify-content: space-between; align-items: center">
        <n-text>Found: {{ devices.filter((item) => item?.online).length }} devices</n-text>
        <n-button type="warning" round @click="scanBluetooth" :disabled="scanning">
          <template #icon>
            <n-spin v-if="scanning" stroke="#000" size="small" />
            <n-icon v-else><Bluetooth /></n-icon>
          </template>
          <n-text style="color: inherit; margin-left: 0.4rem">Scan</n-text>
        </n-button>
      </div>
      <!-- show list device scan -->
      <n-list style="overflow-y: scroll" v-if="devices.length > 0" bordered clickable>
        <n-list-item v-show="item?.online" v-for="(item, num) in devices" :key="num">
          <n-space vertical>
            <div style="position: relative">
              <n-button
                style="position: absolute; right: 0"
                :type="msgStateBle[item.state].type as any"
                round
                @click="actionBle(item)"
              >
                {{ msgStateBle[item.state].text }}
                >
              </n-button>
              <n-text style="display: block">Name: {{ item.ble.name }}</n-text>
              <n-text style="display: block">ID: {{ item.ble.id }}</n-text>
              <n-text style="display: block">Signal: {{ item.ble.rssi }} (dB)</n-text>
              <n-text style="display: block">Status: {{ msgStateBle2[item.state].text }}</n-text>
              <n-text style="display: flex; align-items: center"
                >Health:
                <span
                  style="padding: 1px 5px; border-radius: 5px"
                  :style="{
                    backgroundColor: item?.online ? '#64d22d' : '#5c728a',
                  }"
                  >{{ item?.online ? 'online' : 'offline' }}</span
                ></n-text
              >
            </div>
            <n-collapse-transition :show="item.state === 'connected' || item.step.show === true">
              <n-space vertical>
                <!-- <n-input v-model:value="item.ssid" type="text" placeholder="SSID" /> -->
                <n-select
                  v-model:value="item.ssid"
                  placeholder="SSID"
                  :loading="loadingWiFi"
                  :options="accessPoint"
                  @focus="scanAccessPoint"
                />
                <n-input v-model:value="item.password" type="text" placeholder="Password" />
                <n-space justify="end">
                  <n-button @click="sendConfig(item)" round>Cấu hình</n-button>
                </n-space>
                <n-collapse-transition :show="item.step.show">
                  <n-steps size="small" vertical :current="item.step.current" :status="item.step.status">
                    <n-step v-for="step in stepModal" :key="step.label" :title="step.label" :description="step.desc" />
                  </n-steps>
                </n-collapse-transition>
              </n-space>
            </n-collapse-transition>
          </n-space>
        </n-list-item>
      </n-list>
      <div v-else style="flex: 1; padding-bottom: 0.5rem; display: flex; justify-content: center; align-items: center">
        <n-text>Không có thiết bị nào được tìm thấy.</n-text>
      </div>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { IonContent } from '@ionic/vue';
import {
  NSelect,
  NButton,
  NButtonGroup,
  NList,
  NListItem,
  NText,
  NIcon,
  NSpin,
  NCollapseTransition,
  NInput,
  NSpace,
  NSteps,
  NStep,
  useMessage,
  StepsProps,
} from 'naive-ui';
import type { SelectOption } from 'naive-ui';
import { onUnmounted, reactive, ref } from 'vue';
import { Bluetooth } from '@vicons/ionicons5';
import { useAuthStore } from '@/store/auth';
import { useSocketStore } from '@/store/socket';
import { useProfileStore } from '@/store/profile';
import { storeToRefs } from 'pinia';
import { watchOnce } from '@vueuse/core';

import { WifiWizard2 } from '@awesome-cordova-plugins/wifi-wizard-2';
import { Device } from '@capacitor/device';

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTER_UUID = '1423492b-2bc3-4761-b2ba-8988573698a9';

type ConfigState = 'CONFIG' | 'CONNECT';

interface DeviceStepProps {
  show: boolean;
  current: number;
  status: StepsProps['status'];
  timerTimeoutId: number;
}

interface DeviceProps {
  showForm: boolean;
  state: BLECentralPlugin.PeripheralState;
  ble: BLECentralPlugin.PeripheralData;
  ssid: string;
  password: string;
  online?: boolean;
  step: DeviceStepProps;
}

interface DeviceActiveResponse {
  timestamp: number;
  mac: string; // mac ble
  ip: string;
  netmask: string;
  gateway: string;
  ssid: string;
  password: string;
}

interface AccessPointInfo {
  level: any; // raw RSSI value
  SSID: string; // SSID as string, with escaped double quotes: "\"ssid name\""
  BSSID: string; // MAC address of WiFi router as string
  frequency: any;
  capabilities: any; // Describes the authentication, key management, and encryption schemes supported by the access point.
  timestamp: any; // timestamp of when the scan was completed
  channelWidth: any;
  centerFreq0: any;
  centerFreq1: any;
}

const stepMapValue: {
  [key: string]: {
    state: StepsProps['status'];
    value: number;
  };
} = {
  CONFIG: {
    state: 'finish',
    value: 1,
  },
  CONNECT: {
    state: 'finish',
    value: 2,
  },
};
const stepModal: Array<{
  label: string;
  desc: string;
}> = [
  {
    label: 'Configuration',
    desc: 'Device send config WiFi.',
  },
  {
    label: 'Connect Server',
    desc: 'Connection device to Server establish.',
  },
];
const step_default: DeviceStepProps = { show: false, current: 0, status: 'wait', timerTimeoutId: 0 };
const authStore = useAuthStore();
const profileStore = storeToRefs(useProfileStore());
const socketStore = useSocketStore();
const scanning = ref(false);
const message = useMessage();
const devices: DeviceProps[] = reactive([]);
const accessPoint = ref<SelectOption[]>([]);
const loadingWiFi = ref(false);

/* get device from local storage */
const devicesStorage = localStorage.getItem('ble-devices');

const handleActiveResponse = async (data: DeviceActiveResponse) => {
  console.log('device received: ', data);
  const { mac } = data;

  if (mac) {
    const macCapitalize = mac.toUpperCase();
    /* stop timer timeout */
    stopTimerTimoutCreateDevice(macCapitalize);
    setStateActive(macCapitalize, 'CONNECT', 'finish');

    /* close collapse ui after 1s */
    await closeCollapseDeviceWithTime(macCapitalize, 2);
    message.success('Device connected to server successfully.', {
      duration: 3000,
    });
  }
};

watchOnce([profileStore.isUpdated], ([status]) => {
  // console.log('profile is update: ', status);
  if (status) {
    /* profile is update */
    socketStore.socketIo.on(`${profileStore.id.value}/device/active`, handleActiveResponse);
  }
});

onUnmounted(() => {
  socketStore.socketIo.off(`${profileStore.id}/devices`);
});

Device.getInfo()
  .then((info) => {
    // console.log(info.platform);
    if (info.platform === 'android') {
      /* Init request permission if not permit */
      WifiWizard2.requestPermission()
        .then(() => {
          console.log('Wifi is enabled permission.');
          WifiWizard2.isWifiEnabled()
            .then(() => {
              console.log('Wifi is enabled.');
            })
            .catch(() => {
              WifiWizard2.enableWifi()
                .then(() => {
                  console.log('Wifi is enabled.');
                })
                .catch(() => {
                  message.error('Looking for WiFi failure. Please enable WiFi.');
                });
            });
        })
        .catch(() => {
          message.error('Looking for WiFi failure. Please enable WiFi.');
        });

      /* verify device from local storage */
      if (devicesStorage) {
        try {
          const devicesData: DeviceProps[] = JSON.parse(devicesStorage);
          console.log('load from local storage => ', devicesData);
          devicesData.forEach((item: DeviceProps) => {
            ble.isConnected(
              item.ble.id,
              () => {
                devices.push({ ...item, state: 'connected', step: step_default });
              },
              (error) => {
                console.log(error);
                devices.push({ ...item, state: 'disconnected', step: step_default });
              },
            );
          });
        } catch (error) {
          console.log(error);
        }
      }
    }
  })
  .catch((error) => {
    console.log(error);
  });

const stopTimerTimoutCreateDevice = (id: string) => {
  const _device = devices.find((item) => item.ble.id === id);

  if (_device && _device.step.timerTimeoutId) {
    console.log('clear timer: ', _device.step.timerTimeoutId);
    clearTimeout(_device.step.timerTimeoutId);
  }
};

const startTimerTimoutCreateDevice = (id: string, time: number) => {
  const _device = devices.find((item) => item.ble.id === id);

  if (_device) {
    _device.step.timerTimeoutId = setTimeout(() => {
      setStateActive(id, 'CONNECT', 'error');
      message.error('Device connect to server failed. Please try again.');
    }, time * 1000) as unknown as number;
    console.log('start timer: ', _device.step.timerTimeoutId);
  }
};

const closeCollapseDeviceWithTime = async (id: string, time: number) => {
  return new Promise((resolve) => {
    let _index = 0;
    const _found_device = devices.find((item, index) => {
      if (item.ble.id === id) {
        _index = index;
        return true;
      }
      return false;
    });
    if (_found_device) {
      setTimeout(() => {
        devices[_index].step.show = false;
        resolve(null);
      }, time * 1000);
    } else {
      resolve(null);
    }
  });
};

const setStateActive = (id: string, state: ConfigState, status: StepsProps['status']) => {
  let index: number = 0;
  const _found_device = devices.find((item, _index) => {
    if (item.ble.id === id) {
      index = _index;
      return true;
    }
    return false;
  });
  if (_found_device) {
    devices[index].step = {
      ...devices[index].step,
      status,
      current: stepMapValue[state].value,
    };
  }
};

const scanAccessPoint = async () => {
  loadingWiFi.value = true;
  try {
    await WifiWizard2.startScan();
    const networks: AccessPointInfo[] = await WifiWizard2.getScanResults({ numLevels: 0 });
    /* clear access point data in input select */
    accessPoint.value = [];
    console.log('accessPoint', accessPoint.value);
    console.log('networks', networks);
    // const _ap = networks.map(
    //   (network) =>
    //     ({ label: `${network.SSID} (${network.BSSID})`, value: network.SSID, key: network.BSSID }) as SelectOption,
    // );
    for (const network of networks) {
      accessPoint.value.push({
        label: `${network.SSID} (${network.BSSID})`,
        value: `${network.SSID}___${network.BSSID}`,
      } as SelectOption);
    }
    // networks.forEach((network) =>
    // );
  } catch (error) {
    console.log(error);
    message.warning('Bạn đang spam dịch vụ quét WiFi, vui lòng thử lại sau 15s');
  }
  loadingWiFi.value = false;
};

const genDataDevice = (ble: BLECentralPlugin.PeripheralData): DeviceProps => {
  return {
    showForm: false,
    state: 'disconnected',
    ssid: '',
    password: '',
    ble,
    online: true,
    step: {
      show: false,
      current: 0,
      status: 'wait',
      timerTimeoutId: 0,
    },
  };
};

const msgStateBle = {
  disconnected: {
    text: 'Kết nối',
    type: 'primary',
  },
  connecting: {
    text: 'Đang kết nối',
    type: 'warning',
  },
  connected: {
    text: 'Ngắt kết nối',
    type: 'error',
  },
  disconnecting: {
    text: 'Đang ngắt kết nối',
    type: 'warning',
  },
};

const msgStateBle2 = {
  disconnected: {
    text: 'Ngắt kết nối',
    color: 'primary',
  },
  connecting: {
    text: 'Đang kết nối',
    color: 'warning',
  },
  connected: {
    text: 'Kết nối',
    color: 'error',
  },
  disconnecting: {
    text: 'Đang ngắt kết nối',
    color: 'warning',
  },
};

const sendConfig = async (device: DeviceProps) => {
  try {
    if (device.state === 'connected') {
      device.step.show = true;

      /* init state config */
      setStateActive(device.ble.id, 'CONFIG', 'wait');

      /* do something right now */
      const ssid_completed = device.ssid.split('___')[0];
      // console.log('send config: ', device.ble.id, ssid_completed);
      const oldToken = authStore.runtimeToken;
      await authStore.forceRefreshToken();
      const token = authStore.runtimeToken;

      console.log('token is new', token !== oldToken);

      ble.write(
        device.ble.id,
        SERVICE_UUID,
        CHARACTER_UUID,
        new TextEncoder().encode(
          JSON.stringify({
            token,
            ssid: ssid_completed,
            password: device.password,
          }),
        ).buffer,
        () => {
          // console.log('Send config success');
          // message.success('Cấu hình WiFi đã được gửi.');
          setStateActive(device.ble.id, 'CONFIG', 'finish');

          /* start timer timeout */
          startTimerTimoutCreateDevice(device.ble.id, 25);
        },
        (error) => {
          console.error(error);
          // message.error('Cấu hình WiFi gửi không thành công.');
          setStateActive(device.ble.id, 'CONFIG', 'error');
        },
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const actionBle = async (device: DeviceProps) => {
  switch (device.state) {
    case 'disconnected':
      await connectBle(device);
      break;
    case 'connected':
      await disconnectBle(device);
      break;
    default:
      break;
  }
};

const connectBle = async (device: DeviceProps) => {
  try {
    if (device.state === 'disconnected') {
      console.log('connect: ', device.ble.id);
      device.state = 'connecting';
      /* do something right now */
      ble.connect(
        device.ble.id,
        (result) => {
          console.log(result);
          device.state = 'connected';
        },
        (error) => {
          console.error(error);
          device.state = 'disconnected';
        },
      );
    }
  } catch (error) {
    console.log(error);
    device.state = 'disconnected';
  }
};

const disconnectBle = async (device: DeviceProps) => {
  try {
    if (device.state === 'connected') {
      /* do something right now */
      console.log('disconnect: ', device.ble.id);
      device.state = 'disconnecting';
      ble.disconnect(
        device.ble.id,
        () => {
          device.state = 'disconnected';
        },
        (error) => {
          console.error(error);
          device.state = 'connected';
        },
      );
    }
  } catch (error) {
    console.log(error);
    device.state = 'connected';
  }
};

const openBluetooth = async () => {
  await ble.withPromises.enable();
};

const closeBluetooth = async () => {};

const scanBluetooth = async () => {
  try {
    await ble.withPromises.enable();
    if (scanning.value === false) {
      /* clear ble list */
      scanning.value = true;
      devices.forEach(async (device) => {
        ble.readRSSI(
          device.ble.id,
          (rssi: number) => {
            console.log(`rssi device ${device.ble.id}: ${rssi}`);
            device.online = true;
          },
          (err: string) => {
            console.log(err);
            device.online = false;
          },
        );
      });
      ble.scan([SERVICE_UUID], 5, (result) => {
        console.log('result: ', result);
        /* check device exist in list */
        const device = devices.find((item, index) => {
          if (result.id === item.ble.id) {
            devices[index] = genDataDevice(result);
            return true;
          }
        });
        if (device) {
          return;
        }
        devices.push(genDataDevice(result));
      });
      setTimeout(async () => {
        scanning.value = false;
        /* save data into local storage */
        localStorage.setItem('ble-devices', JSON.stringify(devices.map((item) => ({ ...item, online: false }))));
      }, 5000);
    }
  } catch (error) {
    console.log(error);
  }
};
</script>

<style scoped></style>
