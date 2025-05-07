import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi', // Configura el set de íconos predeterminado
  },
});

export default vuetify;

// https://vuetifyjs.com/en/getting-started/quick-start