<script setup>
  import { ref } from 'vue'
  import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import { config } from '@plugin/config'

  const router = useRouter()

  const { t } = useI18n()

  const username = ref('')
  const password = ref('')
  const showError = ref(false)

  async function login() {
    const auth = getAuth()
    try {
      const userCredential = await signInWithEmailAndPassword(auth, username.value, password.value)
      const accessToken = await userCredential.user.getIdToken()

      localStorage.setItem('authToken', accessToken)

      // Avoid no login when access before by admin.
      setTimeout(() => {
        router.push('/admin')
      }, 500)
    } catch (error) {
      if (error.code && error.code.startsWith('auth/')) {
        showError.value = true
        setTimeout(() => {
          showError.value = false
        }, 6000)
      }
      console.error(t('loginView.error.loginSession'), error.message)
    }
  }
</script>

<template>
  <v-alert
    v-if="showError"
    class="toast-alert"
    :title="$t('common.error.somethingMissing')"
    type="error"
    border="end"
    closable
  >
    <p v-html="$t('common.error.tryAgainWithMail', { email: config.email })" />
  </v-alert>
  <v-container class="align-container">
    <v-row align="start" justify="center">
      <v-col class="d-flex flex-column ga-4" cols="12" md="8">
        <a :href="config.webUrl" target="_blank">
          <v-img src="/cuca-de-llum-logo.png" class="logo" alt="Cuca de Llum logo" contain></v-img>
        </a>
        <v-card class="pa-4">
          <v-card-title class="text-h5 text-center">
            {{ $t('loginView.label.loginSession') }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="username"
                label="Usuario"
                outlined
                required
                prepend-icon="mdi-account"
              />

              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                outlined
                required
                prepend-icon="mdi-lock"
              />
              <v-btn rounded="lg" color="primary" block type="submit">
                {{ $t('loginView.label.loginSession') }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
  .align-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
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

  .toast-alert {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    max-width: 600px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    padding: 16px;
    text-align: left;
  }

  @media (max-width: 600px) {
    .toast-alert {
      top: 20px;
      right: auto;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
    }
  }
</style>
