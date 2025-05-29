<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';

import { db } from '../plugins/firebase';
import { updateDoc, doc, getDoc } from 'firebase/firestore';

import { useReservationStore } from '@store/reservationStore'

import moment from 'moment';
import 'moment/dist/locale/es';

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const display = useDisplay();
const router = useRouter();
const route = useRoute();

const reservationStore = useReservationStore();
const { fetchReservations } = reservationStore
const { reservations } = storeToRefs(reservationStore)

const queryTestCode = route.query['test-mode'];

moment.locale('es');

const reservationStatus = ['paid', 'pending', 'cancelled'];
const headers = [
  {
    align: 'center',
    sortable: false,
    key: 'id',
    title: 'ID',
  },
  {
    align: 'center',
    sortable: true,
    key: 'createdAt',
    title: 'Creación',
  },
  {
    align: 'center',
    sortable: true,
    key: 'name',
    title: 'Nombre',
  },
  {
    align: 'center',
    sortable: false,
    key: 'phone',
    title: 'Teléfono',
  },
  {
    align: 'center',
    sortable: true,
    key: 'email',
    title: 'Email',
  },
  {
    align: 'center',
    sortable: true,
    key: 'dates',
    title: 'Reserva',
  },
  {
    align: 'center',
    sortable: false,
    key: 'totalNights',
    title: 'Noches',
  },
  {
    align: 'center',
    sortable: false,
    key: 'hosts',
    title: 'Huespedes',
  },
  {
    align: 'center',
    sortable: false,
    key: 'pets',
    title: 'Mascotas',
  },
  {
    align: 'center',
    sortable: true,
    key: 'status',
    title: 'Estado',
  },
]

const selectedReservation = ref({
  id: '',
  createdAt: '',
  name: '',
  phone: '',
  email: '',
  dates: [],
  totalNights: 0,
  hosts: 0,
  pets: 0,
  status: '',
});

const showEditForm = ref(false);
const valid = ref(false);
const showSuccess = ref(false);
const showError = ref(false);

const isMobile = computed(() => display.smAndDown);
const isDesktop = computed(() => display.mdAndUp);

const dbName = queryTestCode === 'enable' ? 'test-cuca' : 'reservations' 

const disabledDates = computed(() => {
  // Filter reservations with status “pending” or “paid”.
  const filteredReservations = reservations.value.filter(
    (reservation) => reservation.status === 'paid'
  );

  // Extract and flatten all the dates from the filtered reservations.
  const allDates = filteredReservations.flatMap((reservation) => reservation.dates);

  // Normalize the dates so that all have time set to 00:00 and remove duplicates.
  const normalizedDates = allDates.map((date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0); // Set the time to 00:00.
    return normalizedDate.toISOString(); // Convert to ISO format.
  });

  return [...new Set(normalizedDates)]; // Eliminate duplicates.
});

const maxDate = computed(() => {
  const today = new Date();
  const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  return nextYear;
});

const formattedDate = computed(() => {
  if (!selectedReservation.value.dates || selectedReservation.value.dates.length === 0) return;
  let dateFormat;
  if (isMobile.value.value) {
    dateFormat = selectedReservation.value.dates.map(d => moment(d).format('DD/MM/YYYY')).join(' --- ');
  } else {
    dateFormat = selectedReservation.value.dates.map(d => moment(d).format('DD/MM/YYYY (dddd)')).join(' --- ');
  }

  return dateFormat
});

const totalNights = computed(() => {
  if (!selectedReservation.value.dates || selectedReservation.value.dates.length < 2) return 0;
  const [start, end] = selectedReservation.value.dates;
  return moment(end).diff(moment(start), 'days');
});

function setStatusColor(status) {
  switch (status) {
    case 'paid':
      return 'green';
    case 'pending':
      return 'orange';
    case 'cancelled':
      return 'red';
    default:
      return 'grey';
  }
}

async function fetchSelectedReservation(id) {
  showEditForm.value = true;
  try {
    const reservationRef = doc(db, dbName, id);
    const reservationSnapshot = await getDoc(reservationRef);
    if (reservationSnapshot.exists()) {
      const data = reservationSnapshot.data();
      selectedReservation.value = {
        id,
        createdAt: new Date(data.createdAt).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        name: data.name,
        phone: data.phone,
        email: data.email,
        dates: [data.dates[0], data.dates[data.dates.length - 1]],
        totalNights: data.totalNights,
        hosts: data.hosts,
        pets: data.pets,
        status: data.status,
      };
    } else {
      console.error('El documento no existe.');
      return;
    }
  } catch (error) {
    console.error('Error al actualizar la reserva:', error);
  }
}

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = moment(startDate).startOf('day');
  const finalDate = moment(endDate).startOf('day');

  while (currentDate.isSameOrBefore(finalDate)) {
    // Convert the date to a Date object and set the time to 00:00:00.
    const normalizedDate = moment(currentDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    dates.push(normalizedDate); // Add the date in ISO format.
    currentDate.add(1, 'day'); // Move forward one day.
  }

  return dates;
}

async function updateReservation() {
  if (!selectedReservation.value.id) {
    console.error('El ID de la reserva no está definido.');
    return;
  }

  try {
    const reservationRef = doc(db, dbName, selectedReservation.value.id);
    await updateDoc(reservationRef, {
      name: selectedReservation.value.name,
      phone: selectedReservation.value.phone,
      email: selectedReservation.value.email,
      dates: getDatesInRange(selectedReservation.value.dates[0], selectedReservation.value.dates[1]),
      totalNights: totalNights.value,
      hosts: selectedReservation.value.hosts,
      pets: selectedReservation.value.pets,
      status: selectedReservation.value.status,
    });
    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
    }, 5000);
    await fetchReservations(dbName);
    cancelEditReservation();

  } catch (error) {
    showError.value = true;
    setTimeout(() => {
      showError.value = false;
      cancelEditReservation();
    }, 5000);
    console.error('Error al actualizar la reserva:', error);
  }
}

function cancelEditReservation() {
  showEditForm.value = false;
  selectedReservation.value = {
    id: '',
    createdAt: '',
    name: '',
    phone: '',
    email: '',
    dates: [],
    totalNights: 0,
    hosts: 0,
    pets: 0,
    status: '',
  };
}

function closeSession() {
  localStorage.removeItem('authToken');
  router.push('/calendar');
}

function getTotalNights(dateVal) {
  const message = isMobile.value.value ? `Noches:` : `Total de noches:`;
  if (!dateVal || dateVal.length < 2) return message;
  const [start, end] = dateVal;
  return `${message} ${moment(end).diff(moment(start), 'days')}`;
}

onMounted(() => {
  fetchReservations(dbName);
});
</script>

<template>
  <h1>Control de reservas</h1>
  <p>Esta es la vista de todas tus reservas registradas</p>
  <v-alert v-if="showSuccess" class="toast-alert" title="Hemos recibido tu solicitud de reserva" type="success"
    border="end" closable>
    <p>La reserva se ha actualizado con éxito.</p>
  </v-alert>
  <v-alert v-if="showError" class="toast-alert" title="Algo ha fallado" type="error" border="end" closable>
    <p>Por favor inténtalo de nuevo más tarde. Para cualquier duda, puedes escribirnos a <a
        href='mailto:cucadellumcasarural@gmail.com'>nuestro mail.</a></p>
  </v-alert>
  <v-container v-if="showEditForm">
    <v-card class="pa-4">
      <v-card-title class="text-h5">Editar Reserva</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field v-model="selectedReservation.createdAt" label="Creación" prepend-icon="mdi-account-wrench"
            outlined readonly></v-text-field>

          <v-text-field v-model="selectedReservation.name" label="Nombre" prepend-icon="mdi-rename" outlined
            required></v-text-field>

          <v-text-field v-model="selectedReservation.phone" label="Teléfono" prepend-icon="mdi-phone-outgoing" outlined
            required></v-text-field>

          <v-text-field v-model="selectedReservation.email" label="Email" prepend-icon="mdi-email-arrow-right" outlined
            required></v-text-field>

          <v-row>
            <v-col cols="12" class="d-flex justify-center mb-4">
              <VueDatePicker v-model="selectedReservation.dates" :min-date="new Date()" :max-date="maxDate" range
                format="dd/MM/yyyy" :enable-time-picker="false" locale="es" teleport-center cancelText="Cancelar"
                selectText="Seleccionar" :disabled-dates="disabledDates">
                <template #trigger>
                  <v-text-field v-model="formattedDate" label="Check-in --- Check-out" readonly outlined
                    prepend-icon="mdi-calendar" hide-details="auto">
                  </v-text-field>
                </template>
                <template #right-sidebar>
                  <p>Fechas escogidas previamente:</p>
                  <p>
                    {{ moment(selectedReservation.dates[0]).format('DD/MM') }}
                    -
                    {{ moment(selectedReservation.dates[selectedReservation.dates.length - 1]).format('DD/MM') }}
                  </p>
                </template>
                <template #action-preview="{ value }">
                  <h3>{{ getTotalNights(value) }}</h3>
                </template>
              </VueDatePicker>
            </v-col>
          </v-row>

          <v-text-field v-model="selectedReservation.hosts" label="Huéspedes" prepend-icon="mdi-account-multiple"
            outlined required type="number"></v-text-field>

          <!-- Mascotas -->
          <v-text-field v-model="selectedReservation.pets" label="Mascotas" prepend-icon="mdi-paw" outlined required
            type="string"></v-text-field>

          <!-- Estado -->
          <v-select v-model="selectedReservation.status" :items="reservationStatus" label="Estado"
            prepend-icon="mdi-list-status" outlined required></v-select>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="updateReservation">Guardar</v-btn>
        <v-btn color="error" @click="cancelEditReservation">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
  <v-container class="data-table">
    <v-row>
      <v-col>
        <v-data-table-virtual :headers="headers" :items="reservations" fixed-header height="400" class="elevation-1">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Reservas</v-toolbar-title>
            </v-toolbar>
          </template>
          <template v-slot:item.id="{ item }">
            <v-btn color="primary" @click="fetchSelectedReservation(item.id)">
              {{ item.id.slice(-5) }}
            </v-btn>
          </template>
          <template v-slot:item.dates="{ item }">
            <p>
              {{ moment(item.dates[0]).format('DD/MM') }}
              -
              {{ moment(item.dates[item.dates.length - 1]).format('DD/MM') }}
            </p>
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip :color="setStatusColor(item.status)" text-color="white">
              {{ item.status }}
            </v-chip>
          </template>
        </v-data-table-virtual>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex justify-end">
        <v-btn @click="closeSession" color="error">Cerrar sesión</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.data-table {
  max-width: max-content;
}

.v-card {
  max-width: 600px;
  margin: auto;
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
  text-decoration: none;
  ;
}
</style>