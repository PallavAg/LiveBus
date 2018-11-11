import Vue from 'vue'
import Router from 'vue-router'
import BusRoute from './views/BusRoute.vue'
Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: BusRoute
    },
    {
      path: '/routes/:routeID',
      name: 'route',
      component: BusRoute
    },
    {
      path: '/login',
      name: 'login',
      component: () => import(/* webpackChunkName: "login" */ './views/Login.vue')
    },
  ]
})
