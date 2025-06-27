import { ref } from 'vue'
import { defineStore } from 'pinia'

import { db } from '../plugins/firebase'
import { collection, getDocs } from 'firebase/firestore'

import { config } from '@plugin/config'

import { parsePhoneNumberFromString } from 'libphonenumber-js'

import moment from 'moment'
import 'moment/dist/locale/es'

moment.locale('es')

export const useReservationStore = defineStore('reservation', () => {
  const reservations = ref([])
  const reservedDates = ref([]) // Paid dates.
  const disabledDates = ref([]) // Blocked dates by admin and reserved dates by client.
  // Set to prod DDBB.
  const dbName = ref('reservations')

  function setDbName(newDbName) {
    dbName.value = newDbName
  }

  function normalizePhoneNumber(rawNumber, countryCode = 'MX') {
    const phoneNumber = parsePhoneNumberFromString(rawNumber, countryCode)
    if (phoneNumber?.isValid()) {
      return phoneNumber.format('NATIONAL')
    } else {
      return null
    }
  }

  async function fetchReservations(options) {
    // Clean up the reservations array before fetching new data.
    reservations.value.splice(0)
    try {
      const querySnapshot = await getDocs(collection(db, dbName.value))
      querySnapshot.forEach(doc => {
        const data = doc.data()
        reservations.value.push({
          id: doc.id,
          createdAt: new Date(data.createdAt).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          name: data.name,
          phone: normalizePhoneNumber(data.phone),
          email: data.email,
          dates: data.dates,
          totalNights: data.totalNights,
          hosts: data.hosts,
          pets: data.pets,
          status: data.status
        })
      })
      getReservedDates()
      await getDisabledDates(options)
    } catch (error) {
      console.error('Error al obtener las reservas:', error)
    }
  }

  // Reserved dates from the client. Needed to generate the disabled dates.
  function getReservedDates() {
    // Filter reservations with status “paid”.
    const filteredReservations = reservations.value.filter(
      reservation => reservation.status === 'paid'
    )

    // Extract and flatten all the dates from the filtered reservations.
    const allDates = filteredReservations.flatMap(reservation => reservation.dates)

    reservedDates.value = [...new Set(allDates)]
  }

  // Disabled dates are the sum of reservedDates from the client and the blockedDates from the admin.
  async function getDisabledDates(options = {}) {
    const { includeExtraDisabledDates = false } = options
    try {
      // First get blocked dates from admin.
      const blockedDates = new Set()
      const querySnapshot = await getDocs(collection(db, config.dbNameBlockedDates))
      querySnapshot.forEach(doc => {
        const data = doc.data()
        if (data.dates && Array.isArray(data.dates)) {
          // Add each date to the Set (automatically removes duplicates).
          data.dates.forEach(date => blockedDates.add(date))
        }
      })

      // Set an array with blocked ordered dates.
      const orderedBlockedDates = Array.from(blockedDates).sort((a, b) => {
        return new Date(a) - new Date(b)
      })

      // Combine dates from the DDBB disabled-dates with the blocked dates.
      let combinedDates
      if (reservedDates.value && Array.isArray(reservedDates.value)) {
        const combinedSet = new Set([...orderedBlockedDates, ...reservedDates.value])
        combinedDates = Array.from(combinedSet).sort((a, b) => new Date(a) - new Date(b))
      } else {
        combinedDates = orderedBlockedDates
      }

      disabledDates.value = combinedDates

      if (includeExtraDisabledDates) {
        const today = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        const tomorrow = moment().add(1, 'day').startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        disabledDates.value = [...new Set([...combinedDates, today, tomorrow])]
      }
    } catch (error) {
      console.error('Error al obtener fechas deshabilitadas:', error)
    }
  }

  return {
    reservations,
    dbName,
    reservedDates,
    disabledDates,
    setDbName,
    fetchReservations,
    getReservedDates,
    getDisabledDates
  }
})
