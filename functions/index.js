/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');

const firebaseConfig = {
  apiKey: functions.config().config.api_key,
  authDomain: functions.config().config.auth_domain,
  projectId: functions.config().config.project_id,
  storageBucket: functions.config().config.storage_bucket,
  messagingSenderId: functions.config().config.messaging_sender_id,
  appId: functions.config().config.app_id,
  measurementId: functions.config().config.measurement_id,
};

console.log('Firebase Config:', firebaseConfig);

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started