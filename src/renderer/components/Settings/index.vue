<template>
  <div class="principal">
    <div class="middle">
      <div class="inner">
        <Card>
          <h1 slot="title" style="display: inline-block">Configuracion del sistema</h1>
          <div class="content-buttons">
            <i-button v-for="option in options" :key="option.key" class="buttons-options" type="text" @click="clickeditem(option.toPath)">
              <Icon :type="option.icon_type" size="60"></Icon>
              <h3>{{option.text}}</h3>
            </i-button>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'settings_index',
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
  .principal{
    display: table;
    position: absolute;
    height: 100%;
    width: 100%;
  }
  .middle{
    display: table-cell;
    vertical-align: middle;
  }
  .inner{
    margin-left: 10%;
    margin-right: 10%;
    text-align: center;
  }
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
