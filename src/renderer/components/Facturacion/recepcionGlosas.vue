<template>
  <div class="content">
    <Row v-if="visibleChargeInit === false">
      <Form ref="FormGlosas" :label-width="130">

      </Form>
    </Row>
    <Row v-if="visibleChargeInit === true" type="flex" justify="space-around">
      <i-col span="4">
        <i-button type="dashed" @click="onPickFile">
          <div style="padding: 20px 0">
              <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
              <p>Seleccione la plantilla para importar los datos de la Glosa</p>
          </div>
        </i-button>
      </i-col>
      <i-col span="4">
        <i-button type="dashed" @click="downloadFile">
          <div style="padding: 20px 0">
              <Icon type="ios-cloud-download" size="52" style="color: #3399ff"></Icon>
              <p>Descargar plantilla de datos para glosa</p>
          </div>
        </i-button>
      </i-col>
    </Row>
  </div>
</template>
<script>
  import path from 'path'
  export default {
    name: 'glosas-recepcion',
    data () {
      return {
        visibleChargeInit: true
      }
    },
    methods: {
      downloadFile () {
        let fs = require('fs')
        var FileSaver = require('file-saver')
        fs.readFile(path.join(__static, '/FORMAT_GLOSA.xlsx'), (buffer) => {

        })
      }
    }
  }
</script>
<style>
  .content{
    width: 100%;
    /* position: relative; */
    padding: 10px;
    margin-bottom: 30px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: right;
    user-select: none;
    overflow-x: hidden;
  }
</style>