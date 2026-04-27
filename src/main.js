import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

import 'element-plus/es/components/loading/style/css';
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/message-box/style/css';
import 'element-plus/es/components/notification/style/css';

import './assets/styles/base.css';
import './assets/styles/table.css';

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);

import { useAuthStore  } from '@/stores/auth';
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app');
