<script setup>
import { ref, computed } from 'vue';

import moment from 'moment';
import 'moment/dist/locale/es';

import HelloWorld from './components/HelloWorld.vue'

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

moment.locale('es');

const date = ref();

const formattedDate = computed(() => {
  if (!date.value || date.value.length === 0) return 'No hay fecha seleccionada';
    return date.value
      .map(d => moment(d).format('DD/MM/YYYY (dddd)'))
      .join('\n');
});

// For demo purposes disables the next 2 days from the current date
const disabledDates = computed(() => {
  const today = new Date();

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const afterTomorrow = new Date(tomorrow);
  afterTomorrow.setDate(tomorrow.getDate() + 1);

  return [tomorrow, afterTomorrow]
})
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <VueDatePicker 
      v-model="date" 
      multi-dates
      multi-calendars 
      :enable-time-picker="false"
      :min-date="new Date()"
      :disabled-dates="disabledDates"
      locale="es"
      inline 
      auto-apply
      />
      <pre>{{ formattedDate }}</pre>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
