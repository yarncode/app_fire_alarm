<template>
  <ion-content :fullscreen="true">
    <div style="margin: 0 0.5rem; height: 100%; display: flex; flex-direction: column">
      <!-- generate ui profile of user demo -->
      <n-card style="margin-top: 1rem">
        <div>
          <n-avatar size="large" style="margin-right: 1rem">
            <img src="https://i.pravatar.cc/300" />
          </n-avatar>
          <n-space>
            <n-text h4>Nguyễn Văn A</n-text>
            <n-text type="secondary">
              <n-icon>
                <CalendarOutline />
              </n-icon>
              12/12/2021
            </n-text>
          </n-space>
        </div>
        <div>
          <n-text>Địa chỉ: 12/12/2021</n-text>
          <n-text>Địa chỉ: 12/12/2021</n-text>
          <n-text>Địa chỉ: 12/12/2021</n-text>
        </div>
      </n-card>
      <!-- end generate ui profile of user demo -->
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { IonContent } from '@ionic/vue';
import { NCard, NSpace, NAvatar, NText, NIcon } from 'naive-ui';
import { CalendarOutline } from '@vicons/ionicons5';
</script>

<style lang="scss" scoped></style>
