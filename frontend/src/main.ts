/**
 * @file main.ts
 * @description Главный файл для инициализации Vue приложения.
 * @author @katerina2121 @KorzikAlex
 */
import App from '@/App.vue';
import { router } from '@/router';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import './assets/styles/main.scss';

const pinia = createPinia(); // Создание экземпляра Pinia для управления состоянием приложения

const app = createApp(App); // Создание экземпляра Vue приложения с корневым компонентом App

app.use(router); // Подключение маршрутизатора для управления навигацией в приложении
app.use(pinia); // Подключение Pinia для управления состоянием приложения

app.mount('#app'); // Монтирование приложения в элемент с id "app" в HTML.
