<script setup>
import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';

import { db } from '../plugins/firebase';
import { collection, addDoc, updateDoc, getDocs } from 'firebase/firestore';

const router = useRouter();

const reservationData = reactive([])

function closeSession() {
    sessionStorage.removeItem('authToken');
    router.push('/calendar');
}
</script>

<template>
    <v-container>
        <v-row>
            <v-col>
                <h1>Administración</h1>
                <p>Esta es la vista de administración.</p>
                <v-btn @click="closeSession">Cerrar sesión</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>