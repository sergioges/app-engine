<script setup>
  import { config } from '@plugin/config'

  const footerIcons = [
    {
      icon: 'mdi-whatsapp',
      url: `https://api.whatsapp.com/send?phone=${config.whatsApp}&text=Hola!%20Estoy%20interesad@%20en%20recibir%20más%20información%20de%20Cuca%20de%20Llum.`
    },
    {
      icon: 'mdi-mail',
      url: 'mailto:cucadellumcasarural@gmail.com'
    },
    {
      icon: 'mdi-instagram',
      url: 'https://www.instagram.com/cucadellumcasadecampo/'
    }
  ]

  function openLink(url) {
    window.open(url, '_blank')
  }
</script>

<template>
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
      {{ $t('footerApp.message.cucaDescription') }}
    </div>

    <v-divider></v-divider>

    <div>
      {{ new Date().getFullYear() }} —
      <strong>{{ $t('footerApp.label.cucaName') }}</strong>
    </div>
    <em class="reservame">
      Powered by:
      <v-btn
        prepend-icon="mdi-calendar-check-outline"
        rounded="lg"
        variant="outlined"
        color="white"
        size="small"
        class="button"
        @click="openLink('https://reservame-agenda-digital.com/')"
      >
        ReservaMe
      </v-btn>
    </em>
  </v-footer>
</template>

<style lang="css" scoped>
  .custom-footer {
    background-color: #665745;
    color: white;
  }

  .reservame a {
    text-decoration: underline;
    color: #fff;
  }

  .button {
    text-transform: none !important;
  }

  .button:hover {
    color: #fff !important;
    border-color: #fff !important;
  }
</style>
