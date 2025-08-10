<script setup>
  import { computed, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useDisplay } from 'vuetify'

  import { useI18n } from 'vue-i18n'

  import { db } from '../../plugins/firebase'
  import { updateDoc, doc } from 'firebase/firestore'

  import { useReservationStore } from '@store/reservationStore'

  import moment from 'moment'
  import 'moment/dist/locale/es'

  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'

  const display = useDisplay()

  const { t, locale } = useI18n()

  const reservationStore = useReservationStore()
  const { fetchReservations, dbName } = reservationStore
  const { disabledDates } = storeToRefs(reservationStore)

  moment.locale(locale.value)

  const statusItems = ['paid', 'pending', 'cancelled']
  const aquisitionItems = ['WhatsApp', 'Airbnb', 'Instagram', 'Web', 'email', 'Phone', 'Other']

  const showEditForm = defineModel('showEditForm')
  const selectedReservation = defineModel('selectedReservation')
  const showError = defineModel('showError')
  const showSuccess = defineModel('showSuccess')

  const valid = ref(false)

  const isMobile = computed(() => display.smAndDown)
  // eslint-disable-next-line no-unused-vars
  const isDesktop = computed(() => display.mdAndUp)

  const totalNights = computed(() => {
    if (!selectedReservation.value.dates || selectedReservation.value.dates.length < 2) return 0
    const [start, end] = selectedReservation.value.dates
    return moment(end).diff(moment(start), 'days')
  })

  const maxDate = computed(() => {
    const today = new Date()
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    return nextYear
  })

  const formattedDate = computed(() => {
    if (!selectedReservation.value.dates || selectedReservation.value.dates.length === 0) return
    let dateFormat
    if (isMobile.value.value) {
      dateFormat = selectedReservation.value.dates
        .map(d => moment(d).format(t('common.label.formatDate')))
        .join(' --- ')
    } else {
      dateFormat = selectedReservation.value.dates
        .map(d => moment(d).format(`${t('common.label.formatDate')} (dddd)`))
        .join(' --- ')
    }

    return dateFormat
  })

  const completedMailMessage = computed(
    () =>
      `${t('adminForm.label.thankfulMessage')} ${moment().add(1, 'day').startOf('day').format(t('common.label.formatDate'))}`
  )

  // Should be disabled the completed status, until:
  // 1. The endDate is bigger than currentDate.
  // 2. The status is different to paid.
  // You ensurance to send gratitude and Google opinions to a real conclude reservation.
  const isCompletedDisabled = computed(() => {
    if (!selectedReservation.value?.dates?.[1]) return true

    const endDate = moment(selectedReservation.value.dates[1]).startOf('day')
    const currentDate = moment().startOf('day')

    return endDate.isAfter(currentDate) || selectedReservation.value.status !== 'paid'
  })

  function getTotalNights(dateVal) {
    const message = isMobile.value.value
      ? t('adminForm.label.nights')
      : t('adminForm.label.totalNights')
    if (!dateVal || dateVal.length < 2) return message
    const [start, end] = dateVal
    return `${message} ${moment(end).diff(moment(start), 'days')}`
  }

  function getDatesInRange(startDate, endDate) {
    const dates = []
    let currentDate = moment(startDate).startOf('day')
    const finalDate = moment(endDate).startOf('day')

    while (currentDate.isSameOrBefore(finalDate)) {
      // Convert the date to a Date object and set the time to 00:00:00.
      const normalizedDate = moment(currentDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
      dates.push(normalizedDate) // Add the date in ISO format.
      currentDate.add(1, 'day') // Move forward one day.
    }

    return dates
  }

  async function updateReservation() {
    if (!selectedReservation.value.id) {
      console.error(t('adminForm.error.idNotIdentified'))
      return
    }

    try {
      const reservationRef = doc(db, dbName, selectedReservation.value.id)
      await updateDoc(reservationRef, {
        name: selectedReservation.value.name,
        phone: selectedReservation.value.phone,
        email: selectedReservation.value.email,
        dates: getDatesInRange(
          selectedReservation.value.dates[0],
          selectedReservation.value.dates[1]
        ),
        totalNights: totalNights.value,
        hosts: selectedReservation.value.hosts,
        pets: selectedReservation.value.pets,
        aquisition: selectedReservation.value.aquisition || '',
        status: selectedReservation.value.status
      })
      showSuccess.value = true
      setTimeout(() => {
        showSuccess.value = false
      }, 5000)
      await fetchReservations()
      cancelEditReservation()
    } catch (error) {
      showError.value = true
      setTimeout(() => {
        showError.value = false
        cancelEditReservation()
      }, 5000)
      console.error(t('adminForm.error.updateBooking'), error)
    }
  }

  function cancelEditReservation() {
    showEditForm.value = false
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
      aquisition: '',
      status: ''
    }
  }

  function sendCompltedMail() {
    selectedReservation.value.status = 'completed'
  }

  watch(locale, newLocale => {
    moment.locale(newLocale)
  })
</script>

<template>
  <v-container v-if="showEditForm">
    <v-card class="pa-4">
      <v-card-title class="text-h5">{{ t('adminForm.label.updateBooking') }}</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="selectedReservation.createdAt"
            :label="t('adminForm.label.creation')"
            prepend-icon="mdi-account-wrench"
            outlined
            readonly
          ></v-text-field>

          <v-text-field
            v-model="selectedReservation.name"
            :label="t('common.label.name')"
            prepend-icon="mdi-rename"
            outlined
            required
          ></v-text-field>

          <v-text-field
            v-model="selectedReservation.phone"
            :label="t('common.label.phone')"
            prepend-icon="mdi-phone-outgoing"
            outlined
            required
          ></v-text-field>

          <v-text-field
            v-model="selectedReservation.email"
            label="Email"
            prepend-icon="mdi-email-arrow-right"
            outlined
            required
          ></v-text-field>

          <v-row class="datepicker-wrapper">
            <v-col cols="12" class="d-flex justify-center mb-4">
              <VueDatePicker
                v-model="selectedReservation.dates"
                :min-date="new Date()"
                :max-date="maxDate"
                range
                format="dd/MM/yyyy"
                :enable-time-picker="false"
                :locale="locale"
                teleport-center
                :cancelText="t('common.label.cancel')"
                :selectText="t('common.label.select')"
                :disabled-dates="disabledDates"
              >
                <template #trigger>
                  <v-text-field
                    v-model="formattedDate"
                    label="Check-in --- Check-out"
                    readonly
                    outlined
                    prepend-icon="mdi-calendar"
                    hide-details="auto"
                  ></v-text-field>
                </template>
                <template #right-sidebar>
                  <p>{{ t('adminForm.label.previousDates') }}</p>
                  <p>
                    {{
                      moment(selectedReservation.dates[0]).format(
                        t('common.label.simplifyFormatDate')
                      )
                    }}
                    -
                    {{
                      moment(
                        selectedReservation.dates[selectedReservation.dates.length - 1]
                      ).format(t('common.label.simplifyFormatDate'))
                    }}
                  </p>
                </template>
                <template #action-preview="{ value }">
                  <h3>{{ getTotalNights(value) }}</h3>
                </template>
              </VueDatePicker>
            </v-col>
          </v-row>

          <v-text-field
            v-model="selectedReservation.hosts"
            :label="t('calendarForm.label.hosts')"
            prepend-icon="mdi-account-multiple"
            outlined
            required
            type="number"
          ></v-text-field>

          <v-text-field
            v-model="selectedReservation.pets"
            :label="t('adminForm.label.pets')"
            prepend-icon="mdi-paw"
            outlined
            required
            type="string"
          ></v-text-field>

          <v-select
            v-model="selectedReservation.aquisition"
            :items="aquisitionItems"
            :label="t('adminForm.label.aquisition')"
            prepend-icon="mdi-tag-plus"
            outlined
          ></v-select>

          <v-select
            v-model="selectedReservation.status"
            :items="statusItems"
            :label="t('adminForm.label.status')"
            prepend-icon="mdi-list-status"
            outlined
            required
          ></v-select>
          <v-btn color="info" :disabled="isCompletedDisabled" @click="sendCompltedMail">
            <span v-if="selectedReservation.status !== 'completed'">
              {{ t('adminForm.label.sendThankfulMessage') }}
            </span>
            <span v-else>{{ completedMailMessage }}</span>
          </v-btn>
        </v-form>
      </v-card-text>
      <v-divider class="my-4"></v-divider>
      <v-row justify="center" align="center" class="pa-3">
        <v-btn color="success" class="mx-2" @click="updateReservation">
          {{ t('common.label.save') }}
        </v-btn>
        <v-btn color="error" class="mx-2" @click="cancelEditReservation">
          {{ t('common.label.cancel') }}
        </v-btn>
      </v-row>
    </v-card>
  </v-container>
</template>

<style lang="css" scoped>
  .v-card {
    max-width: 600px;
    margin: auto;
  }

  .datepicker-wrapper {
    position: relative;
    z-index: 1000;
  }
</style>
