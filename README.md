# Cuca de Llum - Reservations

Reservation system for Cuca de Llum Country House.

## Description

This project is a web application developed with Vue 3 and Vite that enables reservation management for tourist accommodations. It includes integration with Firebase for database, authentication, and hosting, Brevo for email management, and Stripe for payment processing. The app features a modern UI with Vuetify, a calendar for availability, and an admin panel for managing reservations and blocked dates. It supports multi-language (Spanish/English), WhatsApp contact, and CSV export of reservations.

## Links

- **Production**: [https://reservas-cuca-de-llum.web.app](https://reservas-cuca-de-llum.web.app)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase Account
- Brevo Account (formerly Sendinblue)
- Stripe Account (for payment processing)

## External Services Configuration

### Firebase

1. Create a new project in [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:
   - Authentication (email/password)
   - Firestore Database
   - Cloud Functions
   - Hosting

3. Get the configuration credentials from the Firebase console (Project settings > General > Your apps > Web)

### Brevo (Sendinblue)

1. Register at [Brevo](https://www.brevo.com/)
2. Get your API Key from the Brevo dashboard (Settings > API Keys)
3. Create mailing lists to manage your contacts (one for production and one for testing)

### Stripe

1. Register at [Stripe](https://stripe.com/)
2. Get your test and production API keys from the Stripe dashboard (Developers > API Keys)

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd app-cuca
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file at the root of the project with the following variables (use the exact names as in the code):
```
VITE_FBASE_API_KEY=your-api-key
VITE_FBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FBASE_PROJECT_ID=your-project
VITE_FBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FBASE_MESSAGING_SENDER_ID=your-messaging-id
VITE_FBASE_APP_ID=your-app-id
VITE_FBASE_MEASUREMENT_ID=your-measurement-id (optional, for Analytics)
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

4. For Cloud Functions, configure environment variables:
```bash
cd functions
npm install
firebase functions:config:set brevo.apikey="your-brevo-api-key" stripe.secret="your-stripe-secret-key"
```

## Local Development

```bash
npm run dev
```

## Build for Production

```bash
npm run build
```

## Deployment

```bash
npm run build
firebase deploy
```

To deploy only functions:
```bash
firebase deploy --only functions
```

## Project Structure

- `src/components/admin/`: Admin panel components (edit reservations, block/unblock dates, table, header)
- `src/components/calendar/`: Calendar, form, and header for reservations
- `src/plugins/`: Configuration, Firebase, and Vuetify setup
- `src/stores/`: Pinia stores for authentication and reservations
- `src/locales/`: i18n translation files (English/Spanish)
- `public/`: Static assets, images, fonts

## Main Dependencies

- **Vue 3**: UI framework
- **Vite**: Build tool and development server
- **Vuetify 3**: UI component framework for Vue
- **Firebase**: Application development platform
  - **firebase/app**: Firebase core
  - **firebase/auth**: User authentication (admin login, anonymous for users)
  - **firebase/firestore**: NoSQL database
  - **firebase/functions**: Serverless functions
  - **firebase/hosting**: Web hosting
- **Brevo (sib-api-v3-sdk, @getbrevo/brevo)**: Email and marketing management
- **Stripe**: Payment processing
- **Moment.js**: Date and time handling
- **Pinia**: Application state management
- **Vue Router**: Application routing
- **@vuepic/vue-datepicker**: Date picker component
- **libphonenumber-js**: Phone number normalization
- **@mdi/font**: Material Design Icons

## Main Features

- User authentication (admin login with Firebase Auth, anonymous for users)
- Multi-language support (Spanish/English)
- Availability calendar with disabled dates (reserved and admin-blocked)
- Reservation process with form validation and phone normalization
- Payment processing with Stripe (test and production modes)
- Automatic email sending with Brevo (production and sandbox/test)
- Reservation administration panel (edit, update, export to CSV)
- Block/unblock dates from admin panel
- WhatsApp integration for direct contact
- Responsive design with Vuetify
- Export reservations to CSV from admin panel
- Summer weekday discount coupon logic
- Error and success alerts throughout the app

## Reservation Flow

1. User selects available dates on the calendar (blocked/reserved dates are disabled)
2. User fills in contact details and submits reservation
3. For 1-5 nights: Stripe payment is enabled (with a 3-minute countdown)
4. For 6+ nights: Only bank transfer is allowed (contact via WhatsApp)
5. If reservation is for weekdays only, a discount coupon is shown
6. After payment, reservation status is updated and confirmation is shown

## Admin Panel

- Login required (Firebase Auth)
- View, edit, and update reservations
- Block or unblock dates (affects calendar availability)
- Export all reservations to CSV
- Switch app language
- Logout

## Cloud Functions

- **createReservationProd**: Creates a contact in Brevo when a reservation is generated in production
- **createReservationTest**: Creates a contact in Brevo when a reservation is generated in test mode (uses sandbox)
- Functions use `@getbrevo/brevo`, `sib-api-v3-sdk` for Brevo, and `stripe` for payments
- Brevo sandbox mode is enabled by setting the `X-Sib-Sandbox: drop` header in API requests

## Useful Scripts

- `npm run dev`: Start local development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally
- `npm run orderKeys`: Sorts the top-level keys alphabetically in the translation files `src/locales/en.json` and `src/locales/es.json`.

## Recommended VS Code Extensions

- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (for Vue 3 development)

## Notes

- All environment variable names must match those in the code (`VITE_FBASE_...`)
- The app is optimized for both desktop and mobile
- For any issues, contact via WhatsApp or email as shown in the app footer