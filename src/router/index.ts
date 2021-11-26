import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Login from "@/views/Login.vue";
import Layout from "@/layout/Layout.vue";
import store from "@/store"
import LiveBoss from "@/components/LiveBoss.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/login",
    name: 'Login',
    component: Login,
  },
  {
    path: "/",
    name: 'Home',
    component: Layout,
    children: [
        {
          // UserProfile will be rendered inside User's <router-view>
          // when /user/:id/profile is matched
          path: '/liveboss',
          name: 'liveboss',
          component: LiveBoss
        }
      ]
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach((to, from, next) => {  
  console.log(to.name !== 'Login' , !(store.state as any).UserStore.authed);
  
  if (to.name !== 'Login' && !(store.state as any).UserStore.authed) next({ name: 'Login' })
  else next()
})

export default router;
