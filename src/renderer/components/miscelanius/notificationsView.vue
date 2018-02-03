<template>
  <div class="content">
    <!-- Titulo de Seccion Notificaciones de Hoy -->
    <row v-if="firebaseDbRenderToday.length !== 0">
      <i-col span="21">
        <h3 class="h3Title">Hoy</h3>
      </i-col>
      <i-col span="3">
        <Badge :count="firebaseDbRenderToday.length"></Badge>
      </i-col>
    </row>
    <hr v-if="firebaseDbRenderToday.length !== 0" class="hrTitle">
    <!-- Contenido de las notificaciones de hoy -->
    <transition-group enter-active-class="animated fadeInRight">
      <Alert v-for="item in firebaseDbRenderToday" :key="item.key" :type="item.type" :show-icon="item.state === 0 ? true : false" closable style="opacity: 0.8">
        <div v-if="item.state === 0" style="line-height: normal !important; opacity: 0.8s; margin-top: 8px">
          <span style="font-size: 12px; font-weight: bold;">{{item.from}}</span>
        </div>
        <div v-if="item.state === 1" style="line-height: normal !important; opacity: 0.6; text-align: center">
          <span style="font-size: 12px; font-weight: bold;">{{item.from}}</span>
        </div>
        <Icon slot="icon" :type="item.kind"></Icon>
        <div slot="desc" style="line-height: normal !important; opacity: 0.8; margin-top: 10px;">
          <span v-if="item.state === 0" style="font-size: 11px;">{{item.content}}</span>
          <br v-if="item.state === 0">
          <div v-if="item.state === 0" style="text-align: right;">
            <span style="font-size: 10px; font-weight: bold;">{{ new Date(item.time).toLocaleTimeString() }}</span>
          </div>
          <div v-if="item.state === 0" style="text-align: right; margin-top: 8px;">
            <i-button size="small" :type="item.type" @click="readNotification(item)">Marcar como leido</i-button>
          </div>
          <div v-if="item.state === 1" style="text-align: center; margin-top: 8px;">
            <i-button size="small" :type="item.type" @click="unreadNotification(item)">Marcar como no leido</i-button>
          </div>
        </div>
      </Alert>
    </transition-group>
    <div v-if="firebaseDbRenderToday.length === 0 && firebaseDbRenderTodayCharge === true" class="modal-contenedor--img"></div>
    <!-- Titulo de Seccion Notificaciones Anteriores -->
    <hr class="hrTitle" v-if="firebaseDbRenderToday.length !== 0">
    <row v-if="firebaseDbRenderOthers.length !== 0">
      <i-col span="21">
        <h3 class="h3Title">Dias anteriores</h3>
      </i-col>
      <i-col span="3">
        <Badge :count="firebaseDbRenderOthers.length"></Badge>
      </i-col>
    </row>
    <hr class="hrTitle" v-if="firebaseDbRenderOthers.length !== 0">
    <!-- Contenido de las notificaciones anteriores -->
    <transition-group enter-active-class="animated fadeInRight">
      <Alert v-for="item in firebaseDbRenderOthers" :key="item.key" :type="item.type" :show-icon="item.state === 0 ? true : false" closable style="opacity: 0.8" @on-close="deleteNotification(item)">
        <div v-if="item.state === 0" style="line-height: normal !important; opacity: 0.8s; margin-top: 8px">
          <span style="font-size: 12px; font-weight: bold;">{{item.from}}</span>
        </div>
        <div v-if="item.state === 1" style="line-height: normal !important; opacity: 0.6; text-align: center">
          <span style="font-size: 12px; font-weight: bold;">{{item.from}}</span>
        </div>
        <Icon slot="icon" :type="item.kind"></Icon>
        <div slot="desc" style="line-height: normal !important; opacity: 0.8; margin-top: 10px;">
          <span v-if="item.state === 0" style="font-size: 11px; word-wrap: break-word!important;">{{item.content}}</span>
          <br v-if="item.state === 0">
          <div v-if="item.state === 0" style="text-align: right;">
            <span style="font-size: 10px; font-weight: bold;">{{ new Date(item.time).toLocaleDateString() }}</span>
            <span style="font-size: 10px; font-weight: bold;"> - </span>
            <span style="font-size: 10px; font-weight: bold;">{{ new Date(item.time).toLocaleTimeString() }}</span>
          </div>
          <div v-if="item.state === 0" style="text-align: right; margin-top: 8px;">
            <i-button size="small" :type="item.type" @click="readNotification(item)">Marcar como leido</i-button>
          </div>
          <div v-if="item.state === 1" style="text-align: center; margin-top: 8px;">
            <i-button size="small" :type="item.type" @click="unreadNotification(item)">Marcar como no leido</i-button>
          </div>
        </div>
      </Alert>
    </transition-group>
    <div class="modal-contenedor--img" v-if="firebaseDbRenderOthers.length === 0 && firebaseDbRenderOthersCharge === true"></div>
  </div>
</template>
<script>
  export default {
    name: 'notifications',
    props: [ 'notified' ],
    data () {
      return {
        firebase: '',
        firebaseConfig: '',
        firebaseDatabase: '',
        firebaseDatabaseRef: '',
        firebaseDbRender: null,
        firebaseDbRenderToday: [],
        firebaseDbRenderTodayCharge: true,
        firebaseDbRenderOthers: [],
        firebaseDbRenderOthersCharge: true,
        notificationsShowed: [],
        countRefresh: 0
      }
    },
    methods: {
      readNotification (item) {
        let miscelanius = require('../../libs/miscelanius')
        let cnf = require('../../libs/settings')
        this.firebaseDatabase.ref('notifications/' + cnf.getSesionProfile().id + '/' + item.key).set({
          content: item.content,
          from: item.from,
          kind: item.kind,
          time: miscelanius.convertDateToStringStorage(item.time),
          type: item.type,
          state: 1
        })
      },
      unreadNotification (item) {
        let miscelanius = require('../../libs/miscelanius')
        let cnf = require('../../libs/settings')
        this.firebaseDatabase.ref('notifications/' + cnf.getSesionProfile().id + '/' + item.key).set({
          content: item.content,
          from: item.from,
          kind: item.kind,
          time: miscelanius.convertDateToStringStorage(item.time),
          type: item.type,
          state: 0
        })
      },
      deleteNotification (item) {
        let cnf = require('../../libs/settings')
        this.firebaseDatabase.ref('notifications/' + cnf.getSesionProfile().id + '/' + item.key).remove()
      },
      showNotification (item, type) {
        if (this.notified === true) {
          this.$Notice.open({
            title: type === 0 ? 'HOY - ' + item.from : 'ANTIGUAS - ' + item.from,
            desc: item.content,
            duration: 10
          })
          this.notificationsShowed.push(item)
        }
      }
    },
    created: function () {
      // inicializar libreria de firebase para el sistema de notificaciones
      this.firebase = require('firebase')
      // creacion de la configuracion de la aplicacion
      this.firebaseConfig = {
        apiKey: 'AIzaSyD0RbHghkmKo5vKPC_eKNhK-I4Yuod81ao',
        authDomain: 'fact-squid.firebaseapp.com',
        databaseURL: 'https://fact-squid.firebaseio.com',
        projectId: 'fact-squid',
        storageBucket: 'fact-squid.appspot.com',
        messagingSenderId: '418617142482'
      }
      // inicializacion de la aplicacion, en caso que no se haya realizado
      if (this.firebase.apps.length === 0) {
        this.firebase.initializeApp(this.firebaseConfig)
      }
      // creacion de la base de datos
      this.firebaseDatabase = this.firebase.database()
    },
    mounted () {
      // obtener fecha actual
      let actualDate = new Date()
      // inicializar libreria de configuraciones
      let cnf = require('../../libs/settings')
      // inicializar libreria de objetos
      let objects = require('../../libs/objects')
      // creamos la referencia de la base de datos
      this.firebaseDatabaseRef = this.firebaseDatabase.ref('notifications/' + cnf.getSesionProfile().id)
      // obtenemos datos en cada actualizacion de contenido
      this.firebaseDatabaseRef.on('value', (snap) => {
        // añadimos un valor al contador de refrescos
        this.countRefresh++
        // obtenemos el valor de la captura
        this.firebaseDbRender = snap.val()
        // limpiamos las notificaciones para renderizar
        this.firebaseDbRenderToday = []
        this.firebaseDbRenderOthers = []
        // contador de notificaciones sin leer
        let notiUnread = 0
        // recorremos el valor de la captura item por item
        for (const noti in this.firebaseDbRender) {
          if (this.firebaseDbRender.hasOwnProperty(noti)) {
            const element = this.firebaseDbRender[noti]
            let typeNoti = 0
            // crear notificacion
            let notificacion = objects.createNotifications(noti, element.content, element.from, element.kind, element.time, element.type, element.state)
            // verificamos si es una notificacion de hoy o es mas antigua
            if (new Date(element.time).toDateString() === actualDate.toDateString()) {
              this.firebaseDbRenderToday.push(notificacion)
              typeNoti = 0
            } else if (new Date(element.time).toDateString() !== actualDate.toDateString()) {
              this.firebaseDbRenderOthers.push(notificacion)
              typeNoti = 1
            }
            // verificamos si la notificacion ya fue noticiada en la sesion actual
            let isShowed = false
            for (const showed in this.notificationsShowed) {
              if (this.notificationsShowed.hasOwnProperty(showed)) {
                const elementS = this.notificationsShowed[showed]
                if (notificacion.key === elementS.key) {
                  isShowed = true
                }
              }
            }
            // si no se ha mostrado en la sesion se notifica al usuario
            if (isShowed === false) {
              if (this.countRefresh === 1) {
                if (notificacion.state === 0) {
                  notiUnread++
                }
                this.notificationsShowed.push(notificacion)
              } else if (this.countRefresh !== 1) {
                this.showNotification(notificacion, typeNoti)
              }
            }
          }
        }
        if (this.countRefresh === 1 && this.notified === true && notiUnread !== 0) {
          this.$Notice.open({
            title: 'Tienes ' + notiUnread + ' notificaciones sin leer',
            duration: 8
          })
        }
        this.firebaseDbRenderTodayCharge = false
        this.firebaseDbRenderOthersCharge = false
      })
    }
  }
</script>
<style>
  .content {
    position: relative;
    height: 100%;
    top: 0px;
    overflow-x: hidden;
  }
  .h3Title {
    color: #929292
  }
  .hrTitle {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid #f5f5f5;
    /* margin: 1em 0; */
    padding: 0;
  }
  .itemTitle {
    color: #6d6d6d
  }
  .modal-contenedor--img{
      display: block;
      margin: auto;
      width: 60px;
      height: 60px;
      background-image: url("~@/assets/images/ajax-loader.gif");
      background-size: contain;
  }
</style>