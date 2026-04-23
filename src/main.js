import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import './assets/styles/base.css';
import './assets/styles/table.css';

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);

app.use(ElementPlus);

import { useAuthStore  } from '@/stores/auth';
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app');