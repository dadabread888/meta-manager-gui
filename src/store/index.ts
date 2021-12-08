import Vue from "vue";
import Vuex from "vuex";
import { FieldStore } from "@/store/field";
import { UserStore } from "@/store/user";
import { SocketStore } from "@/store/socket";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    FieldStore,
    UserStore,
    SocketStore,
  },
});
