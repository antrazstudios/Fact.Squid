<template>
  <div id="app" style="user-select: none">

    <!-- Cotenido -->
    <!-- Menu superior fixed-->
    <Menu ref="MenuFix" :width="widthMenu" v-if="showMenuBar === true" mode="horizontal" :active-name="activeName" :on-select="getPathButtonVisibility()" >
      <div class="layout-fixed" v-bind:style="{marginTop: margintop + 'px'}">
        <Row type="flex" justify="space-between">
          <!-- Columna de retorno de vista -->
          <i-col span="1" v-if="visibleReturnButton === 'visible'">
            <div>
              <Tooltip content="Regresar a la vista anterior" placement="bottom-start">
                <i-button type="text" @click="returnPath()">
                  <Icon type="chevron-left"></Icon>
                </i-button>
              </Tooltip>
            </div>
          </i-col>
          <!-- Columna de accesos del menu -->
          <i-col span="17">
            <div>
              <MenuItem name="1" @click="changePath('/')">
                <Tooltip :disabled="actualWidthWindow < 1374 ? false : true" content="Inicio" placement="bottom">
                  <router-link style="color: inherit" :to="{ name: 'landing-page'}">
                    <icon type="ios-home"/>
                    <span v-if="actualWidthWindow > 1373">Inicio</span>
                  </router-link>
                </Tooltip>
              </MenuItem>
              <MenuItem name="2">
                <Tooltip :disabled="actualWidthWindow < 1374 ? false : true" content="Terceros" placement="bottom">
                  <router-link style="color: inherit" :to="{ name: 'terceros' }">
                    <icon type="ios-body"/>
                    <span v-if="actualWidthWindow > 1373">Terceros</span>
                  </router-link>
                </Tooltip>
              </MenuItem>
              <MenuItem name="3">
                <Tooltip :disabled="actualWidthWindow < 1374 ? false : true" content="Facturacion" placement="bottom">
                  <router-link style="color: inherit" :to="{ name: 'facturacion-index' }">
                    <icon type="social-usd"/>
                    <span v-if="actualWidthWindow > 1373">Facturacion</span>
                  </router-link>
                </Tooltip>
              </MenuItem>
              <MenuItem name="4">
                <Tooltip :disabled="actualWidthWindow < 1374 ? false : true" content="Radicacion" placement="bottom">
                  <router-link style="color: inherit" :to="{ name: 'radicacion-index' }">
                    <icon type="cube"/>
                    <span v-if="actualWidthWindow > 1373">Radicacion</span>
                  </router-link>
                </Tooltip>
              </MenuItem>
              <MenuItem name="5">
                <Tooltip :disabled="actualWidthWindow < 1374 ? false : true" content="Cartera" placement="bottom">
                  <router-link style="color: inherit" :to="{ name: 'cartera-index' }">
                    <icon type="cash"/>
                    <span v-if="actualWidthWindow > 1373">Cartera</span>
                  </router-link>
                </Tooltip>
              </MenuItem>
              <MenuItem name="6">
                <Tooltip :disabled="actualWidthWindow < 1374 ? false : true" content="Reporteador" placement="bottom">
                  <router-link style="color: inherit" :to="{ name: 'reporteador-index' }">
                    <icon type="ionic"/>
                    <span v-if="actualWidthWindow > 1373">Reporteador</span>
                  </router-link>
                </Tooltip>
              </MenuItem>
            </div>
          </i-col>
          <!-- Columna de acciones del toolbar -->
          <i-col span="6" class-name="text-right-layout">
            <div>
              <!-- <ButtonGroup> -->
                <i-button title="Buscar" type="text" icon="search" size="small" @click="searchClick()"></i-button>
                <i-button title="Ayuda" type="text" size="small" icon="help" @click="gotoDocumentation()"></i-button>
                <i-button title="Configuracion Sistema" type="text" size="small" icon="wrench" @click="gotoSettings()"></i-button>
                <i-button title="Notificaciones" type="text" size="small" icon="android-notifications" @click="visibleNotifications = !visibleNotifications"></i-button>
                <i-button title="Mi perfil" type="text" size="small" icon="person" @click="profileClick()"></i-button>
              <!-- </ButtonGroup> -->
              <Poptip placement="bottom-end" trigger="click" title="Mi perfil" v-model="visibleProfile">
                <div slot="content">
                  <img class="img-circle" :src="actualProfile.imagenperfil"/>
                  <h2 class="text-highlight">{{actualProfile.primernombre + ' ' + actualProfile.segundonombre + ' ' + actualProfile.primerapellido + ' ' + actualProfile.segundoapellido}}</h2>
                  <h4 class="text-highlight">{{actualProfile.cargo}}</h4>
                  <h4 class="text-highlight">{{actualProfile.oficina}}</h4>
                  <i-button class="button-center">Editar perfil</i-button>
                  <i-button class="button-center" @click="closeSesion()">Cerrar sesion</i-button>
                </div>
              </Poptip>
            </div>
          </i-col>
        </Row>
      </div>
    </Menu>
    <!-- Contenido del complement actual -->
    <transition enter-active-class="animated fadeIn" :duration="{ enter: 500 }" >
      <router-view class="content" v-bind:style="{ top: 10 + margintop + 'px' }"></router-view>
    </transition>
    <!-- Footer-->
    <div class="footer">
      <Row type="flex" justify="space-between">
        <!-- Contenedor Izquierdo -->
        <div class="footer-container">
          <Tag class="footer-item-tag clicker" v-bind:style="{ backgroundColor: colorVersion}" @click="gotoAbout()">
            {{require('./libs/settings.js').getDeployVersionApp() + ' ' + require('./libs/settings.js').getVersionApp()}}
          </Tag>
          <Tag class="footer-item-tag noclicker" v-if="developerMode === true">
            Modo Desarrollador
          </Tag>
          <Tag class="footer-item-tag text" v-if="actualProfile !== ''">
            <h4 style="display: inline-block;">Usuario actaul: {{actualProfile.username}}</h4>
          </Tag>
        </div>
        <!-- Contenedor Derecho -->
        <div class="footer-container">
          <Tag class="footer-item-tag text" v-if="actualProfile !== ''">
            <Icon type="link"/>
            Conectado a: {{ require('./libs/settings.js').getConnectionName() }}
          </Tag>
          <Poptip trigger="hover" title="Conexiones a BD" placement="left-end">
            <Tag class="footer-item-tag clicker" style="background-color: #81ecec">Conexiones</Tag>
            <div slot="content">
              <Row>
                <Button @click="connectionsModal = !connectionsModal" style="width: 100%; margin-bottom: 5px">Cambiar conexion actual</Button>
              </Row>
              <Row>
                <Button @click="ConnectionsAssitantShow()" style="width: 100%">Asistente de conexiones</Button>
              </Row>
            </div>
          </Poptip>
        </div>
      </Row>
    </div>
    <!-- Titlebar - Barra de titulo -->
    <Row v-if="platform === 'darwin'">
      <div :class="this.showTitlebar === false ? 'titlebar titlebar-darwin-close' : 'titlebar'">
      <!-- <div class="titlebar"> -->
        <label class="titlebar-title">Fact
          <div class="titlebar-icon">
            .Squid
          </div>
        </label>
      </div>
    </Row>

    <!-- Modals -->
    <!-- Informacion del sistema -->
    <Modal v-model="aboutModal">
      <div style="text-align: center;">
        <img src="./assets/images/factsquid_iconColor.png" style="width: 100px;">
        <h1>Fact.Squid version {{ require('./libs/settings.js').getVersionApp() }}</h1>
        <h4>Fact.Squid es desarrollado por Carlos Vasquez de AntrazStudios, Colombia</h4>
        <p style="margin-top: 30px">Utilizamos tecnologias punteras Web adaptadas a escritorio y de codigo abierto:</p>
        <Row style="margin-top: 15px; margin-bottom: 15px">
          <menu-selector sizeMenu="small" :optionsMenu="tecnologies"></menu-selector>
        </Row>
        <!-- <p>Fact.Squid utiliza VueJS y ElectronJS, ademas de otros asombrosos proyectos opensource.</p> -->
        <Row style="margin-top: 15px">
          <i-col span="12">
            <i-button type="ghost">Contrato de usuario final</i-button>
          </i-col>
          <i-col span="12">
            <i-button type="ghost">Listado de librerias</i-button>
          </i-col>
        </Row>
      </div>
      <Row slot="footer">
        <i-col span="8">
          <img src="./assets/images/antrazstudios.png" style="width: auto; height: 20px">
        </i-col>
        <i-col span="16">(C) 2016-2018 Todos los derechos reservados</i-col>
      </Row>
    </Modal>
    <!-- Asistente de Cambio de Conexion -->
    <Modal v-model="connectionsModal" :ok-text="'CAMBIAR CONEXION'" :cancel-text="'CANCELAR'" :title="'Asistente de Cambio de conexion'" @on-ok="changeDefaultConnection()" :mask-closable="false">
      <div id="divConexionActual" class="layout-text-item">
        <h4 style="display: inline">Conexion: </h4>
        <i-select v-model="connectionSelected" clereable>
          <i-option v-for="item in connectionsList" :value="item.name" :key="item.id">{{ item.name }}</i-option>
        </i-select>
      </div>
    </Modal>
    <Modal v-model="visibleNotifications" title="Notificaciones">
      <notifications-view v-if="showMenuBar === true" :notified="true" refresh="mounted"></notifications-view>
      <div slot="footer"></div>
    </Modal>
  </div>
</template>

<script>
  import MenuSelector from './components/miscelanius/menuOptions'
  import NotificationsView from './components/miscelanius/notificationsView'
  export default {
    name: 'factsquid',
    components: { NotificationsView, MenuSelector },
    data () {
      return {
        tecnologies: [
          {
            icon_type: 'https://cdn-images-1.medium.com/max/1600/0*gPcFC_SaJmZSuRas.png',
            text: 'electron-vue.js',
            clickAction: () => {
              const {shell} = require('electron')
              shell.openExternal('https://simulatedgreg.gitbooks.io/electron-vue/content/en/')
            },
            isFolder: false,
            icon_style: 'img',
            button_style: 'text'
          },
          {
            icon_type: 'https://vuejs.org/images/logo.png',
            text: 'vue.js',
            clickAction: () => {
              const {shell} = require('electron')
              shell.openExternal('https://vuejs.org/')
            },
            isFolder: false,
            icon_style: 'img',
            button_style: 'text'
          },
          {
            icon_type: 'https://camo.githubusercontent.com/79904b8ba0d1bce43022bbd5710f0ea1db33f54f/68747470733a2f2f7261776769742e636f6d2f73696e647265736f726875732f617765736f6d652d656c656374726f6e2f6d61737465722f656c656374726f6e2d6c6f676f2e737667',
            text: 'electron.js',
            clickAction: () => {
              const {shell} = require('electron')
              shell.openExternal('https://electronjs.org/')
            },
            isFolder: false,
            icon_style: 'img',
            button_style: 'text'
          },
          {
            icon_type: 'https://ih0.redbubble.net/image.317668688.2669/sticker,375x360-bg,ffffff.u5.png',
            text: 'Firebase by Google',
            clickAction: () => {
              const {shell} = require('electron')
              shell.openExternal('https://firebase.google.com/?hl=es-419')
            },
            isFolder: false,
            icon_style: 'img',
            button_style: 'text'
          },
          {
            icon_type: 'https://mc.qcloudimg.com/static/img/2742c21902443c72d3b0e198b7c49efb/11.png',
            text: 'MySQL by Oracle',
            clickAction: () => {
              const {shell} = require('electron')
              shell.openExternal('http://www.mysql.com')
            },
            isFolder: false,
            icon_style: 'img',
            button_style: 'text'
          },
          {
            icon_type: 'http://www.idlewilddigital.com/sites/default/files/jQurery_0.gif',
            text: 'jQuery',
            clickAction: () => {
              const {shell} = require('electron')
              shell.openExternal('http://www.jquery.com')
            },
            isFolder: false,
            icon_style: 'img',
            button_style: 'text'
          },
          {
            icon_type: 'https://lh3.googleusercontent.com/UAylvT-lNL3zfIefMgP9kiUwrhEnJxJiwq8hC0kne0qvSaOGYH8BVlJMYnNWRneb5AI=w300',
            text: 'Animate.css',
            clickAction: () => {
              const {shell} = require('electron')
              shell.openExternal('https://daneden.github.io/animate.css/')
            },
            isFolder: false,
            icon_style: 'img',
            button_style: 'text'
          },
          {
            icon_type: 'https://file.iviewui.com/dist/76ecb6e76d2c438065f90cd7f8fa7371.png',
            text: 'iView',
            clickAction: () => {
              const {shell} = require('electron')
              shell.openExternal('https://www.iviewui.com/')
            },
            isFolder: false,
            icon_style: 'img',
            button_style: 'text'
          },
          {
            icon_type: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/240px-Unofficial_JavaScript_logo_2.svg.png',
            text: 'JavaScript',
            clickAction: () => {
              const {shell} = require('electron')
              shell.openExternal('https://www.javascript.com/')
            },
            isFolder: false,
            icon_style: 'img',
            button_style: 'text'
          }
        ],
        electronRemote: null,
        widthMenu: '',
        showMenuBar: false,
        connectionsList: [],
        connectionSelected: '',
        actualWidthWindow: 0,
        actualHeightWindow: 0,
        maxHeightTable: 0,
        connectionsModal: false,
        aboutModal: false,
        colorVersion: '',
        loaderMessage: '...',
        actualProfile: '',
        developerMode: true,
        visibleProfile: false,
        visibleSearch: false,
        visibleNotifications: false,
        visibleReturnButton: 'hidden',
        activeName: '1',
        platform: 'win32',
        margintop: 0,
        showTitlebar: false,
        routeIndexes: [
          {
            id: '1',
            name: 'login',
            buttonReturn: false
          },
          {
            id: '1',
            name: 'landing-page',
            buttonReturn: false
          },
          {
            id: null,
            name: 'settings-about',
            buttonReturn: true
          },
          {
            id: null,
            name: 'settings-index',
            buttonReturn: true
          }
        ],
        notificacionesManager: NotificationsView
      }
    },
    mounted () {
      if (this.maxHeightTable === 0) {
        this.maxHeightTable = this.electronRemote.getCurrentWindow().getSize()[1] - 240
      }
      this.handleSpinHide()
    },
    created: function () {
      this.electronRemote = require('electron').remote
      // Obtencion del maximo de una tabla dependiendo del tamaño de la app
      this.electronRemote.getCurrentWindow().on('resize', () => {
        this.maxHeightTable = this.electronRemote.getCurrentWindow().getSize()[1] - 240
        this.actualWidthWindow = this.electronRemote.getCurrentWindow().getSize()[0]
        this.actualHeightWindow = this.electronRemote.getCurrentWindow().getSize()[1]
      })
      // Creacion del menu
      this.createMenu()
      // Carga la plataforma
      this.platform = process.platform
      if (this.platform === 'win32') {
        this.margintop = 0
      } else {
        this.margintop = 20
      }
      // Se crea una nueva instancia de la libreria de configuracion
      let settings = require('./libs/settings.js')
      settings.updateTempPath()
      // Define el color dependiendo del tipo de Deploy
      switch (settings.getDeployVersionApp()) {
        case 'ALPHA':
          this.colorVersion = '#ff7675'
          break
        case 'BETA':
          this.colorVersion = '#fab1a0'
          break
        case 'RELEASE CANDIDATE':
          this.colorVersion = '#ffeaa7'
          break
        case 'STABLE':
          this.colorVersion = '#55efc4'
          break
      }
      // Se crea el archivo de configuracion general
      console.log(settings.createConfigContent())
      // Se elimina cualquier sesion que pueda existir
      console.log(settings.endSesion())
      // Se notifica al usuario que se reiniciaron las credenciales y que debe suministrarlas de nuevo
      this.$Message.warning({
        content: 'Se han reiniciado todas las sesiones, es necesario que proporcione sus credenciales',
        duration: 6
      })
      // Se modifica la vista actual y el app
      // document.getElementById('menufix').style.visibility = 'hidden'
      this.changePath('/login')
      let defaultConnName = settings.getContentFromLocalKey('defaultConn')
      let i = 0
      this.connectionsList = settings.getContentFromLocalKey('connections')
      for (i; i <= this.connectionsList.length - 1; i++) {
        if (this.connectionsList[i].id === defaultConnName) {
          this.connectionSelected = this.connectionsList[i].name
        }
      }
    },
    methods: {
      ConnectionsAssitantShow () {
        this.changePath('/sql/connectionsassistant')
      },
      changeDefaultConnection () {
        for (let i = 0; i < this.connectionsList.length; i++) {
          if (this.connectionsList[i].name === this.connectionSelected) {
            require('./libs/settings.js').addContentToLocalKey('defaultConn', this.connectionsList[i].id)
          }
        }
        // Se elimina cualquier sesion que pueda existir
        this.closeSesion()
        this.$Message.warning({
          content: 'Se ha reiniciado su sesion para que se conecte con el nuevo servidor',
          duration: 10
        })
        this.changePath('/login')
      },
      showTitleBar (show) {
        this.showMenuBar = show
        this.showTitlebar = show
      },
      createMenu () {
        // Creacion del menu de la aplicacion
        const {remote} = require('electron')
        const {Menu} = remote
        console.log(Menu.getApplicationMenu())
        // // Creacion del template del menu
        // const templateMenu = [
        //   {
        //     label: 'Fact.Squid',
        //     submenu: [
        //       {
        //         label: 'Acerca de',
        //         click () { this.aboutModal = true }
        //       }
        //     ]
        //   }
        // ]
        // const menu = Menu.buildFromTemplate(templateMenu)
        // Menu.setApplicationMenu(menu)
      },
      changePath (to, params = null) {
        this.$router.push({
          path: to,
          query: params
        })
        for (let i = 0; i < this.routeIndexes.length; i++) {
          if (this.routeIndexes[i].name === this.$route.name) {
            this.activeName = this.routeIndexes[i].id
          }
        }
        this.getPathButtonVisibility()
      },
      returnPath () {
        this.$router.go(-1)
        this.getPathButtonVisibility()
      },
      getPathButtonVisibility (name = this.$route.name) {
        for (let i = 0; i < this.routeIndexes.length; i++) {
          if (this.routeIndexes[i].name === name) {
            if (this.routeIndexes[i].buttonReturn === true) {
              this.visibleReturnButton = 'visible'
            } else {
              this.visibleReturnButton = 'hidden'
            }
            return this.visibleReturnButton
          }
        }
      },
      verifySesion () {
        this.actualProfile = require('./libs/settings.js').getSesionProfile()
      },
      closeSesion () {
        this.actualProfile = ''
        require('./libs/settings.js').endSesion()
        this.$Message.info({
          content: 'Se ha finalizado la sesion correctamente',
          duration: 6
        })
        this.$router.push('/login')
        this.electronRemote.getCurrentWindow().setSize(1000, 650, true)
        this.electronRemote.getCurrentWindow().center()
        this.electronRemote.getCurrentWindow().setMaximizable(false)
        this.electronRemote.getCurrentWindow().setResizable(false)
      },
      handleSpinShow (message = 'Espere un momento por favor') {
        this.$Spin.show({
          render: (h) => {
            return h('div', [
              h('div', {
                'class': 'modal-contenedor--img'
              }),
              h('label', {
                'class': 'modal-contenedor--label'
              }, message)
            ])
          }
        })
      },
      handleSpinHide () {
        this.$Spin.hide()
      },
      profileClick () {
        this.visibleProfile = !this.visibleProfile
        console.log(this.$refs.MenuFix.width)
        console.log(this.widthMenu)
      },
      searchClick () {
        this.visibleSearch = !this.visibleSearch
      },
      verifyNotifications () {
        // let notificacionesObtenidas = []
        if (this.actualProfile !== '' && this.actualProfile !== undefined) {
          // let idUser = this.actualProfile.id
          // let storage = require('./libs/storage')
          console.log('prueba')
          // storage._database_getNotifications(this.actualProfile.id).then((rta) => {
          //   this.notificaciones = rta
          //   notificacionesObtenidas = rta
          //   return notificacionesObtenidas
          // }).catch((err) => {
          //   this.$Message.error(err.message)
          // })
        }
      },
      gotoSettings () {
        if (this.actualProfile.verifyPermission('SETTINGS_INDEX') === true) {
          this.changePath('/Settings/index')
        } else {
          this.$Message.error({
            content: 'Usted no tiene los permisos suficientes para ir a esa seccion del sistema',
            duration: 6
          })
        }
      },
      gotoAbout () {
        if (this.$route.path === '/Settings/about/2') {
          this.returnPath()
        } else {
          this.changePath('/Settings/about/2')
        }
      },
      gotoDocumentation () {
        this.changePath('/Settings/about/1')
      }
    }
  }
</script>

<style lang="css">
  @font-face {
    font-family: 'Poppins';
    src: url('./assets/fonts/Poppins-Regular.ttf');
  }
  #app {
    font-family: 'Poppins', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
/* Scrollbars */
  ::-webkit-scrollbar {
    background-color: rgba(255, 255, 255, 0);
    width: .2em;
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgb(143, 143, 143);
  }
  ::-webkit-scrollbar-corner {
    background-color: transparent;
  }
  ::-webkit-scrollbar-button {
    width: 0;
    height: 0;
    display: none;
  }
  /* Body */
  body {
    font-family: 'Poppins', sans-serif;
    width: 100%;
    height:100%;
    background-color: white;
    overflow-x: hidden;
  }
  .titlebar-title{
    font-weight: bold;
    opacity: 0.8;
    font-size: 14px;
    vertical-align: middle;
    font-family: Century Gothic,CenturyGothic,AppleGothic,sans-serif;
  }
  .titlebar-icon{
    display: inline;
    padding-left: 7px;
    padding-top: 3px;
    padding-right: 5px;
    padding-bottom: 2px;
    vertical-align: middle;
    background-color: rgb(73, 80, 96);
    color: white;
    border-radius: 4px;
  }
  .titlebar{
    user-select: none;
    -webkit-app-region: drag;
    position: fixed;
    padding-top: 4px;
    padding-bottom: 4px;
    text-align: center;
    width: 100%;
    top: 0px;
    z-index: 1000;
    background-color: white;
  }
  .titlebar-darwin-close{
    -webkit-box-shadow: 0 4px 6px -6px #222;
    -moz-box-shadow: 0 4px 6px -6px #222;
    box-shadow: 0 4px 6px -6px #222;
    z-index: 999;
  }
  .footer{
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: white;
    color: rgba(0, 0, 0, 0.43);
    -webkit-box-shadow: 0px -6px 4px -6px #949494;
    -moz-box-shadow: 0px -6px 4px -6px #949494;
    box-shadow: 0px -6px 4px -6px #949494;
    z-index: 999;
  }
  .footer-container{
    display: inline-block;
  }
  .footer-item-tag{
    margin-top: 1px;
    margin-bottom: 0px;
    vertical-align: middle;
    font-weight: bold;
    font-size: 11px;
    text-transform: uppercase;
    border-radius: 6px;
  }
  .footer-item-tag.clicker{
    cursor: pointer;
    color: white!important;
  }
  .footer-item-tag.noclicker{
    cursor: not-allowed;
    background-color: #dfe6e9;
    color: white;
  }
  .footer-item-tag.text{
    cursor: not-allowed;
    background-color: rgba(0, 0, 0, 0);
    border-color: rgba(0, 0, 0, 0);
  }
  .content {
    overflow-y: scroll;
    position: relative;
    height: 100%;
    width: 100%;
    bottom: 32px;
    overflow-x: hidden;
    background: transparent;
  }
  .layout-nav{
      display: block;
      margin: auto;
  }
  .layout-fixed{
    margin-top: 0px;
    margin-bottom: 0px;
    width: 100%;
    background-color: white;
    position: fixed;
    -webkit-box-shadow: 0 4px 6px -6px #222;
    -moz-box-shadow: 0 4px 6px -6px #222;
    box-shadow: 0 4px 6px -6px #222;
    z-index: 999;
  }
  .layout-buttons{
    float: right;
    position: relative;
    right: 0px;
  }
  .layout-return{
    float: left;
    position: relative;
    left: 0px;
  }
  .modal-contenedor--img{
      display: block;
      margin: auto;
      width: 60px;
      height: 60px;
      background-image: url("~@/assets/images/ajax-loader.gif");
      background-size: contain;
  }
  .modal-contenedor--label{
      display: block;
      margin: 4%;
      text-align: center;
      color: rgba(41, 41, 41, 0.6);
  }
  .img-circle{
    border-radius: 80%;
    width: 100px;
    height: 100px;
    display: block;
    margin: 0 auto;
  }
  .button-center{
    margin-left: auto;
    margin-right: auto;
    display: block;
    margin-top: 5px;
  }
  .text-highlight{
    color: #a3a3a3;
    margin: 5px 0px;
    text-align: center;
  }
  .text-center-layout{
    text-align: center;
  }
  .text-right-layout{
    text-align: right;
  }
</style>
