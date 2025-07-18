<script setup>
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { locale } = useI18n()

  const languageSelected = ref('es')

  watch(languageSelected, newLocale => {
    locale.value = newLocale
  })
</script>

<template>
  <a href="https://cuca-de-llum.web.app" target="_blank">
    <v-img src="/cuca-de-llum-logo.png" class="logo" alt="Cuca de Llum logo" contain></v-img>
  </a>
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
  <h1 class="text-h4">{{ $t('calendarHeader.label.title') }}</h1>
  <h2 class="text-body-2">{{ $t('calendarHeader.label.description') }}</h2>
</template>

<style lang="css" scoped>
  @font-face {
    font-family: 'CelciusFlower';
    src: url('/fonts/celcius_flower.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: 'Cocomat';
    src: url('/fonts/cocomat.ttf') format('truetype');
    font-weight: bold;
    font-style: normal;
  }

  h1 {
    font-family: 'CelciusFlower', sans-serif;
  }

  h2 {
    font-family: 'Cocomat', sans-serif;
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

  .lang-switcher {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: -20px 0;
  }

  .lang-switcher p {
    padding-right: 12px;
  }
</style>
