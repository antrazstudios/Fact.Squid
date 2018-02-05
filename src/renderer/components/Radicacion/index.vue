<template>
  <div>
    <Row>
      <menu-selector :optionsMenu="options" titleMenu="Acciones para Radicacion" sizeMenu="normal"></menu-selector>
    </Row>
    <Row>
      <Card style="width: 100%; margin-top: 20px"></Card>
    </Row>
  </div>
</template>
<script>
import MenuSelector from '../miscelanius/menuOptions'
export default {
  name: 'radicacion-index',
  components: { MenuSelector },
  data () {
    return {
      options: [
        // Movimiento de facturacion
        {
          icon_type: 'ios-compose-outline',
          text: 'Movimientos facturacion',
          clickAction: () => {},
          isFolder: false,
          icon_style: 'icon',
          button_style: 'text'
        },
        // Acciones de Documentacion
        {
          icon_type: 'ios-paper-outline',
          text: 'Documentos',
          isFolder: true,
          icon_style: 'icon',
          button_style: 'text',
          folderContent: [
            {
              icon_type: 'ios-list-outline',
              text: 'Editor No Aceptaciones',
              clickAction: () => {},
              icon_style: 'icon',
              button_style: 'text'
            },
            {
              icon_type: 'ios-list-outline',
              text: 'Editor Re-envio',
              clickAction: () => {},
              icon_style: 'icon',
              button_style: 'text'
            },
            {
              icon_type: 'ios-list-outline',
              text: 'Editor Recorrido',
              clickAction: () => {},
              icon_style: 'icon',
              button_style: 'text'
            },
            {
              icon_type: 'ios-list-outline',
              text: 'Editor Administrativo',
              clickAction: () => {},
              icon_style: 'icon',
              button_style: 'text'
            }
          ]
        },
        // Acciones de Correspondencia por parte de radicacion
        {
          icon_type: 'ios-box-outline',
          text: 'Correspondencia',
          isFolder: true,
          icon_style: 'icon',
          button_style: 'text',
          folderContent: [
            {
              icon_type: 'ios-list-outline',
              text: 'Confirmar documentos',
              clickAction: () => {},
              icon_style: 'icon',
              button_style: 'text'
            },
            {
              icon_type: 'ios-paperplane-outline',
              text: 'Trazabilidad documento',
              clickAction: () => {},
              icon_style: 'icon',
              button_style: 'text'
            },
            {
              icon_type: 'ios-bookmarks-outline',
              text: 'Cargar desde Sipost',
              clickAction: () => {},
              icon_style: 'icon',
              button_style: 'text'
            },
            {
              icon_type: 'ios-book-outline',
              text: 'Planilla de Sipost',
              clickAction: () => {},
              icon_style: 'icon',
              button_style: 'text'
            }
          ]
        },
        // Cargas de radicacion
        {
          icon_type: 'ios-pie-outline',
          text: 'Cargas masivas',
          isFolder: true,
          icon_style: 'icon',
          button_style: 'text',
          folderContent: [
            {
              icon_type: 'ios-pie-outline',
              text: 'Carga de rad. en DGH',
              clickAction: () => {},
              icon_style: 'icon',
              button_style: 'text'
            }
          ]
        },
        // Busqueda de Contenido en 360º
        {
          icon_type: 'ios-search',
          text: 'Trazabilidad documento',
          clickAction: () => {},
          isFolder: false,
          icon_style: 'icon',
          button_style: 'text'
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