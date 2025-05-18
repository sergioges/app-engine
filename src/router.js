import { createRouter, createWebHistory } from 'vue-router';
import LoginView from './views/LoginView.vue';
import CalendarView from './views/CalendarView.vue';
import AdminView from './views/AdminView.vue';

const routes = [
    {
        path: '/',
        redirect: '/calendar',
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
      },
  {
    path: '/calendar',
    name: 'Calendar',
    component: CalendarView,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authToken = sessionStorage.getItem('authToken');

  if (to.meta.requiresAuth) {
    if (!authToken) {
      console.warn('No se encontró authToken. Redirigiendo al login...');
      return next('/login');
    }
    return next();
  }
  next();
});

export default router;