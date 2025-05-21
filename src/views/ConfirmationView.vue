<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { db } from '../plugins/firebase';
import { auth } from '../plugins/firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

const route = useRoute()
const router = useRouter();

const queryCode = route.query.paid
const idReservation = sessionStorage.getItem('idReservation')

const footerIcons = [
  {
    icon: 'mdi-whatsapp',
    url: 'https://api.whatsapp.com/send?phone=524423620391&text=Hola!%20Estoy%20interesad@%20en%20recibir%20más%20información%20de%20Cuca%20de%20Llum.'
  },
  {
    icon: 'mdi-mail',
    url: 'mailto:cucadellumcasarural@gmail.com'
  },
  {
    icon: 'mdi-instagram',
    url: 'https://www.instagram.com/cucadellumcasadecampo/'
  },
]

const shuffledNumbers = ref([])

onMounted(async () => {
  if (idReservation && queryCode === 'done') {
    router.push('')
  } else {
    router.push('/calendar')
  }
  shuffledNumbers.value = shuffleArray([...Array(9).keys()].map(i => i + 1))

  try {
    await loginUser(import.meta.env.VITE_LOGIN_USER, import.meta.env.VITE_LOGIN_PASSWORD)
    await updateReservationStatus(idReservation)
  } catch (error) {
    console.error('Error durante el proceso de login o actualización:', error)
  }
})

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const accessToken = userCredential.user.accessToken;
    localStorage.setItem('accessToken', accessToken);
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
  }
}

async function updateReservationStatus(id) {
  if (!id) return
  try {
    const reservationRef = doc(db, 'reservations', id);
    await updateDoc(reservationRef, { status: 'paid' });
  } catch (error) {
    console.error('Error al actualizar la reserva:', error);
  }
}
</script>

<template>
    <v-container class="confirmation-view">
      <h1 class="mt-2 mb-4">¡Pago recibido correctamente!</h1>
      <v-row align="center" justify="center">
        <v-col cols="12" md="6" class="content">
          <p>
            Hemos recibido tu pago correctamente. En los próximos días nos pondremos en contacto contigo 
            utilizando los datos que nos has proporcionado. Para tener todo listo para tu llegada.
          </p>
          <p>
            Mientras tanto, puedes ir conociendo lo que te espera en Amealco visitando 
            <a href="https://www.quehacerenamealco.com" target="_blank">www.quehacerenamealco.com</a>.
          </p>
          <a href="https://www.quehacerenamealco.com">
            <img src="../assets/QueHacerEnAmealco.svg" alt="Decorativo" width="180" />
          </a>
        </v-col>
        <v-col cols="12" md="6" class="mb-4">
          <v-row>
            <v-col
              v-for="n in shuffledNumbers"
              :key="n"
              class="images d-flex child-flex"
              cols="4"
            >
              <v-img
                :lazy-src="`/images/confirmation-${n}.jpg`"
                :src="`/images/confirmation-${n}.jpg`"
                aspect-ratio="1"
                class="bg-grey-lighten-2"
                cover
                position="center center"
              >
                <template v-slot:placeholder>
                  <v-row
                    align="center"
                    class="fill-height ma-0"
                    justify="center"
                  >
                    <v-progress-circular
                      color="grey-lighten-5"
                      indeterminate
                    ></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-footer class="custom-footer text-center d-flex flex-column ga-2 py-4">
        <div class="d-flex ga-3">
          <v-btn
            v-for="item in footerIcons"
            :key="item.icon"
            :icon="item.icon"
            density="comfortable"
            variant="text"
            @click="openLink(item.url)"
          ></v-btn>
        </div>

        <v-divider class="my-2" thickness="2" width="50"></v-divider>

        <div class="text-caption font-weight-regular opacity-60">
          Aunque suene curioso, “Cuca de Llum” no es una expresión típica mexicana, ¡pero tiene una historia muy especial! En algunas zonas de habla catalana (Cataluña, España), “Cuca de llum” significa literalmente luciérnaga. Es una forma poética y tierna de referirse a ese pequeño insecto que brilla en la oscuridad. La palabra “llum” significa luz, y “cuca” puede referirse a un bichito.
        </div>

        <v-divider></v-divider>

        <div>
          {{ new Date().getFullYear() }} — <strong>Cuca de Llum - Casa de Campo</strong>
        </div>
      </v-footer>
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

  .custom-footer {
    background-color: #665745; 
    color: white; 
    margin-top: auto;
    max-height: fit-content;
  }
  </style>