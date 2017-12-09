<style scoped>
  /* CSS */
  body {
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-seri;
    height:100%;
    margin:0;
    padding:0;
  }
  footer {
    position: fixed;
    bottom: 0;
    background-color: #dadada;
    color: gray;
    text-align: right;
    width: 100%;
  }
  .content {
    align-items: center;
    align-content: stretch;
    position: absolute;
    top: 60px;
    bottom: 30px;
  }
  .layout-logo{
      width: 30px;
      height: 30px;
      background-image: url("~@/assets/images/favicon.png");
      background-size: contain;
      background-repeat: no-repeat;
      border-radius: 3px;
      float: left;
      position: relative;
      top: 15px;
      left: 20px;
      opacity: 2%;
  }
  .layout-nav{
      width: 800px;
      margin: 0 auto;
  }
  .layout-buttons{
    float: right;
    position: relative;
    right: 20px;
  }
  .modal {
      display: '';
      position:   fixed;
      z-index:    1000;
      top:        0;
      left:       0;
      height:     100%;
      width:      100%;
      background: rgba( 255, 255, 255, .94 )

                  50% 50%
                  no-repeat;
      background-size: 10%;
  }
  .modal-contenedor{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
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
</style>

<template>
  <div id="app" style="user-select: none">
    <Affix ref="menufix" style="display: none">
      <Menu mode="horizontal" active-name="1" theme="light">
        <div class="layout-logo"></div>
        <div class="layout-nav">
          <MenuItem name="1">
            <router-link style="color: inherit" :to="{ name: 'landing-page'}">
              <icon type="ios-home"/>
              Inicio
            </router-link>
          </MenuItem>
          <MenuItem name="2">
            <router-link style="color: inherit" :to="{ name: 'system-information' }">
              <icon type="ios-body"/>
              Terceros
            </router-link>
          </MenuItem>
          <MenuItem name="3">
            <icon type="social-usd"/>
            Facturacion
          </MenuItem>
          <MenuItem name="4">
            <icon type="paper-airplane"/>
            Radicacion
          </MenuItem>
          <MenuItem name="5">
            <icon type="cash"/>
            Cartera
          </MenuItem>
          <MenuItem name="6">
            <icon type="ios-analytics"/>
            Reporteador
          </MenuItem>
        </div>
        <div class="layout-buttons">
          <i-button title="Buscar" shape="circle" icon="search" @click="verifySesion()"></i-button>
          <i-button title="Ayuda" shape="circle" icon="help"></i-button>
          <Poptip placement="bottom-end" trigger="hover" title="Mi perfil">
            <i-button shape="circle" icon="ios-person"></i-button>
            <div slot="content">
              <img ref="imgProfile" class="img-circle" src=""/>
              <h2 class="text-highlight">{{actualProfile.primernombre + ' ' + actualProfile.segundonombre + ' ' + actualProfile.primerapellido + ' ' + actualProfile.segundoapellido}}</h2>
              <h4 class="text-highlight">{{actualProfile.cargo}}</h4>
              <h4 class="text-highlight">{{actualProfile.oficina}}</h4>
              <i-button class="button-center">Editar perfil</i-button>
              <i-button class="button-center" @click="closeSesion()">Cerrar sesion</i-button>
            </div>
          </Poptip>
          <i-button title="Conexion" shape="circle" icon="wifi"></i-button>
          <i-button title="Configuracion Sistema" shape="circle" icon="wrench"></i-button>
        </div>
      </Menu>
    </Affix>
    <router-view class="content"></router-view>
    <footer ref="footerfix" style="display: none">
        <h4>BETA 3.0.0.0</h4>
    </footer>
    <div ref="loaderfix" class="modal">
      <div class="modal-contenedor">
        <div class="modal-contenedor--img"></div>
        <label class="modal-contenedor--label">{{loaderMessage}}</label>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'billsdelivery-vue',
    data () {
      return {
        loaderMessage: '...',
        actualProfile: '',
        developerMode: true
      }
    },
    mounted () {
      this.handleSpinHide()
    },
    created: function () {
      // Se crea una nueva instancia de la libreria de configuracion
      let settings = require('./libs/settings.js')
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
      this.$router.push('/login')
    },
    methods: {
      verifySesion () {
        this.actualProfile = require('./libs/settings.js').getSesionProfile()
        this.$refs.imgProfile.src = 'data:image/png;base64, ' + this.actualProfile.imagenperfil
      },
      closeSesion () {
        require('./libs/settings.js').endSesion()
        this.$Message.info({
          content: 'Se ha finalizado la sesion correctamente',
          duration: 6
        })
        this.$router.push('/login')
      },
      handleSpinShow (message = 'Espere un momento por favor') {
        this.$refs.loaderfix.style.display = ''
        this.loaderMessage = message
      },
      handleSpinHide () {
        this.$refs.loaderfix.style.display = 'none'
      }
    }
  }
</script>
