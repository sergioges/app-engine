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

async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const accessToken = userCredential.user.accessToken;
    localStorage.setItem('accessToken', accessToken);
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
  }
}

loginUser(import.meta.env.VITE_LOGIN_USER, import.meta.env.VITE_LOGIN_PASSWORD);

async function sendData() {
  const { valid } = await form.value.validate();
  if (valid) {
    try {
      const reservationData = {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        hosts: hosts.value,
        pets: pets.value,
        dates: formattedDate.value,
        totalNights: totalNights.value,
        status: 'pending',
        createdAt: new Date()
      };

      // Agrega el documento a Firestore y obtiene la referencia
      const docRef = await addDoc(collection(db, 'reservations'), reservationData);

      // Actualiza el documento para incluir el ID
      await updateDoc(docRef, { id: docRef.id });

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

function openLink(url) {
  window.open(url, '_blank');
}
</script>

<template>
  <v-container>
    <v-row align="start" justify="center" class="mt-5">
      <v-col class="d-flex flex-column ga-4" cols="12" md="8">
        <a href="https://cuca-de-llum.web.app" target="_blank">
          <v-img
            src="/cuca-de-llum-logo.png"
            class="logo"
            alt="Cuca de Llum logo"
            contain
          ></v-img>
        </a>
        <h1 class="text-h5 font-weight-bold">Reserva tu estancia</h1>
        <p class="text-body-2">En el corazón de Amealco, Quéretaro, se encuentra Cuca de Llum, un lugar mágico donde la naturaleza y la tranquilidad se unen para ofrecerte una experiencia única.</p>
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
    <v-footer class="custom-footer text-center d-flex flex-column ga-2 py-4">
      <div class="d-flex ga-3">
        <v-btn
          v-for="icon in icons"
          :key="icon"
          :icon="icon"
          density="comfortable"
          variant="text"
          @click="openLink('https://www.instagram.com/cucadellumcasadecampo/')"
        ></v-btn>
      </div>

      <v-divider class="my-2" thickness="2" width="50"></v-divider>

      <div class="text-caption font-weight-regular opacity-60">
        Aunque suene curioso, “Cuca de Llum” no es una expresión típica mexicana, ¡pero tiene una historia muy especial! En algunas zonas de habla catalana (Cataluña, España), “Cuca de llum” significa literalmente luciérnaga. Es una forma poética y tierna de referirse a ese pequeño insecto que brilla en la oscuridad. La palabra “llum” significa luz, y “cuca” puede referirse a un bichito.
      </div>

      <v-divider></v-divider>

      <div>
        {{ new Date().getFullYear() }} — <strong>Cuca de Llum - Casa de Campo</strong>
      </div>
    </v-footer>
  </v-container>
</template>

<style scoped>
.logo {
  width: 80%; 
  height: auto;
  border-radius: 5px; 
  margin: 0 auto; 
  margin-bottom: 20px; 
}

@media (min-width: 960px) { 
  .logo {
    width: 30%; 
  }
}

.date-picker {
  justify-content: center;
  width: 100%;
}

.custom-footer {
  background-color: #665745; 
  color: white; 
}
</style>
