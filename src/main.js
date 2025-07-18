import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

import vuetify from './plugins/vuetify'

import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'

const i18n = createI18n({
  legacy: false,
  locale: 'es',
  fallbackLocale: 'en',
  messages: {
    en,
    es
  }
})

const app = createApp(App)

app.component('VueDatePicker', VueDatePicker)

app.use(router)

app.use(createPinia())

app.use(vuetify)

app.use(i18n)

app.mount('#app')
