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
    },
    {
      path: '/sql/connectionsassistant',
      name: 'connections-assistant',
      component: require('@/components/sql/ConnectionsAssistant').default
    },
    {
      path: '/Settings/index',
      name: 'settings-index',
      component: require('@/components/Settings/index').default
    }
  ]
})
