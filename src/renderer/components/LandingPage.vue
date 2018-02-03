<template>
  <div class="content">
    <!-- Area de accesos directos -->
    <i-col span="4">
      <Card class="slides">
        <h3>Accesos Directos</h3>
        <hr/>
        <Row v-if="list_shortcuts.length !== 0 || list_shortcuts.length !== null">
          <ButtonGroup vertical style="width: 100%;">
            <i-button v-for="shortcut in list_shortcuts" :key="shortcut.key" type="text" style="text-align: left;">
              <div class="slides-shortcut--icon" v-bind:style="{ backgroundColor : shortcut.icon_color}">
                <Icon v-bind:style="{ color : shortcut.icon_fontColor }" v-if="shortcut.icon_type !== 'profileimage'" :type="shortcut.icon_type"/>
              </div>
              <Avatar v-if="shortcut.icon_type === 'profileimage'" :src="$parent.actualProfile.imagenperfil" style="width: 19px; height: 20px; cursor: pointer;"></Avatar>
              <!-- <img class="slides-shortcut-img" v-if="shortcut.icon_type === 'profileimage'" :src="$parent.actualProfile.imagenperfil"/> -->
              <label style="cursor: pointer; font-weight: bold;">{{shortcut.title}}</label>

            </i-button>
          </ButtonGroup>
        </Row>
        <Row v-if="list_shortcuts.length == 0 || list_shortcuts.length == null">
          <label style="margin: 4px 0px 4px; font-size: 14px; opacity: 0.3">No tienes accesos directos</label>
        </Row>
        <Row>
          <i-button type="text" style="width: 100%; margin: 8px 0px; text-align: left; font-weight: bold;">Añadir acceso</i-button>
        </Row>
      </Card>
      <Card class="slides">
        <h3>Periodo de trabajo: {{periodo}}</h3>
        <hr>
        <p>Actualmente en el sistema, todo se almacena dentro del periodo de trabajo {{periodo}}, es importante que esta informacion concuerde con la de sus sistema principal de gestion de cuentas medicas, motivo por el que le pedimos ingrese la informacion que pertenezca a este periodo.</p>
      </Card>
    </i-col>
    <!-- Area del Feed -->
    <i-col span="14">
      <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <div v-if="firebaseCharge === false">
          <!-- En caso que existan noticias en el feed -->
          <div v-if="list_notice.length !== 0 && list_notice.length !== null">
            <Row v-for="notice in list_notice" :key="notice.key">
              <Card class="slides">
                <Row>
                  <i-col span="2">
                    <Avatar :src="notice.imgsrc"/>
                  </i-col>
                  <i-col span="8">
                    <h4>{{notice.author}}</h4>
                    <h4>{{notice.date}}</h4>
                  </i-col>
                  <i-col span="14">
                    <Row>
                      <div class="slides-origin">
                        <label class="slides-text--origin">{{notice.origin}}</label>
                        <Icon class="slides-text--origin" :type="notice.origin_icon"></Icon>
                        <div v-if="notice.isOutstanding === true" class="slides-star slides-origin">
                          <Icon type="android-star" color="white"></Icon>
                        </div>
                        <i-button v-if="notice.link !== null && notice.link !== undefined" type="ghost" style="margin: 5px;" @click="clickMoreInfo(notice.link)">
                          <Icon type="link"></Icon>
                            Quiero saber mas
                        </i-button>
                      </div>
                    </Row>
                  </i-col>
                </Row>
                <hr />
                <Row>
                  <h1 class="slides-text--title">{{notice.title}}</h1>
                  <p class="slides-text--content">{{notice.description}}</p>
                  <img class="slides-img" :src="notice.banner"/>
                  <p class="slides-text--description">{{notice.content}}</p>
                </Row>
              </Card>
            </Row>
            <Row>
              <div class="slides-end">
                Final de la lista
              </div>
            </Row>
          </div>
          <!-- En caso de que NO existan noticias en el feed -->
          <div v-if="list_notice.length === 0 || list_notice.length === null">
            <Card class="slides slides-notitems--text">
              <img src=".././assets/images/emoji-72x72/1f61e.png"/>
              <h2>No existen items para mostrar en tu feed</h2>
              <p style="margin-top: 20px;">Esto puede deberse a varias cosas:</p>
              <p style="margin-top: 20px;">⌾ Que no tengas acceso a internet</p>
              <p>⌾ Que no se haya publicado ningun item desde el servidor para que los demas usuarios puedan verlos</p>
              <p>⌾ Que seas muy productivo y no exista ningun necesidad de informarte nada, porque ya lo sabes todo</p>
              <h4 style="margin-top: 20px;">Todo esto puede ser posible, pero si el problema persiste, contacta el administrador del sistema.</h4>
            </Card>
          </div>
        </div>
      </transition>
      <div v-if="firebaseCharge === true" class="chargefeed"></div>
    </i-col>
    <!-- Area de notificacion -->
    <i-col span="6" >
      <Card class="slides">
        <h3>Notificaciones</h3>
        <hr/>
        <notifications-view :notified="false" refresh="created"></notifications-view>
      </Card>
    </i-col>
    <!-- Boton de regresar al top -->
    <BackTop>
      <div class="top">
        <Icon type="arrow-up-b"></Icon>
      </div>
    </BackTop>
  </div>
</template>

<script>
  import NotificationsView from './miscelanius/notificationsView'
  export default {
    name: 'landing-page',
    components: { NotificationsView },
    data () {
      return {
        value1: 0,
        value2: 0,
        height: 677,
        periodo: 'diciembre-2017',
        firebase: '',
        firebaseConfig: '',
        firebaseDatabase: '',
        firebaseDatabaseRef: '',
        firebaseDbRender: null,
        firebaseCharge: true,
        list_notice: [],
        list_shortcuts: [
          {
            title: 'Mi perfil',
            goto: '/login',
            icon_type: 'profileimage',
            icon_color: null,
            icon_fontColor: null,
            isDeletable: false
          },
          {
            title: 'Crear Documento',
            goto: '/Settings/index',
            icon_type: 'plus-round',
            icon_color: '#2ecc71',
            icon_fontColor: '#fff',
            isDeletable: true
          },
          {
            title: 'Cargar masivo glosas',
            goto: '/Settings/index',
            icon_type: 'upload',
            icon_color: '#3498db',
            icon_fontColor: '#fff',
            isDeletable: true
          },
          {
            title: 'Estados de cartera',
            goto: '/Settings/index',
            icon_type: 'android-download',
            icon_color: '#d35400',
            icon_fontColor: '#fff',
            isDeletable: true
          }
        ]
      }
    },
    mounted () {
      // inicializar libreria de objetos
      let objects = require('../libs/objects')
      // inicializar libreria de firebase para obtener los datos
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
      // creamos la referencia de la base de datos
      this.firebaseDatabaseRef = this.firebaseDatabase.ref('news')
      // obtenemos datos en cada actualizacion de contenido
      this.firebaseDatabaseRef.on('value', (snap) => {
        this.firebaseCharge = true
        // Obtenemos la lista de datos para renderizar en pantalla
        this.firebaseDbRender = snap.val()
        // limpiamos la lista de noticias para ingresar las nuevas
        this.list_notice = []
        // recorremos la seleccion descargando los datos para mostrar
        for (const notice in this.firebaseDbRender) {
          if (this.firebaseDbRender.hasOwnProperty(notice)) {
            const element = this.firebaseDbRender[notice]
            // creamos la noticia para ingresar al feed
            let noticiaToList = objects.createNotices(notice, element.origin, element.origin_icon, element.date, element.author, element.imgsrc, element.title, element.description, element.content, element.banner, element.isOutstanding, element.link)
            // añadimos el item a la lista de noticias
            this.list_notice.push(noticiaToList)
          }
        }
        // Ordenamos la lista de noticias
        this.list_notice.sort(function (a, b) {
          if (a.isOutstanding === true && b.isOutstanding === false) {
            return -1
          }
          if (a.isOutstanding === false && b.isOutstanding === true) {
            return 1
          }
          return 0
        })
        this.firebaseCharge = false
        console.log(this.list_notice)
      })
    },
    methods: {
      clickMoreInfo (link) {
        const {shell} = require('electron')
        shell.openExternal(link)
      }
    }
  }
</script>

<style lang="css">
  .content{
    width: 100%;
    height: 100% !important;
    padding: 0px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: right;
    user-select: none;
    overflow-x: hidden;
  }
  .slides-shortcut--img{
    display: inline;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
  .slides-shortcut--icon{
    display: inline;
    padding-top: 4px;
    padding-bottom: 4px;
    padding-left: 6px;
    padding-right: 5px;
    background-color: yellow;
    border-radius: 3px;
    cursor: pointer;
  }
  .slides-text--title{
    margin-bottom: 10px;
  }
  .slides-text--content{
    text-align: justify;
    margin-bottom: 10px;
  }
  .slides-text--description{
    text-align: justify;
    margin-top: 10px;
    margin-bottom: 5px;
    font-size: 12px;
  }
  .slides-text--origin{
    color: rgba(0, 0, 0, 0.25);
    font-size: 12px;
    margin-top: 10px;
  }
  .slides-origin{
    float: right;
  }
  .slides-img{
    width: 100%;
    border-radius: 10px;
  }
  .slides-notitems--text{
    color: rgba(0, 0, 0, 0.49);
    text-align: center;
  }
  .slides-end{
    text-align: center;
    font-weight: bold;
    font-size: 14px;
    padding: 10px;
    margin-top: 20px;
    margin-bottom: 30px;
    margin-left: 10px;
    margin-right: 10px;
    background-color: rgba(219, 219, 219, 0.5);
    border-radius: 5px;
  }
  .slides-star{
    text-align: center;
    padding: 2px;
    margin: 5px;
    margin-top: 8px;
    background-color: rgb(240, 203, 44);
    border-radius: 5px;
    width: 30px;
  }
  .slides{
    background-color: rgb(255, 255, 255);
    padding-left: 4px;
    padding-right: 4px;
    padding-top: 8px;
    padding-bottom: 8px;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 10px;
    margin-right: 10px;
  }
  hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid #ebe5e5;
    margin: 1em 0;
    padding: 0;
  }
  .top{
    padding: 1px;
    background: rgba(84, 84, 84, 0.7);
    color: #fff;
    text-align: center;
    border-radius: 8px;
    box-shadow: 0px 0px 6px 0.5px #949494;
  }
  .chargefeed{
    display: block;
    margin: auto;
    width: 30px;
    height: 30px;
    background-image: url("~@/assets/images/ajax-loader.gif");
    background-size: contain;
  }
</style>
