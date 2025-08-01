<script setup>
  import { computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'

  import { useI18n } from 'vue-i18n'

  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'

  import { useReservationStore } from '@store/reservationStore'

  import { useDisplay } from 'vuetify'

  import moment from 'moment'
  import 'moment/dist/locale/es'

  const display = useDisplay()
  const { t, locale } = useI18n()

  const reservationStore = useReservationStore()
  const { disabledDates } = storeToRefs(reservationStore)

  moment.locale(locale.value)

  const reservationDates = defineModel()
  const emit = defineEmits(['update:totalNights'])

  const isMobile = computed(() => display.smAndDown)
  // eslint-disable-next-line no-unused-vars
  const isDesktop = computed(() => display.mdAndUp)

  const formattedDate = computed(() => {
    if (!reservationDates.value || reservationDates.value.length === 0) return
    let dateFormat
    if (isMobile.value.value) {
      dateFormat = reservationDates.value
        .map(d => moment(d).format(t('common.label.formatDate')))
        .join(' --- ')
    } else {
      dateFormat = reservationDates.value
        .map(d => moment(d).format(`${t('common.label.formatDate')} (dddd)`))
        .join(' --- ')
    }

    return dateFormat
  })

  const totalNights = computed(() => {
    if (!reservationDates.value || reservationDates.value.length < 2) return 0
    const [start, end] = reservationDates.value
    return moment(end).diff(moment(start), 'days')
  })

  watch(totalNights, newVal => {
    emit('update:totalNights', newVal)
  })

  watch(locale, newLocale => {
    moment.locale(newLocale)
  })
</script>

<template>
  <VueDatePicker
    v-model="reservationDates"
    class="date-picker w-100"
    range
    multi-calendars
    :enable-time-picker="false"
    :min-date="new Date()"
    :month-change-on-scroll="false"
    :locale="locale"
    inline
    auto-apply
    :disabled-dates="disabledDates"
  />
  <p>{{ $t('calendarPicker.message.chooseDate') }}</p>
  <v-text-field
    v-model="formattedDate"
    label="Check-in --- Check-out"
    :rules="[v => !!v || 'Falta escoger fechas']"
    required
    readonly
    prepend-icon="mdi-calendar"
    hide-details="auto"
    variant="solo"
  ></v-text-field>
  <p>{{ $t('calendarPicker.label.totalNights', { totalNights }) }}</p>
</template>

<style lang="css" scoped>
  .date-picker {
    justify-content: center;
    width: 100%;
  }
</style>
