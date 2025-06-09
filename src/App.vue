<script setup>
  import { computed, watch } from 'vue'
  import { useRoute } from 'vue-router'

  import { useReservationStore } from '@store/reservationStore'

  const route = useRoute()

  const reservationStore = useReservationStore()
  const { setDbName } = reservationStore

  const dbName = computed(() =>
    route.query['test-mode'] === 'enabled' ? 'test-cuca' : 'reservations'
  )

  // For testing porpuses, need to watch if there is a test query param - test-mode=enabled
  watch(
    dbName,
    newVal => {
      setDbName(newVal)
    },
    { immediate: true }
  )
</script>

<template>
  <div>
    <router-view></router-view>
  </div>
</template>
