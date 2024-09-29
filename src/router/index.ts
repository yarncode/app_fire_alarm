import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/store/auth';

import HomePage from '../views/HomePage.vue';
import AccountPage from '../views/AccountPage.vue';
import ProfilePage from '../views/ProfilePage.vue';

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
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
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
  } else if (isAuth) {
    /* redirect to home if user attempt to login */
    if (to.name === 'Account') {
      next({ name: 'Home' });
    }

    /* dispatch check token */
    authStore.runCheckRefreshToken();
    next();
  } else {
    next();
  }
});

export default router;
