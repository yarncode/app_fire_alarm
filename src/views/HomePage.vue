<template>
  <ion-content :fullscreen="true">
    <div style="margin: 0 0.5rem; height: 100%; display: flex; flex-direction: column">
      <n-button-group style="width: 100%; padding: 0.5rem 0">
        <n-button style="flex: 1" type="primary" round @click="openBluetooth">
          <template #icon>
            <n-icon><Bluetooth /></n-icon>
          </template>
          Open
        </n-button>
        <n-button style="flex: 1" type="error" @click="closeBluetooth">
          <template #icon>
            <n-icon><Bluetooth /></n-icon>
          </template>
          Close
        </n-button>
        <n-button style="flex: 1" type="warning" round @click="scanBluetooth" :disabled="scanning">
          <template #icon>
            <n-spin v-if="scanning" stroke="#000" size="small" />
            <n-icon v-else><Bluetooth /></n-icon>
          </template>
          <n-text style="color: inherit; margin-left: 0.4rem">Scan</n-text>
        </n-button>
      </n-button-group>
      <!-- show list device scan -->
      <n-list style="overflow-y: scroll" v-if="devices.length > 0" bordered clickable>
        <n-list-item v-for="(item, num) in devices" :key="num">
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
              <n-text style="display: block">Tên: {{ item.ble.name }}</n-text>
              <n-text style="display: block">ID: {{ item.ble.id }}</n-text>
              <n-text style="display: block">Tín hiệu: {{ item.ble.rssi }} (dB)</n-text>
              <n-text style="display: block">Trạng thái: {{ msgStateBle2[item.state].text }}</n-text>
            </div>
            <n-collapse-transition :show="item.state === 'connected'">
              <n-space vertical>
                <n-input v-model:value="item.ssid" type="text" placeholder="SSID" />
                <n-input v-model:value="item.password" type="text" placeholder="Password" />
                <n-space justify="end">
                  <n-button @click="sendConfig(item)" round>Cấu hình</n-button>
                </n-space>
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
  useMessage,
} from 'naive-ui';
import { reactive, ref } from 'vue';
import { Bluetooth } from '@vicons/ionicons5';

import { BleClient } from '@capacitor-community/bluetooth-le';

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTER_UUID = '1423492b-2bc3-4761-b2ba-8988573698a9';

interface DeviceProps {
  showForm: boolean;
  state: BLECentralPlugin.PeripheralState;
  ble: BLECentralPlugin.PeripheralData;
  ssid: string;
  password: string;
}

const scanning = ref(false);
const message = useMessage();
const devices: DeviceProps[] = reactive([]);

/* get device from local storage */
const devicesStorage = localStorage.getItem('ble-devices');

if (devicesStorage) {
  try {
    const devicesData: DeviceProps[] = JSON.parse(devicesStorage);
    console.log('load from local storage => ', devicesData);
    devicesData.forEach((item: DeviceProps) => {
      ble.isConnected(
        item.ble.id,
        () => {
          devices.push({ ...item, state: 'connected' });
        },
        (error) => {
          console.log(error);
          devices.push({ ...item, state: 'disconnected' });
        },
      );
    });
  } catch (error) {
    console.log(error);
  }
}

const genDataDevice = (ble: BLECentralPlugin.PeripheralData): DeviceProps => {
  return {
    showForm: false,
    state: 'disconnected',
    ssid: '',
    password: '',
    ble,
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

BleClient.initialize()
  .then(() => {
    console.log('Bluetooth LE initialized');
    BleClient.isEnabled()
      .then((isEnabled) => {
        console.log('Bluetooth LE enabled: ' + isEnabled);
      })
      .catch((error) => {
        console.error('Bluetooth LE check failed', error);
      });
  })
  .catch((error) => {
    console.error('Bluetooth LE initialization failed', error);
  });

const sendConfig = async (device: DeviceProps) => {
  try {
    if (device.state === 'connected') {
      /* do something right now */
      console.log('send config: ', device.ble.id);
      ble.write(
        device.ble.id,
        SERVICE_UUID,
        CHARACTER_UUID,
        new TextEncoder().encode(
          JSON.stringify({
            ssid: device.ssid,
            password: device.password,
          }),
        ).buffer,
        () => {
          console.log('Send config success');
          message.success('Cấu hình WiFi đã được gửi.');
        },
        (error) => {
          console.error(error);
          message.error('Cấu hình WiFi gửi không thành công.');
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
  try {
    if ((await BleClient.isEnabled()) === false) {
      await BleClient.enable();
    }
  } catch (error) {
    console.log(error);
  }
};

const closeBluetooth = async () => {
  try {
    if ((await BleClient.isEnabled()) === true) {
      await BleClient.disable();
    }
  } catch (error) {
    console.log(error);
  }
};

const scanBluetooth = async () => {
  try {
    if ((await BleClient.isEnabled()) === true && scanning.value === false) {
      /* clear ble list */
      scanning.value = true;
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
        localStorage.setItem('ble-devices', JSON.stringify(devices));
      }, 5000);
    }
  } catch (error) {
    console.log(error);
  }
};
</script>

<style scoped></style>
