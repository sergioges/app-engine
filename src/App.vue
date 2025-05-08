<script setup>
import { ref, computed } from 'vue';

import moment from 'moment';
import 'moment/dist/locale/es';

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import { useDisplay } from 'vuetify';

const display = useDisplay();

moment.locale('es');

const icons = [
    'mdi-facebook',
    'mdi-twitter',
    'mdi-linkedin',
    'mdi-instagram',
  ]

const date = ref();

const isMobile = computed(() => display.smAndDown);
const isDesktop = computed(() => display.mdAndUp); 

const formattedDate = computed(() => {
  if (!date.value || date.value.length === 0) return;
  let dateFormat;
  if (isMobile.value.value) {
    dateFormat = date.value.map(d => moment(d).format('DD/MM/YYYY')).join(' --- ');
  } else {
    dateFormat = date.value.map(d => moment(d).format('DD/MM/YYYY (dddd)')).join(' --- ');
  }

  return dateFormat
});

const totalNights = computed(() => {
  if (!date.value || date.value.length < 2) return 0; 
  const [start, end] = date.value;
  return moment(end).diff(moment(start), 'days'); 
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
  <v-container>
    <v-row align="start" justify="center" class="mt-5">
      <v-col class="d-flex flex-column ga-4" cols="12" md="8">
        <a href="https://vite.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
        </a>
        <VueDatePicker 
          v-model="date" 
          class="date-picker w-100"
          range
          multi-calendars 
          :enable-time-picker="false"
          :min-date="new Date()"
          :disabled-dates="disabledDates"
          locale="es"
          inline 
          auto-apply
        />
        <v-form>
          <v-row>
            <v-col class="d-flex flex-column ga-4 mb-4" cols="12" md="12">
              <v-text-field 
                v-model="formattedDate" 
                label="Check-in --- Check-out" 
                prepend-icon="mdi-calendar" 
                hide-details="auto"
                variant="solo">
              </v-text-field>
              <p>Total de noches: {{ totalNights }}</p>
              <v-row>
                <v-col cols="12" md="6">
                  <v-number-input
                    :reverse="false"
                    controlVariant="split"
                    label="Número de huéspedes"
                    prepend-icon="mdi-account-multiple-check" 
                    :hideInput="false"
                    :min="1"
                    :max="4"
                    hide-details="auto"
                    variant="solo">
                  </v-number-input>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    label="¿Llevas mascotas?"
                    :items="['Si', 'No']"
                    prepend-icon="mdi-paw" 
                    variant="solo"
                    hide-details="auto"
                  ></v-select>
                </v-col>
              </v-row>
              <p>Datos de contacto</p>
              <v-text-field 
                label="Nombre" 
                prepend-icon="mdi-account-box-edit-outline" 
                hide-details="auto"
                variant="solo">
              </v-text-field>
              <v-text-field 
                label="Email" 
                prepend-icon="mdi-email" 
                hide-details="auto"
                variant="solo">
              </v-text-field>
              <v-text-field 
                label="Teléfono" 
                prepend-icon="mdi-phone" 
                hide-details="auto"
                variant="solo">
              </v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <v-footer class="text-center d-flex flex-column ga-2 py-4" color="indigo-lighten-1">
      <div class="d-flex ga-3">
        <v-btn
          v-for="icon in icons"
          :key="icon"
          :icon="icon"
          density="comfortable"
          variant="text"
        ></v-btn>
      </div>

      <v-divider class="my-2" thickness="2" width="50"></v-divider>

      <div class="text-caption font-weight-regular opacity-60">
        Phasellus feugiat arcu sapien, et iaculis ipsum elementum sit amet. Mauris cursus commodo interdum. Praesent ut risus eget metus luctus accumsan id ultrices nunc. Sed at orci sed massa consectetur dignissim a sit amet dui. Duis commodo vitae velit et faucibus. Morbi vehicula lacinia malesuada. Nulla placerat augue vel ipsum ultrices, cursus iaculis dui sollicitudin. Vestibulum eu ipsum vel diam elementum tempor vel ut orci. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
      </div>

      <v-divider></v-divider>

      <div>
        {{ new Date().getFullYear() }} — <strong>Vuetify</strong>
      </div>
    </v-footer>
  </v-container>
</template>

<style scoped>
.logo {
  height: 5em;
  padding: 0.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.date-picker {
  justify-content: center;
  width: 100%;
}
</style>
