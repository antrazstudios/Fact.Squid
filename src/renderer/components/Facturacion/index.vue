<template>
  <div>
    <Row>
      <menu-selector :optionsMenu="options" titleMenu="Acciones con Facturacion" sizeMenu="normal"></menu-selector>
    </Row>
    <Row>
      <Card style="width: 100%; margin-top: 20px"></Card>
    </Row>
  </div>
</template>
<script>
import MenuSelector from '../miscelanius/menuOptions'
export default {
  name: 'facturacion-index',
  components: { MenuSelector },
  data () {
    return {
      options: [
        // Recepcion de facturacion
        {
          icon_type: 'ios-plus-outline',
          text: 'Recepcion facturacion',
          clickAction: () => {},
          isFolder: false
        },
        // Acciones de Documentacion
        {
          icon_type: 'ios-paper-outline',
          text: 'Documentos',
          isFolder: true,
          folderContent: [
            {
              icon_type: 'ios-list-outline',
              text: 'Editor Glosas',
              clickAction: () => {}
            },
            {
              icon_type: 'ios-list-outline',
              text: 'Editor Devoluciones',
              clickAction: () => {}
            },
            {
              icon_type: 'ios-list-outline',
              text: 'Editor Conciliaciones',
              clickAction: () => {}
            },
            {
              icon_type: 'ios-list-outline',
              text: 'Editor Administrativo',
              clickAction: () => {}
            }
          ]
        },
        // Requerimientos a Centros de Costos
        {
          icon_type: 'ios-bookmarks-outline',
          text: 'Requerimientos',
          clickAction: () => {},
          isFolder: false
        },
        // Ordenes de salida de Correspondencia
        {
          icon_type: 'ios-albums-outline',
          text: 'Ordenes',
          clickAction: () => {},
          isFolder: false
        },
        // Busqueda de Contenido en 360º
        {
          icon_type: 'ios-search',
          text: 'Busqueda 360º',
          clickAction: () => {},
          isFolder: false
        }
      ]
    }
  },
  methods: {
    clickeditem (toPath) {
      if (toPath === 'info') {
        this.$parent.aboutModal = true
      }
      this.$Message.info('error')
    }
  }
}
</script>
<style>
  .content{
    width: 100%;
    min-height: 100%;
    padding: 10px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: right;
    user-select: none;
    overflow-x: hidden;
  }
</style>