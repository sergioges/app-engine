import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useReservationStore = defineStore('reservation', () => {
  const reservationData = ref({});

  function setReservation(data) {
    reservationData.value = data;
  }

  function addReservation(newRes) {
    reservationData.value.push(newRes);
  }

  return { reservationData, setReservation, addReservation };
});