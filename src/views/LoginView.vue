<script setup>
import { ref } from 'vue';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

const username = ref('');
const password = ref('');

async function login() {
  const auth = getAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, username.value, password.value);
    const accessToken = await userCredential.user.getIdToken();

    sessionStorage.setItem('authToken', accessToken);

    router.push('/admin');
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
  }
}
</script>

<template>
    <v-container class="align-container">
        <v-row align="start" justify="center">
            <v-col class="d-flex flex-column ga-4" cols="12" md="8">
                <a href="https://cuca-de-llum.web.app" target="_blank">
                    <v-img
                        src="/cuca-de-llum-logo.png"
                        class="logo"
                        alt="Cuca de Llum logo"
                        contain
                    ></v-img>
                </a>
                <v-card class="pa-4">
                    <v-card-title class="text-h5 text-center">Iniciar Sesión</v-card-title>
                    <v-card-text>
                    <v-form>
                        <!-- Campo de Usuario -->
                        <v-text-field
                        v-model="username"
                        label="Usuario"
                        outlined
                        required
                        prepend-icon="mdi-account"
                        ></v-text-field>
            
                        <!-- Campo de Contraseña -->
                        <v-text-field
                        v-model="password"
                        label="Contraseña"
                        type="password"
                        outlined
                        required
                        prepend-icon="mdi-lock"
                        ></v-text-field>
                    </v-form>
                    </v-card-text>
                    <v-btn rounded="xs" block @click="login">
                        Iniciar Sesión
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
  </template>

<style scoped>
.align-container {
  display: flex; /* Activa el diseño flexible */
  justify-content: center; /* Centra horizontalmente */
  align-items: center; /* Centra verticalmente */
  height: 100vh; /* Ocupa toda la altura del viewport */
  width: 100%; /* Asegura que ocupe todo el ancho */
}

.logo {
  width: 80%; 
  height: auto;
  border-radius: 5px; 
  margin: 0 auto; 
  margin-bottom: 20px; 
}

@media (min-width: 960px) { 
  .logo {
    width: 30%; 
  }
}
</style>