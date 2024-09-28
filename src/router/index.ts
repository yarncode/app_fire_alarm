import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import AccountPage from '../views/AccountPage.vue';
import { useAuthStore } from '@/store/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/account',
    name: 'Account',
    component: AccountPage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  /* check is auth */
  let isAuth = true;

  /* if no token found */
  if (!authStore.runtimeToken || !authStore.refreshToken) {
    isAuth = false;
  }

  if (to.name !== 'Account' && isAuth === false) {
    next({ name: 'Account' });
  } else if (to.name === 'Account' && isAuth) {
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router;
