import Vue from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import VueAxios from 'vue-axios';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';

import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

Vue.config.productionTip = false;

Vue.use(VueAxios, axios);

new Vue({
  router,
  provide: () => {
    return {
      notyf: new Notyf({
        duration: 4000
      })
    }
  },
  render: h => h(App)
}).$mount('#app')
