<template>
  <div>
    <Row>
      <Menu mode="horizontal"  active-name="1">
        <MenuItem name="1">
          <icon type="ios-home"/>
          Inicio
        </MenuItem>
        <MenuItem name="2">
          <icon type="ios-body"/>
          Terceros
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
        <MenuItem name="7">
          <icon type="wrench"/>
          Configuracion
        </MenuItem>
      </Menu>
    </Row>
    <footer>
      Hecho con
      <Icon type="ios-heart"/>
      por AntrazStudios
    </footer></div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'

  export default {
    name: 'landing-page',
    components: { SystemInformation },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style>
footer {
  position: fixed;
  bottom: 0;
  background-color: #2e323b;
  color: white;
  text-align: center;
  width: 100%;
  cursor: pointer;
  opacity: .4;
}
</style>
