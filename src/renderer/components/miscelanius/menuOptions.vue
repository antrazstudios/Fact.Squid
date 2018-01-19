<template>
  <div class="principal">
    <div class="middle">
      <div class="inner">
        <h1 style="margin-bottom: 20px;">{{titleMenu}}</h1>
        <Card class="buttons-options" v-for="item in optionsMenu" :key="item.key">
          <i-button type="text" style="width: 100%; height: 165px; margin: 0%;" @click="clickeditem('')">
            <Icon :type="item.icon_type" size="100" style="display:block"/>
            <h3>{{ item.text }}</h3>
          </i-button>
        </Card>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'menu-options',
  props: [ 'optionsMenu', 'titleMenu' ],
  data: () => ({
    options: [
      {
        icon_type: 'information-circled',
        text: 'Acerca de',
        toPath: 'info'
      },
      {
        icon_type: 'disc',
        text: 'Datos',
        toPath: null
      },
      {
        icon_type: 'gear-a',
        text: 'General',
        toPath: null
      },
      {
        icon_type: 'android-mail',
        text: 'Emails',
        toPath: null
      },
      {
        icon_type: 'locked',
        text: 'Seguridad',
        toPath: null
      },
      {
        icon_type: 'briefcase',
        text: 'Entidad',
        toPath: null
      },
      {
        icon_type: 'ios-medkit',
        text: 'Operadores',
        toPath: null
      },
      {
        icon_type: 'person-stalker',
        text: 'Oficinas',
        toPath: null
      },
      {
        icon_type: 'clipboard',
        text: 'Cargos',
        toPath: null
      },
      {
        icon_type: 'person',
        text: 'Usuarios',
        toPath: null
      },
      {
        icon_type: 'document-text',
        text: 'Formatos',
        toPath: null
      },
      {
        icon_type: 'map',
        text: 'Localizacion',
        toPath: null
      },
      {
        icon_type: 'cube',
        text: 'Soft. Externo',
        toPath: null
      }
    ]
  }),
  methods: {
    clickeditem (toPath) {
      if (toPath === 'info') {
        this.$parent.aboutModal = true
      }
    }
  }
}
</script>
<style lang="css" scoped>
  .content-buttons{
    margin: 2%;
  }
  .buttons-options{
    width: 120px;
    height: 120px;
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 5px;
    margin-bottom: 3px;
  }
</style>