<template>
  <div class="content">
    <menu-selector :optionsMenu="options" :titleMenu="'Configuraciones del Sistema'" :sizeMenu="'large'"></menu-selector>
  </div>
</template>
<script>
import MenuSelector from '../miscelanius/menuOptions'
export default {
  name: 'settings_index',
  components: { MenuSelector },
  data () {
    return {
      options: [
        {
          icon_type: 'information-circled',
          text: 'Acerca de',
          clickAction: () => {
            this.$parent.aboutModal = true
          },
          isFolder: false
        },
        {
          icon_type: 'disc',
          text: 'Datos',
          isFolder: false
        },
        {
          icon_type: 'gear-a',
          text: 'General',
          isFolder: false
        },
        {
          icon_type: 'android-mail',
          text: 'Emails',
          isFolder: false
        },
        {
          icon_type: 'locked',
          text: 'Seguridad',
          isFolder: false
        },
        {
          icon_type: 'briefcase',
          text: 'Entidad',
          isFolder: false
        },
        {
          icon_type: 'ios-medkit',
          text: 'Operadores',
          isFolder: false
        },
        {
          icon_type: 'person-stalker',
          text: 'Oficinas',
          isFolder: false
        },
        {
          icon_type: 'clipboard',
          text: 'Cargos',
          isFolder: false
        },
        {
          icon_type: 'person',
          text: 'Usuarios',
          isFolder: false
        },
        {
          icon_type: 'document-text',
          text: 'Formatos',
          isFolder: false
        },
        {
          icon_type: 'map',
          text: 'Localizacion',
          isFolder: false
        },
        {
          icon_type: 'cube',
          text: 'Soft. Externo',
          isFolder: false
        }
      ]
    }
  }
}
</script>
<style lang="css" scoped>
  .content{
    overflow-x: hidden;
    position: relative;
    width: 100%;
    padding: 20px;
    min-height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: right;
    user-select: none;
  }
</style>
