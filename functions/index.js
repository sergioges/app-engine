/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// SEND MAIL
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const functions = require('firebase-functions');
const admin = require('firebase-admin');

//TODO Revisar como hacer para que funcionen las variables de entorno.
// auth: {
//     user: GMAIL_EMAIL,
//     pass: GMAIL_PASSWORD,
//   },
// Actualmente están subidadas las credenciales directamente en Google Cloud.

const GMAIL_EMAIL = functions.config().gmail.email;
const GMAIL_PASSWORD = functions.config().gmail.password;
console.log('GMAIL_EMAIL:', GMAIL_EMAIL);
console.log('GMAIL_PASSWORD:', GMAIL_PASSWORD);

const nodemailer = require('nodemailer');

// Inicializa Firebase Admin
admin.initializeApp();

// Configura el transporte de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cucadellumcasarural@gmail.com',
        pass: 'wdzb sxkn smkw klwe',
    },
});

// Función para enviar correos cuando se crea un documento en Firestore
exports.sendEmailOnReservation = onDocumentCreated('reservations/{reservationId}', async (event) => {
    // Obtén los datos del documento
    const reservation = event.data.data();
  
    // Verifica que los datos existan
    if (!reservation) {
      console.error('Error: Los datos de la reserva están vacíos o no existen.');
      return;
    }
  
    const mailOptionsArray = [
        {
          from: 'cucadellumcasarural@gmail.com',
          to: reservation.email, // Correo del destinatario principal
          subject: 'Confirmación de reserva',
          text: `Hola ${reservation.name}, tu reserva ha sido confirmada.`,
          html: `
            <h1>Confirmación de reserva</h1>
            <p>Hola ${reservation.name}, tu reserva ha sido confirmada.</p>
            <p><strong>Detalles:</strong></p>
            <ul>
              <li><strong>Fechas:</strong> ${reservation.dates}</li>
              <li><strong>Noches:</strong> ${reservation.totalNights}</li>
              <li><strong>Huéspedes:</strong> ${reservation.hosts}</li>
              <li><strong>Mascotas:</strong> ${reservation.pets}</li>
            </ul>
          `,
        },
        {
          from: 'cucadellumcasarural@gmail.com',
          to: 'cucadellumcasarural@gmail.com', // Correo del administrador o notificación interna
          subject: 'Nueva reserva registrada',
          text: `Se ha registrado una nueva reserva para ${reservation.name}.`,
          html: `
            <h1>Nueva reserva registrada</h1>
            <p>Se ha registrado una nueva reserva con los siguientes detalles:</p>
            <p><strong>Detalles:</strong></p>
            <ul>
              <li><strong>Nombre:</strong> ${reservation.name}</li>
              <li><strong>Correo:</strong> ${reservation.email}</li>
              <li><strong>Teléfono:</strong> ${reservation.phone}</li>
              <li><strong>Fechas:</strong> ${reservation.dates}</li>
              <li><strong>Noches:</strong> ${reservation.totalNights}</li>
              <li><strong>Huéspedes:</strong> ${reservation.hosts}</li>
              <li><strong>Mascotas:</strong> ${reservation.pets}</li>
            </ul>
          `,
        },
      ];
  
      try {
        for (const mailOptions of mailOptionsArray) {
          await transporter.sendMail(mailOptions);
          console.log(`Correo enviado exitosamente a: ${mailOptions.to}`);
        }
      } catch (error) {
        console.error('Error al enviar los correos:', error);
      }
  });

  // For Deploying
  // sudo firebase deploy --only functions

  // For adding variables .env
  // firebase functions:config:set gmail.email="cucadellumcasarural@gmail.com"

  // For checking variables .env
  //  // firebase functions:config:get