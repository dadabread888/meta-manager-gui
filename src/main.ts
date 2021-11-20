import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
// import axios from 'axios';
import VueAxios from 'vue-axios';
import axios from '@/plugins/axios';
import Spy from './plugins/spy';

const ToastOptions = {
    position: 'top-center',
    timeout: 2000
};

Vue.config.productionTip = false;
Vue.use(Toast, ToastOptions);
Vue.use(VueAxios, axios);
Vue.use(Spy);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
