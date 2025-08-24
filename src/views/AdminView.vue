<script setup>
  import { onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import moment from 'moment'
  import 'moment/dist/locale/es'

  import AdminHeader from '@/components/admin/AdminHeader.vue'
  import AdminTable from '@/components/admin/AdminTable.vue'
  import AdminForm from '@/components/admin/AdminForm.vue'
  import AdminDisabledDays from '@/components/admin/AdminDisabledDays.vue'

  import { db } from '../plugins/firebase'
  import { doc, getDoc, updateDoc } from 'firebase/firestore'

  import { useReservationStore } from '@store/reservationStore'

  import { config } from '@plugin/config'

  import { parsePhoneNumberFromString } from 'libphonenumber-js'

  const { t } = useI18n()

  const reservationStore = useReservationStore()
  const { dbName, reservations, fetchReservations } = reservationStore

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
    aquisition: '',
    status: '',
    hostNotes: ''
  })

  const showEditForm = ref(false)
  const showSuccess = ref(false)
  const showError = ref(false)
  const isReservationsLoaded = ref(false)

  function getNationalPhone(rawNumber, countryCode = 'MX') {
    const phoneNumber = parsePhoneNumberFromString(rawNumber, countryCode)
    return phoneNumber?.isValid() ? phoneNumber.nationalNumber : null
  }

  async function fetchSelectedReservation(id) {
    showEditForm.value = true
    try {
      const reservationRef = doc(db, dbName, id)
      const reservationSnapshot = await getDoc(reservationRef)
      if (reservationSnapshot.exists()) {
        const data = reservationSnapshot.data()
        selectedReservation.value = {
          id,
          createdAt: new Date(data.createdAt).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          name: data.name,
          phone: getNationalPhone(data.phone),
          email: data.email,
          dates: [data.dates[0], data.dates[data.dates.length - 1]],
          totalNights: data.totalNights,
          hosts: data.hosts,
          pets: data.pets,
          aquisition: data.aquisition,
          status: data.status,
          hostNotes: data.hostNotes
        }
      } else {
        console.error(t('adminView.error.documentNoExists'))
        return
      }
    } catch (error) {
      console.error(t('adminForm.error.updateBooking'), error)
    }
  }

  function updateExpiredReservationsStatus() {
    const today = moment().utc().startOf('day').toISOString()

    reservations.forEach(reservation => {
      const dates = reservation.dates
      if (
        reservation.status === 'pending' &&
        moment(today).isSameOrAfter(moment(dates[dates.length - 1]), 'day')
      ) {
        updateReservation(reservation)
      }
    })
  }

  async function updateReservation(reservation) {
    if (!reservation.id) {
      console.error(t('adminForm.error.idNotIdentified'))
      return
    }

    try {
      const reservationRef = doc(db, dbName, reservation.id)
      await updateDoc(reservationRef, {
        status: 'cancelled'
      })
      await fetchReservations()
    } catch (error) {
      console.error(t('adminForm.error.updateBooking'), error)
    }
  }

  onMounted(async () => {
    await fetchReservations()
    updateExpiredReservationsStatus()
    isReservationsLoaded.value = true
  })
</script>

<template>
  <v-alert
    v-if="showSuccess"
    class="toast-alert"
    :title="$t('common.label.bookingReceivedTitle')"
    type="success"
    border="end"
    closable
  >
    <p>{{ $t('common.label.bookingReceived') }}</p>
  </v-alert>
  <v-alert
    v-if="showError"
    class="toast-alert"
    :title="$t('common.error.somethingMissing')"
    type="error"
    border="end"
    closable
  >
    <p v-html="$t('common.error.tryAgainWithMail', { email: config.email })" />
  </v-alert>
  <div class="container">
    <AdminHeader />
    <AdminForm
      v-model:showEditForm="showEditForm"
      v-model:selectedReservation="selectedReservation"
      v-model:showError="showError"
      v-model:showSuccess="showSuccess"
    />
    <AdminTable
      v-if="isReservationsLoaded"
      v-model:showEditForm="showEditForm"
      @fetchReservation="fetchSelectedReservation"
    />
    <AdminDisabledDays />
  </div>
</template>

<style scoped>
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

  .container {
    margin-bottom: 32px;
  }
</style>
