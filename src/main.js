import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'; // 后期再更换主题色

import './assets/styles/base.css';

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);

app.use(ElementPlus);

app.mount('#app');