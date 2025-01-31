<template>
  <n-space>
    <n-float-button
      :show-menu="showModal"
      :right="'10%'"
      :bottom="'10%'"
      shape="circle"
      width="3rem"
      height="3rem"
      menu-trigger="click"
      @update:show-menu="_mapButtonHandler($route.name?.toString() ?? '')"
    >
      <n-icon>
        <SettingsOutline v-if="$route.name === 'Account'" />
        <GridOutline v-else />
      </n-icon>
    </n-float-button>
    <n-modal
      v-model:show="showModal"
      class="mx-auto w-4/5"
      preset="card"
      role="dialog"
      title="Information Server"
      size="huge"
    >
      <n-space vertical class="mt-2">
        <n-input v-model:value="serverSetting.hostName" round type="text" placeholder="domain" />
        <n-input v-model:value="serverSetting.entryPath" round type="text" placeholder="path" />
        <n-input v-model:value="serverSetting.apiVersion" round type="text" placeholder="api version" />
        <n-input-number v-model:value="serverSetting.portApi" round placeholder="Api port" />
        <n-input-number v-model:value="serverSetting.portSocket" round placeholder="Socket port" />
      </n-space>
      <template #action>
        <div class="flex justify-end">
          <n-button round @click="saveSetting">Save Changes</n-button>
        </div>
      </template>
    </n-modal>
  </n-space>
</template>

<script setup lang="ts">
import { useMessage, NInput, NFloatButton, NButton, NIcon, NModal, NSpace, NInputNumber } from 'naive-ui';
import { SettingsOutline, GridOutline } from '@vicons/ionicons5';
import { ref, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useSettingStore, SettingServer } from '@/store/setting';
import { useStateStore } from '@/store/state';

const message = useMessage();
const { server } = storeToRefs(useSettingStore());
const { saveServerSetting } = useSettingStore();
const { toggleMenuSideBar } = useStateStore();

const serverSetting: SettingServer = reactive({
  hostName: server.value.hostName,
  apiVersion: server.value.apiVersion,
  entryPath: server.value.entryPath,
  portApi: server.value.portApi,
  portSocket: server.value.portSocket,
});

const showModal = ref(false);

const openSetting = () => {
  /* reload data from store setting */
  serverSetting.hostName = server.value.hostName;
  serverSetting.apiVersion = server.value.apiVersion;
  serverSetting.entryPath = server.value.entryPath;
  serverSetting.portApi = server.value.portApi;
  serverSetting.portSocket = server.value.portSocket;

  showModal.value = true;
};

const saveSetting = () => {
  /* save server setting */
  saveServerSetting(serverSetting);
  /* notify save success */
  message.success('Server information is saved.');
};

const _mapButtonHandler = (routeName: string) => {
  switch (routeName) {
    case 'Account': {
      openSetting();
      break;
    }
    default: {
      toggleMenuSideBar();
      break;
    }
  }
};
</script>

<style scoped></style>
