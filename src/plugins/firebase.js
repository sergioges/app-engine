import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// firebase functions:config:get --> Get API keys
// firebase functions:config:set --> Set API keys
// firebase functions:config:unset --> Unset API keys
// firebase deploy --only hosting:reservas-cuca-de-llum

// Configuración de Firebase (reemplaza con tus credenciales)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_CONFIG_API_KEY,
    authDomain: import.meta.env.VITE_CONFIG_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_CONFIG_PROJECT_ID,
    storageBucket: import.meta.env.VITE_CONFIG_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_CONFIG_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_CONFIG_APP_ID,
    measurementId: import.meta.env.VITE_CONFIG_MEASUREMENT_ID,
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app);

// Inicializa Authentication
const auth = getAuth(app);

export { db, auth };