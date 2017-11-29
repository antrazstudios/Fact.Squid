import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '*',
      redirect: '/'
    },
    {
      path: '/systeminformation',
      name: 'system-information',
      component: require('@/components/LandingPage/SystemInformation').default
    },
    {
      path: '/login',
      name: 'login',
      component: require('@/components/Profiles/login').default
    }
  ]
})
