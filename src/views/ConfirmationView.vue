<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import FooterApp from '@/components/FooterApp.vue'

  import { db } from '../plugins/firebase'
  import { updateDoc, doc } from 'firebase/firestore'

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  import { config } from '@plugin/config'

  const idReservation = sessionStorage.getItem('idReservation')
  // For testing porpuses.
  const dbName =
    'testing' in route.query && route.query.testing === 'enabled'
      ? config.dbNameTest
      : config.dbNameProd

  const shuffledNumbers = ref([])

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  async function updateReservationStatus(id) {
    if (!id) return
    try {
      const docRef = doc(db, dbName, id)
      await updateDoc(docRef, { status: 'paid' })
    } catch (error) {
      console.error(t('adminForm.error.updateBooking'), error)
    }
  }

  onMounted(async () => {
    if ('paid' in route.query && route.query.paid === 'done') {
      router.push('')
    } else {
      router.push('/calendar')
    }
    shuffledNumbers.value = shuffleArray([...Array(9).keys()].map(i => i + 1))

    try {
      await updateReservationStatus(idReservation)
    } catch (error) {
      console.error(t('confirmationView.error.loginProcess'), error)
    }
  })

  onUnmounted(() => {
    sessionStorage.removeItem('idReservation')
  })
</script>

<template>
  <v-container class="confirmation-view">
    <h1 class="mt-2 mb-4">{{ $t('confirmationView.label.paidReceived') }}</h1>
    <v-row align="center" justify="center">
      <v-col cols="12" md="6" class="content">
        <p>{{ $t('confirmationView.message.paidReceived') }}</p>
        <p v-html="$t('confirmationView.message.visitAmealco')" />
        <a href="https://www.quehacerenamealco.com">
          <img src="../assets/QueHacerEnAmealco.svg" alt="Decorativo" width="180" />
        </a>
      </v-col>
      <v-col cols="12" md="6" class="mb-4">
        <v-row>
          <v-col v-for="n in shuffledNumbers" :key="n" class="images d-flex child-flex" cols="4">
            <v-img
              :lazy-src="`/images/confirmation-${n}.jpg`"
              :src="`/images/confirmation-${n}.jpg`"
              aspect-ratio="1"
              class="bg-grey-lighten-2"
              cover
              position="center center"
            >
              <template v-slot:placeholder>
                <v-row align="center" class="fill-height ma-0" justify="center">
                  <v-progress-circular color="grey-lighten-5" indeterminate />
                </v-row>
              </template>
            </v-img>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <FooterApp />
  </v-container>
</template>

<style scoped>
  .confirmation-view {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    text-align: center;
  }

  h1 {
    font-family: 'CelciusFlower', sans-serif;
    font-size: 40px;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-family: 'Cocomat', sans-serif;
  }

  .images {
    padding: 0.5rem;
  }

  .contact-info {
    margin: 1rem 0;
  }

  .contact-info p {
    margin: 0.5rem 0;
  }
</style>
