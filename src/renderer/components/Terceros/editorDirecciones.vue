<template>
  <div class="content">
    <h2 style="text-align: center;">Editor de Direcciones</h2>
  </div>
</template>

<script>
  export default {
    name: 'direcciones-editor',
    data () {
      return {
        direccionEdit: ''
      }
    }
  }
</script>

<style lang="css" scoped>
  .content{
    position: relative;
    width: 100%;
    min-height: 100%;
    user-select: none;
    margin-top: 20px;
  }
</style>
