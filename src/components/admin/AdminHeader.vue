<script setup>
  import { ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  const router = useRouter()
  const { locale } = useI18n()

  const languageSelected = ref('es')

  function closeSession() {
    localStorage.removeItem('authToken')
    router.push('/calendar')
  }

  watch(languageSelected, newLocale => {
    locale.value = newLocale
  })
</script>

<template>
  <v-img src="/cuca-de-llum-logo.png" class="logo" alt="Cuca de Llum logo" contain></v-img>
  <span class="lang-switcher">
    <p>Español</p>
    <v-switch
      v-model="languageSelected"
      color="info"
      label="English"
      false-value="es"
      true-value="en"
      hide-details
      inset
    ></v-switch>
  </span>
  <h1>{{ $t('adminHeader.label.bookingControl') }}</h1>
  <p>{{ $t('adminHeader.label.bookingView') }}</p>
  <v-row justify="center">
    <v-col class="mt-4">
      <v-btn @click="closeSession" color="error">{{ $t('adminHeader.label.closeSession') }}</v-btn>
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

  .lang-switcher {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lang-switcher p {
    padding-right: 12px;
  }
</style>
