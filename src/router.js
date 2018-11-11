import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName: "home" */ './components/Landing.vue')
    },
    {
      path: '/routes/:routeID',
      name: 'route',
      component: () => import(/* webpackChunkName: "route" */ './views/BusRoute.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import(/* webpackChunkName: "login" */ './views/Login.vue')
    },
    {
      path: '/message',
      name: 'message',
      component: () => import( './views/Message.vue')
    },
    {
      path: '/newMessage',
      name: 'newMessage',
      component: () => import( './views/NewMessage.vue')
    }]
})
