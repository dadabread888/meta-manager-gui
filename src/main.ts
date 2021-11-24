import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import VueAxios from 'vue-axios';
import axios from '@/plugins/axios';
import Spy from './plugins/spy';
import GAuth from 'vue-google-oauth2';
import VueParticlesBg from "particles-bg-vue";

const ToastOptions = {
    position: 'top-center',
    timeout: 2000
};

Vue.config.productionTip = false;
Vue.use(Toast, ToastOptions);

const gauthOption = {
  clientId: '422667333614-utelb2mp46eeqlfd4ioqktnkddvevql4.apps.googleusercontent.com',
  scope: 'profile email',
  prompt: 'select_account'
}

Vue.use(GAuth, gauthOption)


Vue.use(VueAxios, axios);
Vue.use(Spy);
Vue.use(VueParticlesBg);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
