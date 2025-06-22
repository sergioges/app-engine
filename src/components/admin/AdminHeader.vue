<script setup>
  import { useRouter } from 'vue-router'

  const router = useRouter()

  function closeSession() {
    localStorage.removeItem('authToken')
    router.push('/calendar')
  }
</script>

<template>
  <v-img src="/cuca-de-llum-logo.png" class="logo" alt="Cuca de Llum logo" contain></v-img>
  <h1>Control de reservas</h1>
  <p>Esta es la vista de todas tus reservas registradas</p>
  <v-row justify="center">
    <v-col class="mt-4">
      <v-btn @click="closeSession" color="error">Cerrar sesión</v-btn>
    </v-col>
  </v-row>
</template>

<style lang="css" scoped>
  .logo {
    width: 40%;
    height: auto;
    border-radius: 5px;
    margin: 0 auto;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  @media (min-width: 960px) {
    .logo {
      width: 14rem;
    }
  }
</style>
