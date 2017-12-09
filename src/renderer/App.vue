<template lang="html">
  <div id="app" style="user-select: none">
    <!-- <Affix ref="menufix" style="display: none;"> -->
      <Menu ref="menufix" mode="horizontal" active-name="1" style="background: white !important;">
        <div class="layout-fixed">
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
            <Poptip placement="bottom-start" trigger="click" title="Buscar" v-model="visibleSearch">
              <div slot="content">
                <Input style="margin: 10px 0px">
                  <i-button slot="append" icon="search"></i-button>
                </Input>
              </div>
            </Poptip>
            <ButtonGroup>
              <i-button title="Buscar" type="text" icon="search" @click="searchClick()"></i-button>
              <i-button title="Ayuda" type="text" icon="help"></i-button>
              <i-button title="Configuracion Sistema" type="text" icon="wrench" @click="gotoSettings()"></i-button>
              <i-button title="Mi perfil" type="text" icon="person" @click="profileClick()"></i-button>
            </ButtonGroup>
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
        </div>
      </Menu>
    <!-- </Affix> -->
    <router-view class="content"></router-view>
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
        developerMode: true,
        visibleProfile: false,
        visibleSearch: false
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
      },
      gotoSettings () {
        if (this.actualProfile.verifyPermission('SETTINGS_INDEX') === true) {
          this.$router.push('/Settings/index')
        } else {
          this.$Message.error({
            content: 'Usted no tiene los permisos suficientes para ir a esa seccion del sistema',
            duration: 6
          })
        }
      },
      profileClick () {
        this.visibleProfile = !this.visibleProfile
      },
      searchClick () {
        this.visibleSearch = !this.visibleSearch
      }
    }
  }
</script>

<style lang="css">
  /* CSS */
  body {
    font-family: "Helvetica Neue",Arial;
    height:100%;
    margin:0;
    padding:0;
    background-color: rgba(245, 241, 241, 0.2);
  }
  .content {
    position: relative;
    height: 100%;
  }
  .layout-nav{
      display: block;
      margin: auto;
  }
  .layout-fixed{
    width: 100%;
    background-color: white;
    position: fixed;
    -webkit-box-shadow: 0 4px 6px -6px #222;
    -moz-box-shadow: 0 4px 6px -6px #222;
    box-shadow: 0 4px 6px -6px #222;
  }
  .layout-buttons{
    float: right;
    position: relative;
    right: 0px;
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
