<template>
  <n-float-button :right="'10%'" :bottom="'10%'" shape="circle" width="3rem" height="3rem" menu-trigger="click">
    <n-icon>
      <SettingsOutline />
    </n-icon>
    <template #menu>
      <n-button-group vertical>
        <n-button round @click="openSetting">Server</n-button>
      </n-button-group>
    </template>
  </n-float-button>
  <n-modal
    class="mx-10"
    v-model:show="showModal"
    preset="card"
    title="Infomation Host"
    size="small"
    :mask-closable="false"
  >
    <n-space vertical class="mt-2">
      <n-input round v-model:value="commonSetting.server.hostName" type="text" placeholder="domain" />
      <n-input round v-model:value="commonSetting.server.entryPath" type="text" placeholder="path" />
      <n-input round v-model:value="commonSetting.server.apiVersion" type="text" placeholder="api version" />
      <n-input-number round v-model:value="commonSetting.server.apiPort" type="" placeholder="api version" />
      <n-input-number round v-model:value="commonSetting.server.socketPort" placeholder="api version" />
    </n-space>
    <template #action>
      <div class="flex justify-end">
        <n-button @click="saveSetting" round>Save Changes</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { useMessage, NButtonGroup, NInput, NFloatButton, NButton, NIcon, NModal, NSpace, NInputNumber } from 'naive-ui';
import { SettingsOutline } from '@vicons/ionicons5';
import { ref, reactive } from 'vue';
import { useSettingStore } from '@/store/setting';
import { useSocketStore } from '@/store/socket';
import { PayloadConfigEnv } from '@/config';
import { storeToRefs } from 'pinia';

const {
  _setHostName,
  _setApiPort,
  _setApiVersion,
  _setEntryPath,
  _setSocketPort,
  _hostName,
  _apiPort,
  _apiVersion,
  _entryPath,
  _socketPort,
} = useSettingStore();

const {
  _hostName: _settingHostName,
  _apiPort: _settingApiPort,
  _apiVersion: _settingApiVersion,
  _entryPath: _settingEntryPath,
  _socketPort: _settingSocketPort,
} = storeToRefs(useSettingStore());

const message = useMessage();

const commonSetting: PayloadConfigEnv = reactive({
  server: {
    hostName: _hostName,
    apiPort: _apiPort,
    apiVersion: _apiVersion,
    entryPath: _entryPath,
    socketPort: _socketPort,
  },
});

const showModal = ref(false);

const openSetting = () => {
  showModal.value = true;
};

const saveSetting = () => {
  let changed = false;

  if (_settingHostName.value !== commonSetting.server.hostName) {
    _setHostName(commonSetting.server.hostName);
    changed = true;
  }

  if (_settingApiPort.value !== commonSetting.server.apiPort) {
    _setApiPort(commonSetting.server.apiPort);
    changed = true;
  }

  if (_settingApiVersion.value !== commonSetting.server.apiVersion) {
    _setApiVersion(commonSetting.server.apiVersion);
    changed = true;
  }

  if (_settingEntryPath.value !== commonSetting.server.entryPath) {
    _setEntryPath(commonSetting.server.entryPath);
    changed = true;
  }

  if (_settingSocketPort.value !== commonSetting.server.socketPort) {
    _setSocketPort(commonSetting.server.socketPort);
    changed = true;
  }

  if (changed) {
    message.success('Save setting successfully');
    /* do something when setting changed */
    // setRemote(_settingHostName.value, _settingSocketPort.value);
  }
};
</script>

<style scoped></style>
