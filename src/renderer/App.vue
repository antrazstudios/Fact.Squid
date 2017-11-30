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
</style>

<template>
  <div id="app">
    <Affix ref="menufix">
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
          <i-button title="Ver mi perfil" shape="circle" icon="ios-person"></i-button>
          <i-button title="Conexion" shape="circle" icon="wifi"></i-button>
          <i-button title="Configuracion Sistema" shape="circle" icon="wrench"></i-button>
        </div>
      </Menu>
    </Affix>
    <router-view class="content"></router-view>
    <footer id="footer-fix" style="visibility: hidden">
        <h4>BETA 3.0.0.0</h4>
    </footer>

  </div>
</template>

<script>
  export default {
    name: 'billsdelivery-vue',
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
      }
    }
  }
</script>
