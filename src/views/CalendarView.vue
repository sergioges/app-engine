<script setup>
import { ref, computed, reactive, onMounted } from 'vue';

import { auth } from '../plugins/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { db } from '../plugins/firebase';
import { collection, addDoc, updateDoc, getDocs } from 'firebase/firestore';

import moment from 'moment';
import 'moment/dist/locale/es';

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import { useDisplay } from 'vuetify';

const display = useDisplay();

moment.locale('es');

const footerIcons = [
  {
    icon: 'mdi-whatsapp',
    url: 'https://api.whatsapp.com/send?phone=524423620391&text=Hola!%20Estoy%20interesad@%20en%20recibir%20más%20información%20de%20Cuca%20de%20Llum.'
  },
  {
    icon: 'mdi-mail',
    url: 'mailto:cucadellumcasarural@gmail.com'
  },
  {
    icon: 'mdi-instagram',
    url: 'https://www.instagram.com/cucadellumcasadecampo/'
  },
]

const reservations = reactive([])
const reservationDates = ref([]);
const hosts = ref(1);
const pets = ref('No');
const form = ref(null);
const showSuccess = ref(false);
const showError = ref(false);
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
  if (!reservationDates.value || reservationDates.value.length === 0) return;
  let dateFormat;
  if (isMobile.value.value) {
    dateFormat = reservationDates.value.map(d => moment(d).format('DD/MM/YYYY')).join(' --- ');
  } else {
    dateFormat = reservationDates.value.map(d => moment(d).format('DD/MM/YYYY (dddd)')).join(' --- ');
  }

  return dateFormat
});

const totalNights = computed(() => {
  if (!reservationDates.value || reservationDates.value.length < 2) return 0; 
  const [start, end] = reservationDates.value;
  return moment(end).diff(moment(start), 'days'); 
});

const disabledDates = computed(() => {
  // Filtra las reservas con estado "pending" o "paid"
  const filteredReservations = reservations.filter(
    (reservation) => reservation.status === 'paid'
  );

  // Extrae y aplana todas las fechas (dates) de las reservas filtradas
  const allDates = filteredReservations.flatMap((reservation) => reservation.dates);

  return [...new Set(allDates)]; // Elimina duplicados
});

const showPaidBtn = computed(() => {
  if (contactData.name && contactData.email && contactData.phone) return true
})

// async function registerUser(email, password) {
//   try {
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     console.log('Usuario registrado:', userCredential.user);
//   } catch (error) {
//     console.error('Error al registrar usuario:', error.message);
//   }
// }

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

async function fetchReservations() {
  // Clean up the reservations array before fetching new data.
  reservations.splice(0);
  try {
    const querySnapshot = await getDocs(collection(db, 'reservations'));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reservations.push({
        id: doc.id,
        createdAt: new Date(data.createdAt).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        name: data.name,
        phone: data.phone,
        email: data.email,
        dates: data.dates,
        totalNights: data.totalNights,
        hosts: data.hosts,
        pets: data.pets,
        status: data.status,
      });
    });
  } catch (error) {
    console.error('Error al obtener las reservas:', error);
  }
}

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = moment(startDate).startOf('day'); 
  const finalDate = moment(endDate).startOf('day'); 

  while (currentDate.isSameOrBefore(finalDate)) {
    // Establece la hora a las 00:00:00 y convierte a formato ISO
    const normalizedDate = moment(currentDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    dates.push(normalizedDate);
    currentDate.add(1, 'day');
  }

  return dates;
}

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
        dates: getDatesInRange(reservationDates.value[0], reservationDates.value[1]),
        totalNights: totalNights.value,
        status: 'pending',
        createdAt: moment().toISOString()
      };

      // Agrega el documento a Firestore y obtiene la referencia
      const docRef = await addDoc(collection(db, 'reservations'), reservationData);

      // Actualiza el documento para incluir el ID
      await updateDoc(docRef, { id: docRef.id });

      showSuccess.value = true;
      setTimeout(() => {
        showSuccess.value = false;
      }, 6000);
      resetData();
    } catch (error) {
      showError.value = true;
      setTimeout(() => {
        showError.value = false;
      }, 6000);
      console.error('Error al guardar la reserva:', error);
    }
  }
}

async function resetData () {
  await form.value.reset()
  pets.value = 'No'
  hosts.value = 1
  reservationDates.value = []
}

function openLink(url) {
  window.open(url, '_blank');
}

onMounted(() => {
  fetchReservations();
  const script = document.createElement('script');
  script.src = "https://js.stripe.com/v3/buy-button.js";
  script.async = true;
  document.head.appendChild(script);
});
</script>

<template>
  <v-container>
    <v-alert
      v-if="showSuccess"
      class="toast-alert"
      title="Hemos recibido tu solicitud de reserva"
      type="success"
      border="end"
      closable
    >
    <p>Nos pondremos en contacto contigo pronto. Para cualquier duda, puedes escribirnos a <a href='mailto:cucadellumcasarural@gmail.com'>nuestro mail.</a></p>
    </v-alert>
    <v-alert
      v-if="showError"
      class="toast-alert"
      title="Algo ha fallado"
      type="error"
      border="end"
      closable
    >
    <p>Por favor inténtalo de nuevo más tarde. Para cualquier duda, puedes escribirnos a <a href='mailto:cucadellumcasarural@gmail.com'>nuestro mail.</a></p>
    </v-alert>
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
        <h1 class="text-h4">Reserva tu estancia</h1>
        <h2 class="text-body-2">En el corazón de Amealco, Quéretaro, se encuentra Cuca de Llum, un lugar mágico donde la naturaleza y la tranquilidad se unen para ofrecerte una experiencia única.</h2>
        <VueDatePicker 
          v-model="reservationDates" 
          class="date-picker w-100"
          range
          multi-calendars 
          :enable-time-picker="false"
          :min-date="new Date()"
          :month-change-on-scroll="false"
          locale="es"
          inline 
          auto-apply
          :disabled-dates="disabledDates"
        />
        <p>Selecciona en el calendario, el rango de días que deseas reservar.</p>
        <v-text-field 
          v-model="formattedDate"
          label="Check-in --- Check-out" 
          :rules="[v => !!v || 'Falta escoger fechas']"
          required
          readonly
          prepend-icon="mdi-calendar" 
          hide-details="auto"
          variant="solo">
        </v-text-field>
        <v-form ref="form" class="mb-4">
          <v-row>
            <v-col class="d-flex flex-column ga-4 mb-2" cols="12" md="12">
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
          <v-row class="d-flex justify-center">
            <v-col v-if="showPaidBtn" cols="12">
              <div v-show="totalNights === 1" class="stripe-btn">
                <stripe-buy-button
                  buy-button-id="buy_btn_1RQDGNCIQLEDgwFHxF3CRbov"
                  publishable-key="pk_test_51RQD8NCIQLEDgwFH3qTpatBehR1DtMI3xjGyAuEwq4MvVnD7NR1c5cqjeK2mNeuheeim3aFybhtto4JWMBDBAKeR00u8NepdDY"
                >
                </stripe-buy-button>
              </div>
              <div v-show="totalNights === 2" class="stripe-btn">
                <stripe-buy-button
                  buy-button-id="buy_btn_1RQZclCIQLEDgwFHMMGB6KZD"
                  publishable-key="pk_test_51RQD8NCIQLEDgwFH3qTpatBehR1DtMI3xjGyAuEwq4MvVnD7NR1c5cqjeK2mNeuheeim3aFybhtto4JWMBDBAKeR00u8NepdDY"
                >
                </stripe-buy-button>
              </div>
              <v-btn
                v-if="totalNights >= 3"
                color="success"
                block
                @click="sendData"
              >
                Solicitar reserva
              </v-btn>
            </v-col>
            <v-col cols="6" md="3">
              <v-btn
               
                color="error"
                block
                @click="resetData"
              >
                Borrar
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <v-footer class="custom-footer text-center d-flex flex-column ga-2 py-4">
      <div class="d-flex ga-3">
        <v-btn
          v-for="item in footerIcons"
          :key="item.icon"
          :icon="item.icon"
          density="comfortable"
          variant="text"
          @click="openLink(item.url)"
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
@font-face {
  font-family: 'CelciusFlower';
  src: url('/fonts/celcius_flower.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'Cocomat';
  src: url('/fonts/cocomat.ttf') format('truetype');
  font-weight: bold;
  font-style: normal;
}

h1 {
  font-family: 'CelciusFlower', sans-serif;
}

h2 {
  font-family: 'Cocomat', sans-serif;
}

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

.toast-alert {
  position: fixed; 
  top: 20px; 
  right: 20px; 
  z-index: 9999; 
  max-width: 600px; 
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 16px; 
  text-align: left;
}

@media (max-width: 600px) {
  .toast-alert {
    top: 20px; 
    right: auto; 
    left: 50%; 
    transform: translateX(-50%); 
    width: 90%; 
  }
}

.toast-alert a {
  color: #ffffff; 
  font-weight: bold;
  text-decoration: none;;
}

.date-picker {
  justify-content: center;
  width: 100%;
}

.stripe-btn {
  margin: -20px 0;
}

.custom-footer {
  background-color: #665745; 
  color: white; 
}
</style>
