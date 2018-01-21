<template>
  <div>
    <h1>{{ message }}</h1>
    <menu-selector :optionsMenu="options" :titleMenu="'Acciones con Facturacion'" :sizeMenu="'normal'"></menu-selector>
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
        {
          icon_type: 'information-circled',
          text: 'Acerca de',
          isFolder: true,
          folderContent: [
            {
              icon_type: 'android-mail',
              text: 'Emails',
              toPath: null
            },
            {
              icon_type: 'locked',
              text: 'Seguridad',
              toPath: null
            }
          ]
        },
        {
          icon_type: 'disc',
          text: 'Datos',
          clickAction: () => {
            this.message = 'UN LICK'
          },
          isFolder: false
        },
        {
          icon_type: 'gear-a',
          text: 'General',
          toPath: null
        },
        {
          icon_type: 'android-mail',
          text: 'Emails',
          toPath: null,
          isFolder: false
        },
        {
          icon_type: 'locked',
          text: 'Seguridad',
          toPath: null,
          isFolder: false
        }
      ],
      message: 'prueba'
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