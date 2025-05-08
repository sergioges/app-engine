import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

// Vuetify
import vuetify from './plugins/vuetify';

const app = createApp(App);

app.component('VueDatePicker', VueDatePicker);

app.use(vuetify);

app.mount('#app');
