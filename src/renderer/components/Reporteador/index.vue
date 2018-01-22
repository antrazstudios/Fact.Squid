<template>
  <div>
    <Row>
      <menu-selector :optionsMenu="options" titleMenu="Acciones del Reporteador" sizeMenu="normal"></menu-selector>
    </Row>
    <Row>
      <Card style="width: 100%; margin-top: 20px"></Card>
    </Row>
  </div>
</template>
<script>
import MenuSelector from '../miscelanius/menuOptions'
export default {
  name: 'reporteador-index',
  components: { MenuSelector },
  data () {
    return {
      options: [
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