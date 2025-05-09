<script setup>
import { ref, computed, reactive } from 'vue';

import { auth } from './plugins/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { db } from './plugins/firebase';
import { collection, addDoc } from 'firebase/firestore';

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

const date = ref([]);
const hosts = ref(1);
const pets = ref('No');
const form = ref(null);
const contactData = reactive({
  name: '',
  email: '',
  phone: ''
});

const emailValidation = ref ([
  v => !!v || 'Falta tu email',
  v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || 'Email inválido'
]);
const phoneValidation = ref ([
  v => !!v || 'Falta tu teléfono',
  v => /^\+?[1-9]\d{1,14}$/.test(v) || 'Teléfono inválido'
]);

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

async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Usuario registrado:', userCredential.user);
  } catch (error) {
    console.error('Error al registrar usuario:', error.message);
  }
}

// registerUser('sergioges@gmail.com', '10para-Esplugues');

async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Usuario autenticado:', userCredential.user);
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
  }
}

loginUser('sergioges@gmail.com', '10para-Esplugues');

// firebase deploy --only hosting:reservas-cuca-de-llum

async function sendData() {
  const { valid } = await form.value.validate();
  if (valid) {
    try {
      // Datos a guardar en Firestore
      const reservationData = {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        hosts: hosts.value,
        pets: pets.value,
        dates: formattedDate.value,
        totalNights: totalNights.value,
        createdAt: new Date() // Fecha de creación
      };

      // Guarda los datos en la colección "reservations"
      await addDoc(collection(db, 'reservations'), reservationData);

      alert('Reserva guardada exitosamente en Firebase!');
      resetData();
    } catch (error) {
      console.error('Error al guardar la reserva:', error);
      alert('Hubo un error al guardar la reserva. Inténtalo de nuevo.');
    }
  }
}

async function resetData () {
  await form.value.reset()
  pets.value = 'No'
  hosts.value = 1
  date.value = null
  }
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
        <v-form ref="form" class="mb-4">
          <v-row>
            <v-col class="d-flex flex-column ga-4 mb-4" cols="12" md="12">
              <v-text-field 
                v-model="formattedDate" 
                label="Check-in --- Check-out" 
                :rules="[v => !!v || 'Falta escoger fechas']"
                required
                prepend-icon="mdi-calendar" 
                hide-details="auto"
                variant="solo">
              </v-text-field>
              <p>Total de noches: {{ totalNights }}</p>
              <v-row>
                <v-col cols="12" md="6">
                  <v-number-input
                    v-model="hosts"
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
                    v-model="pets"
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
                v-model="contactData.name"
                required
                :rules="[v => !!v || 'Falta tu nombre']"
                label="Nombre" 
                prepend-icon="mdi-account-box-edit-outline" 
                hide-details="auto"
                variant="solo">
              </v-text-field>
              <v-text-field   
                v-model="contactData.email"
                required
                :rules="emailValidation"
                label="Email" 
                prepend-icon="mdi-email" 
                hide-details="auto"
                variant="solo">
              </v-text-field>
              <v-text-field 
                v-model="contactData.phone"
                required
                :rules="phoneValidation"
                label="Teléfono" 
                prepend-icon="mdi-phone" 
                hide-details="auto"
                variant="solo">
              </v-text-field>
            </v-col>
          </v-row>
          <v-btn
            class="mt-4"
            color="success"
            block
            @click="sendData"
          >
            Solicitar reserva
          </v-btn>

          <v-btn
            class="mt-4"
            color="error"
            block
            @click="resetData"
          >
            Borrar
          </v-btn>
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
