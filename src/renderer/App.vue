<style scoped>
  /* CSS */
  body {
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    height:100%;
    margin:0;
    padding:0;
  }
  footer {
    position: fixed;
    bottom: 0;
    background-color: #dadada;
    color: white;
    text-align: right;
    width: 100%;
  }
  .content {
    min-height: 100%;
    height: auto !important;
    height: 100%;
  }
  .layout-logo{
      width: 30px;
      height: 30px;
      background: #e4e4e4;
      border-radius: 3px;
      float: left;
      position: relative;
      top: 15px;
      left: 20px;
  }
  .layout-nav{
      width: 800px;
      margin: 0 auto;
  }
</style>

<template>
  <div id="app">
    <Menu mode="horizontal"  active-name="1" theme="light">
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
    </Menu>
    <router-view class="content"></router-view>
    <footer>
      <i-button type="text">
        <Icon type="wrench"/>
        Configuracion
      </i-button>
        <i-button type="text">
          <Icon type="ios-person"/>
          btnusuarioActual
        </i-button>
        <i-button type="text">
          <Icon type="wifi"/>
          Cambiar Conexion
        </i-button>
        <h4></h4>
    </footer>
  </div>
</template>

<script>
  export default {
    name: 'billsdelivery-vue'
  }
</script>
