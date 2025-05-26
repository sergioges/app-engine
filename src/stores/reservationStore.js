import { reactive } from 'vue';
import { defineStore } from 'pinia';

import { db } from '../plugins/firebase';
import { collection, addDoc, updateDoc, getDocs } from 'firebase/firestore';

export const useReservationStore = defineStore('reservation', () => {
  const reservations = reactive([])

  async function fetchReservations(dbName = 'reservations') {
    // Clean up the reservations array before fetching new data.
    reservations.splice(0);
    try {
      const querySnapshot = await getDocs(collection(db, dbName));
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

  function addReservation(newRes) {
    reservations.push(newRes);
  }

  return { reservations, fetchReservations, addReservation };
});