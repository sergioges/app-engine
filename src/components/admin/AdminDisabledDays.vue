<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { storeToRefs } from 'pinia'

  import { useI18n } from 'vue-i18n'

  import { db } from '@/plugins/firebase'
  import { collection, addDoc, updateDoc, getDocs, doc } from 'firebase/firestore'

  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'

  import { useReservationStore } from '@store/reservationStore'

  import { config } from '@plugin/config'

  import moment from 'moment'
  import 'moment/dist/locale/es'

  const { t, locale } = useI18n()

  const reservationStore = useReservationStore()
  const { reservedDates } = storeToRefs(reservationStore)

  moment.locale('es')

  const selectedBlockedDates = ref([])
  const orderedblockedDates = ref([])
  const successMessage = ref('')
  const showSuccess = ref(false)
  const showError = ref(false)

  const markers = computed(() => {
    // First, process reservedDates (marked in red)
    const reservedMarkers = reservedDates.value.map(date => {
      const formattedDate = new Date(date)
      return {
        date: formattedDate,
        type: 'line',
        color: 'red',
        tooltip: [{ text: t('adminDisabledDays.label.reserved') }]
      }
    })

    // Then, process orderedblockedDates (marked in blue)
    const blockedMarkers = orderedblockedDates.value.map(date => {
      const formattedDate = new Date(date)
      return {
        date: formattedDate,
        type: 'line',
        color: 'blue',
        tooltip: [{ text: t('adminDisabledDays.label.blocked') }]
      }
    })

    return [...blockedMarkers, ...reservedMarkers]
  })

  async function getBlockedDates() {
    try {
      let idCollection
      const blockedDates = new Set()
      const querySnapshot = await getDocs(collection(db, config.dbNameBlockedDates))
      querySnapshot.forEach(doc => {
        const data = doc.data()
        idCollection = doc.id
        if (data.dates && Array.isArray(data.dates)) {
          // Add each date to the Set (automatically removes duplicates).
          data.dates.forEach(date => blockedDates.add(date))
        }
      })

      // Set an array with ordered dates.
      orderedblockedDates.value = Array.from(blockedDates).sort((a, b) => {
        return new Date(a) - new Date(b)
      })

      // Need this return to know if there is a previous collection DDBB.
      return idCollection
    } catch (error) {
      console.error(t('adminDisabledDays.error.getBlockedDays'), error)
    }
  }

  async function addBlockedDates() {
    if (!selectedBlockedDates.value || selectedBlockedDates.value.length === 0) {
      return
    }
    let sortedDates = []
    try {
      const idCollection = await getBlockedDates()

      const allBlockedDates = new Set(orderedblockedDates.value)
      // Format the date consistently to ensure proper storage and and to Set to avoid duplicates.
      selectedBlockedDates.value.forEach(date => {
        const normalizedDate = moment(date).startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        allBlockedDates.add(normalizedDate)
      })
      sortedDates = Array.from(allBlockedDates).sort((a, b) => {
        return new Date(a) - new Date(b)
      })
      const blockedDatesData = {
        dates: sortedDates,
        updatedAt: moment().toISOString()
      }

      if (!idCollection) {
        await addDoc(collection(db, config.dbNameBlockedDates), blockedDatesData)
      } else {
        const docRef = doc(db, config.dbNameBlockedDates, idCollection)
        await updateDoc(docRef, blockedDatesData)
      }

      showSuccess.value = true
      successMessage.value = t('adminDisabledDays.label.blockedSuccess')
      setTimeout(() => {
        showSuccess.value = false
      }, 6000)
    } catch (error) {
      showError.value = true
      setTimeout(() => {
        showError.value = false
      }, 6000)
      console.error(t('adminDisabledDays.error.saveBlockedDays'), error)
    } finally {
      orderedblockedDates.value = sortedDates
      selectedBlockedDates.value = []
    }
  }

  async function eliminateBlockedDates() {
    if (!selectedBlockedDates.value || selectedBlockedDates.value.length === 0) {
      return
    }
    let sortedDates = []
    try {
      const idCollection = await getBlockedDates()

      if (!idCollection) {
        showError.value = true
        setTimeout(() => {
          showError.value = false
        }, 6000)
        console.error(t('adminDisabledDays.error.noBlockedDays'))
        return
      }

      // Use set to avoid duplicates.
      const remainingBlockedDates = new Set(orderedblockedDates.value)

      selectedBlockedDates.value.forEach(dateToRemove => {
        const normalizedDateToRemove = moment(dateToRemove)
          .startOf('day')
          .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        remainingBlockedDates.delete(normalizedDateToRemove)
      })

      // Convert back to sorted array.
      sortedDates = Array.from(remainingBlockedDates).sort((a, b) => {
        return new Date(a) - new Date(b)
      })

      const blockedDatesData = {
        dates: sortedDates,
        updatedAt: moment().toISOString()
      }

      const docRef = doc(db, config.dbNameBlockedDates, idCollection)
      await updateDoc(docRef, blockedDatesData)

      showSuccess.value = true
      successMessage.value = t('adminDisabledDays.label.blockedSuccess')
      setTimeout(() => {
        showSuccess.value = false
      }, 6000)
    } catch (error) {
      console.error(t('adminDisabledDays.error.reopenDays'), error)
      showError.value = true
      setTimeout(() => {
        showError.value = false
      }, 6000)
    } finally {
      orderedblockedDates.value = sortedDates
      selectedBlockedDates.value = []
    }
  }

  onMounted(async () => {
    await getBlockedDates()
  })
</script>

<template>
  <v-alert
    v-if="showSuccess"
    class="toast-alert"
    :title="successMessage"
    type="success"
    border="end"
    closable
  />
  <v-alert
    v-if="showError"
    class="toast-alert"
    :title="t('common.error.somethingMissing')"
    type="error"
    border="end"
    closable
  >
    <p>{{ t('common.error.tryAgain') }}</p>
  </v-alert>
  <div class="disabled-days">
    <h2>{{ t('adminDisabledDays.label.disableDays') }}</h2>
    <p>{{ t('adminDisabledDays.label.selectDisabledDays') }}</p>
    <VueDatePicker
      v-model="selectedBlockedDates"
      class="date-picker w-100"
      multi-calendars
      multi-dates
      :enable-time-picker="false"
      :min-date="new Date()"
      :month-change-on-scroll="false"
      :locale="locale"
      inline
      auto-apply
      :markers="markers"
      :disabled-dates="reservedDates"
    >
      <template #marker-tooltip="{ tooltip }">
        <span>{{ tooltip.text }}</span>
      </template>
    </VueDatePicker>
    <v-row justify="center" class="px-5">
      <v-col cols="12" md="3" class="pa-2">
        <v-btn @click="addBlockedDates" color="error" block>
          {{ t('adminDisabledDays.label.blockDays') }}
        </v-btn>
      </v-col>
      <v-col cols="12" md="3" class="pa-2">
        <v-btn @click="eliminateBlockedDates" color="info" block>
          {{ t('adminDisabledDays.label.reopenDays') }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<style lang="css" scoped>
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

  .disabled-days {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .date-picker {
    justify-content: center;
    width: 100%;
  }

  @media (max-width: 600px) {
    .date-picker {
      padding: 0 16px;
    }
  }
</style>
