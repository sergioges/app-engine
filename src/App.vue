<script setup>
import { onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useReservationStore } from './stores/reservationStore'

const route = useRoute();

const reservationStore = useReservationStore();
const { fetchReservations } = reservationStore

const dbName = computed(() => route.query['test-mode'] === 'enable' ? 'test-cuca' : 'reservations');

onMounted(async () => {
  await fetchReservations(dbName.value);
});

// For testing porpuses, need to watch if there is a test query param - test-mode=enable
watch(dbName, (newVal) => {
  fetchReservations(newVal);
})
</script>

<template>
  <div>
    <router-view></router-view>
  </div>
</template>