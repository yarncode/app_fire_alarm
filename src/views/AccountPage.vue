<template>
  <ion-content :fullscreen="true">
    <div style="margin: 0 2rem; height: 100%; display: flex; flex-direction: column; justify-content: center">
      <p style="font-size: 1.5rem">{{ viewMode === 'login' ? 'Register' : 'Login' }} Page</p>
      <n-form ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="large" style="margin: 1rem 0">
        <n-form-item label="Email" path="email">
          <n-input v-model:value="formValue.email" clearable placeholder="example: abc@gmail.com" />
        </n-form-item>
        <n-form-item label="Password" path="password">
          <n-input v-model:value="formValue.password" clearable placeholder="anything..." type="password" />
        </n-form-item>
        <n-collapse-transition :show="viewMode === 'register'">
          <n-form-item v-show="viewMode === 'register'" label="Confirm password" path="confirmPassword">
            <n-input v-model:value="formValue.confirmPassword" clearable placeholder="anything..." type="password" />
          </n-form-item>
        </n-collapse-transition>
        <n-button style="width: 100%; margin-top: 0.5rem" round type="primary" @click="submitForm">
          {{ viewMode === 'login' ? 'Login' : 'Register' }}
        </n-button>
        <n-divider dashed> or </n-divider>
        <n-button
          style="width: 100%; margin-top: 0.5rem"
          round
          type="default"
          @click="viewMode = viewMode === 'login' ? 'register' : 'login'"
        >
          {{ viewMode === 'login' ? 'Register' : 'Login' }}
        </n-button>
      </n-form>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { IonContent } from '@ionic/vue';
import { ref, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import {
  NFormItem,
  NForm,
  NInput,
  useMessage,
  FormInst,
  FormItemRule,
  NButton,
  NCollapseTransition,
  NDivider,
} from 'naive-ui';
import { useAuthStore } from '@/store/auth';
import { AxiosError } from 'axios';
import { ACCOUNT_MESSAGE, AccountResponse } from '@/interface/account';

type ViewMode = 'login' | 'register';

interface ResponseLogin extends AccountResponse {
  runtime_token: string;
  refresh_token: string;
}

/* get globalProperties */
const axios = getCurrentInstance()?.appContext.config.globalProperties.$axios;
const formRef = ref<FormInst | null>(null);
const viewMode = ref<ViewMode>('login');
const authStore = useAuthStore();
const router = useRouter();

const validateEmail = (rule: FormItemRule, value: string) => {
  return new Promise<void>((resolve, reject) => {
    /* regex check email */
    if (value.length == 0) {
      reject(new Error('Email is not empty')); // reject with error message
    }

    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!regex.test(value)) {
      reject(new Error('Email invalid')); // reject with error message
    } else {
      resolve();
    }
  });
};

const validatePassword = (rule: FormItemRule, value: string) => {
  return new Promise<void>((resolve, reject) => {
    if (value.length == 0) {
      reject(new Error('Password is not empty')); // reject with error message
    } else if (value.length > 20 || value.length < 8) {
      reject(new Error('Password must be between 8 and 20 characters'));
    } else if (
      formValue.value.password !== formValue.value.confirmPassword &&
      rule?.field === 'confirmPassword' &&
      viewMode.value === 'register'
    ) {
      reject(new Error('Confirm password is not match'));
    } else {
      resolve();
    }
  });
};

const rules = {
  email: {
    required: true,
    trigger: 'blur',
    validator: validateEmail,
  },
  password: {
    required: true,
    trigger: 'blur',
    validator: validatePassword,
  },
  confirmPassword: {
    required: true,
    trigger: 'blur',
    validator: validatePassword,
  },
};

const message = useMessage();
const formValue = ref({
  email: '',
  password: '',
  confirmPassword: '',
});

const submitForm = () => {
  if (formRef.value) {
    formRef.value.validate(async (errors: any) => {
      if (!errors) {
        console.log('submit', formValue.value);
        if (viewMode.value === 'login') {
          try {
            const response = await axios?.post('/account/login', {
              email: formValue.value.email,
              password: formValue.value.password,
            });
            const payload: ResponseLogin = response?.data;
            console.log(payload);

            if (payload.code === '108009') {
              message.success('Login successfully');
              authStore.setToken('refresh_token', payload.refresh_token);
              authStore.setToken('runtime_token', payload.runtime_token);
              router.push({ name: 'Home' });
            }
          } catch (error: any) {
            if (error instanceof AxiosError) {
              const data = error.response?.data as ResponseLogin;
              message.error(ACCOUNT_MESSAGE[data.code]);
            }
          }
        }
      } else {
        message.error('Please insert full information');
      }
    });
  }
};
</script>

<style lang="scss" scoped></style>
