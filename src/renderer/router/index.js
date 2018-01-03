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
      path: '/terceros',
      name: 'terceros',
      component: require('@/components/Terceros/index').default
    },
    {
      path: '/terceros/editor/',
      name: 'terceros-editor',
      component: require('@/components/Terceros/editor').default,
      props (route) {
        return route.query || {}
      }
    },
    // {
    //   path: '/terceros/editordirecciones',
    //   name: 'direcciones-editor',
    //   component: require('@/components/Terceros/editorDirecciones').default,
    //   props (route) {
    //     return route.query || {}
    //   }
    // },
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
    },
    {
      path: '/Settings/about/:id',
      name: 'settings-about',
      component: require('@/components/Settings/about/').default
    }
  ]
})
