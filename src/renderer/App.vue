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
              <Tooltip :disabled="actualWidthWindow < 1374 ? false : true" content="Inicio" placement="bottom">
                <i-button type="text" @click="changePath('/')">
                  <icon type="ios-home"/>
                  <span v-if="actualWidthWindow > 1373">Inicio</span>
                </i-button>
              </Tooltip>
              <Tooltip :disabled="actualWidthWindow < 1374 ? false : true" content="Terceros" placement="bottom">
                <i-button type="text" @click="changePath('/terceros')">
                  <icon type="ios-body"/>
                  <span v-if="actualWidthWindow > 1373">Terceros</span>
                </i-button>
              </Tooltip>
              <Tooltip :disabled="actualWidthWindow < 1374 ? false : true" content="Facturacion" placement="bottom">
                <i-button type="text" @click="changePath('/Facturacion/index')">
                  <icon type="social-usd"/>
                  <span v-if="actualWidthWindow > 1373">Facturacion</span>
                </i-button>
              </Tooltip>
              <Tooltip :disabled="actualWidthWindow < 1374 ? false : true" content="Radicacion" placement="bottom">
                <i-button type="text" @click="changePath('/Radicacion/index')">
                  <icon type="cube"/>
                  <span v-if="actualWidthWindow > 1373">Radicacion</span>
                </i-button>
              </Tooltip>
              <Tooltip :disabled="actualWidthWindow < 1374 ? false : true" content="Cartera" placement="bottom">
                <i-button type="text" @click="changePath('/Cartera/index')">
                  <icon type="cash"/>
                  <span v-if="actualWidthWindow > 1373">Cartera</span>
                </i-button>
              </Tooltip>
              <Tooltip :disabled="actualWidthWindow < 1374 ? false : true" content="Reporteador" placement="bottom">
                <i-button type="text" @click="changePath('/Reporteador/index')">
                  <icon type="clipboard"/>
                  <span v-if="actualWidthWindow > 1373">Reporteador</span>
                </i-button>
              </Tooltip>
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
                  <i-button class="button-center" @click="gotoProfile()">Editar perfil</i-button>
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
          <!-- Muestra la version de la aplicacion y la compilacion -->
          <Tag class="footer-item-tag noclicker" v-bind:style="{ backgroundColor: colorVersion}">
            {{require('./libs/settings.js').getDeployVersionApp() + ' ' + require('./libs/settings.js').getVersionApp()}}
          </Tag>
          <!-- Muestra opciones del modo Desarrollador -->
          <Poptip trigger="hover" v-if="developerMode === true">
            <Tag class="footer-item-tag clicker" style="background-color: #2c3e50">Modo Desarrollador</Tag>
            <div slot="content">
              <Row>
                <Button style="width: 100%; margin-bottom: 5px" @click="changePath('/Settings/log')">Logs del sistema</Button>
              </Row>
              <Row>
                <Button style="width: 100%; margin-bottom: 5px">Depuracion del sistema</Button>
              </Row>
              <Row>
                <Button style="width: 100%">Salir del modo Desarrollador</Button>
              </Row>
            </div>
          </Poptip>
          <!-- Muestra el usuario logeado en el sistema -->
          <Tag class="footer-item-tag text" v-if="actualProfile !== ''">
            <h4 style="display: inline-block;">Usuario actual: {{actualProfile.username}}</h4>
          </Tag>
        </div>
        <!-- Contenedor Derecho -->
        <div class="footer-container">
          <!-- Muestra la conexion actual a la base de datos -->
          <Tag class="footer-item-tag text" v-if="actualProfile !== ''">
            <Icon type="link"/>
            Conectado a: {{ require('./libs/settings.js').getConnectionName() }}
          </Tag>
          <!-- Muestra las opciones con las conexiones a la base de datos -->
          <Poptip trigger="hover" title="Conexiones a BD" placement="top-end">
            <Tag class="footer-item-tag clicker" style="background-color: #1abc9c" @click="connectionsAssitantShow()">Conexiones</Tag>
            <div slot="content">
              <Row>
                <Button @click="connectionsModal = !connectionsModal" style="width: 100%; margin-bottom: 5px">Cambiar conexion actual</Button>
              </Row>
              <Row>
                <Button @click="connectionsAssitantShow()" style="width: 100%">Asistente de conexiones</Button>
              </Row>
            </div>
          </Poptip>
        </div>
      </Row>
    </div>
    <!-- Titlebar - Barra de titulo -->
    <div v-bind:class="showMenuBar === true ? 'titlebar' : 'titlebar-shadow'">
      <Row type="flex" justify="center">
        <i-col span="3"></i-col>
        <!-- Muestra el titulo de la aplicacion -->
        <i-col span="18" style="-webkit-app-region: drag;">
          <label class="titlebar-title">Fact
            <div class="titlebar-icon">
              .Squid
            </div>
          </label>
        </i-col>
        <!-- Botones en caso de que sea en Windows su ubicacion -->
        <i-col style="text-align: right; z-index: 999" span="3">
          <i-button v-if="platform !== 'darwin'" style="z-index: 99" :disabled="!windowButtonCloseState" title="Minizar" type="text" icon="minus" size="small" @click="windowMinimize()"></i-button>
          <i-button v-if="platform !== 'darwin'" style="z-index: 99" :disabled="!windowButtonCloseState" :title="windowState === 'maximized' ? 'Restaurar' : 'Maximizar'" type="text" :icon="windowState === 'maximized' ? 'arrow-shrink' : 'arrow-expand'" size="small" @click="windowState === 'maximized' ? windowRestore() : windowMaximize()"></i-button>
          <i-button v-if="platform !== 'darwin'" style="z-index: 99" title="Cerrar" :disabled="!windowButtonCloseState" type="text" icon="close" size="small" @click="windowClose()"></i-button>
        </i-col>
      </Row>    
    </div>
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
    <!-- Notificaciones -->
    <Modal v-model="visibleNotifications" title="Notificaciones">
      <notifications-view v-if="showMenuBar === true" :notified="true" refresh="mounted" visualization="complete"></notifications-view>
      <div slot="footer"></div>
    </Modal>
    <!-- Modo de autenticacion de Desarrollador -->
    <Modal v-model="vDeveloperAuth" :ok-text="'Autenticarse'" :cancel-text="'Cancelar'" :title="'Autenticacion de Servicio de Desarrolladores'" :mask-closable="false" @on-ok="developerAuth()">
      <i-input type="password" v-model="vDeveloperPass" placeholder="Ingrese su contraseña de desarrollador"></i-input>
    </Modal>
    <Spin v-if="visibleLoadObject" fix>
      <div>
        <Icon v-if="visibleLoadType === 'normal'" class="spin-icon-load" type="ios-loop" size="40"/>
        <i-progress v-if="visibleLoadType === 'progress'" :percent="visibleLoadPercent" :status="visibleLoadStatus"></i-progress>
        <p v-if="visibleLoadStatus !== 'success'" class="spin-text-load">{{visibleLoadText}}</p>
        <i-button v-if="visibleLoadStatus === 'success'" @click="visibleLoadAction">{{visibleLoadActionText}}</i-button>
      </div>
    </Spin>
  </div>
</template>

<script>
  // Zona de importacion de objetos
  import NotificationsView from './components/miscelanius/notificationsView' // Muestra las notificaciones del sistema
  import MenuSelector from './components/miscelanius/menuOptions'
  export default {
    name: 'factsquid',
    components: { NotificationsView, MenuSelector },
    data () {
      return {
        visibleLoadObject: true,
        visibleLoadType: 'normal',
        visibleLoadText: 'Un momento por favor, esta operacion solo tardara unos minutos',
        visibleLoadPercent: 0,
        visibleLoadStatus: 'normal',
        visibleLoadAction: null,
        visibleLoadActionText: 'Listo!',
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
        vDeveloperAuth: false,
        vDeveloperPass: '',
        windowState: 'normal',
        windowButtonCloseState: true,
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
      // let Objet = require('./libs/prueba').Cosa
      // let instance = new Objet('un dato')
      // instance.funcionalidad()
      // Verficacion del tamaño maximo que puede tomar una tabla, si es 0 lo obtiene por calculo desde el tamaño de la visualizacion.
      if (this.maxHeightTable === 0) {
        this.maxHeightTable = this.electronRemote.getCurrentWindow().getSize()[1] - 240
      }
      // Se oculta el Spin de espera
      this.handleSpinHide()
      // definimos el estado del modo Desarrollador
      const sett = require('./libs/settings')
      if (sett.getContentFromLocalKey('developerMode') === 0) {
        this.developerMode = false
      } else {
        this.developerMode = true
      }
    },
    created: function () {
      // Mostrar la espera en pantalla
      this.handleSpinShow()
      // Precarga el inicio por debajo
      this.changePath('/')
      // Desactiva los botones de la ventana
      this.windowButtonCloseState = false
      // Obtiene el Remote de la instancia de Electron
      this.electronRemote = require('electron').remote
      // Obtencion del maximo de una tabla dependiendo del tamaño de la app
      this.electronRemote.getCurrentWindow().on('resize', () => {
        this.maxHeightTable = this.electronRemote.getCurrentWindow().getSize()[1] - 240
        this.actualWidthWindow = this.electronRemote.getCurrentWindow().getSize()[0]
        this.actualHeightWindow = this.electronRemote.getCurrentWindow().getSize()[1]
      })
      // Cambiar el estado de la ventana para visualizar el cambio de controles de ventana
      this.electronRemote.getCurrentWindow().on('maximize', () => {
        this.windowState = 'maximized'
      })
      // Cambiar el estado de la ventana para visualizar el cambio de controles de ventana
      this.electronRemote.getCurrentWindow().on('unmaximize', () => {
        this.windowState = 'restored'
      })
      // Evento de cambio del modo desarrollador
      window.addEventListener('keyup', (e) => {
        if (e.altKey === true && e.code === 'KeyD') {
          this.vDeveloperAuth = true
        }
      }, true)
      // Abrir los enlaces de la aplicacion en el navegador por defecto
      var shell = require('electron').shell
      var $ = require('jquery')
      $(document).on('click', 'a[href^="http"]', function (event) {
        event.preventDefault()
        shell.openExternal(this.href)
      })
      // Creacion del menu en modo desarrollador
      this.createMenu()
      // Carga la plataforma
      this.platform = process.platform
      // Definir el tamaño de espacio hacia el titlebar
      this.margintop = 20
      // Se crea una nueva instancia de la libreria de configuracion
      let settings = require('./libs/settings.js')
      // Se actauliza el Path de temporales desde la configuracion
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
      settings.createConfigContent()
      // Se elimina cualquier sesion que pueda existir
      settings.endSesion()
      // Se notifica al usuario que se reiniciaron las credenciales y que debe suministrarlas de nuevo
      this.$Message.warning({
        content: 'Se han reiniciado todas las sesiones existentes, es necesario que proporcione sus credenciales para iniciar',
        duration: 6
      })
      // Se cargan las conexiones
      this.chargeConnections()
      // Se redirige a la vista de inicio de sesion
      this.changePath('/login')
    },
    methods: {
      developerAuth () {
        let response = 0
        if (this.vDeveloperPass === 'Gata1125*') {
          response = 1
          this.developerMode = true
          this.$Message.warning('MODO DESARROLLADOR ACTIVADO')
          this.vDeveloperPass = ''
        } else {
          if (this.developerMode === true) {
            this.$Message.warning('MODO DESARROLLADOR DESACTIVADO')
          } else {
            this.$Message.error('ERROR DE AUTENTICACION')
          }
          response = 0
          this.developerMode = false
        }
        const sett = require('./libs/settings')
        sett.addContentToLocalKey('developerMode', response)
      },
      connectionsAssitantShow () {
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
      chargeConnections () {
        let settings = require('./libs/settings.js')
        let defaultConnName = settings.getContentFromLocalKey('defaultConn')
        let i = 0
        this.connectionsList = settings.getContentFromLocalKey('connections')
        for (i; i <= this.connectionsList.length - 1; i++) {
          if (this.connectionsList[i].id === defaultConnName) {
            this.connectionSelected = this.connectionsList[i].name
          }
        }
      },
      showTitleBar (show) {
        this.showMenuBar = show
        this.showTitlebar = show
      },
      createMenu () {
        // Creacion del menu de la aplicacion
        // const {remote} = require('electron')
        // const {Menu} = remote
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
        this.windowButtonCloseState = false
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
      handleSpinShow (message = 'Un momento por favor, esta operacion solo tardara unos minutos', type = 'normal', percent = 0) { // type ? normal : progress;;;; percent ? progreso del proceso
        this.visibleLoadObject = true
        this.visibleLoadType = type
        this.visibleLoadText = message
        this.visibleLoadPercent = percent
        this.visibleLoadStatus = 'active'
      },
      handleSpinProgressUpdate (percent, message = 'no-update', action = null, actionText = 'Listo!') {
        if (message !== 'no-update') {
          this.visibleLoadText = message
        }
        this.visibleLoadPercent = Number(percent).toFixed(0)
        this.visibleLoadActionText = actionText
        this.visibleLoadAction = action
        if (this.visibleLoadPercent >= 100) {
          this.visibleLoadStatus = 'success'
        }
      },
      handleSpinHide () {
        this.visibleLoadObject = false
      },
      gotoProfile () {
        this.changePath('/Profile')
      },
      profileClick () {
        this.visibleProfile = !this.visibleProfile
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
      },
      windowMaximize () {
        this.electronRemote.getCurrentWindow().maximize()
      },
      windowRestore () {
        this.electronRemote.getCurrentWindow().unmaximize()
      },
      windowMinimize () {
        this.electronRemote.getCurrentWindow().minimize()
      },
      windowClose () {
        this.electronRemote.getCurrentWindow().close()
      }
    }
  }
</script>

<style>
  @font-face {
    font-family: 'Poppins';
    src: url('./assets/fonts/Poppins-Regular.ttf');
  }
  @font-face {
    font-family: 'Gill Sans';
    src: url('./assets/fonts/GillSansStd.otf');
  }
  @font-face {
    font-family: 'Product Sans';
    src: url('./assets/fonts/Product Sans Regular.ttf');
  }
  #app {
    font-family: 'Poppins', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  /* Animacion de Loading */
  .spin-icon-load{
    animation: ani-load-spin 2s linear infinite;
  }
  .spin-text-load{
    animation: ani-load-text 1.5s linear infinite;
  }
  @keyframes ani-load-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
  }
  @keyframes ani-load-text {
    from { opacity: 1; }
    50% { opacity: 0.5; }
    to { opacity: 1; }
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
    border-color: black;
    border-width: 1px;
  }
  .titlebar-title{
    font-weight: bold;
    opacity: 0.8;
    font-size: 15px;
    vertical-align: middle;
    font-family: 'Gill Sans', sans-serif;
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
    font-family: 'Gill Sans', sans-serif;
    position: fixed;
    padding-top: 4px;
    padding-bottom: 4px;
    text-align: center;
    width: 100%;
    top: 0px;
    z-index: 100;
    background-color: white;
  }
  .titlebar-shadow {
    -webkit-box-shadow: 0 4px 6px -6px #222;
    -moz-box-shadow: 0 4px 6px -6px #222;
    box-shadow: 0 4px 6px -6px #222;
    font-family: 'Gill Sans', sans-serif;
    position: fixed;
    padding-top: 4px;
    padding-bottom: 4px;
    text-align: center;
    width: 100%;
    top: 0px;
    z-index: 100;
    background-color: white;
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
    /* z-index: 999; */
    padding-bottom: 3px;
    padding-left: 3px;
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
    background-color: #87898a;
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
    z-index: 98;
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
