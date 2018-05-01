<template>
  <div class="expand-row" :style="{ backgroundColor: row.level === 'DEBUG' ? '#faefff' : row.level === 'INFO' ? '#e8f6ff' : row.level === 'WARN' ? '#fff7eb' : row.level === 'ERROR' ? '#ffefee' : row.level === 'FATAL' ? '#fdebe8' : '#f0fffc' }">
    <Row :gutter="10">
      <i-col span="12">
        <label class="object-margin" style="margin-bottom: 10px;">Descripcion:</label>
        <Input class="object-margin" v-model="row.description" type="textarea" :rows="5"/>
        <label class="object-margin" style="margin-bottom: 10px;">Fecha: {{row.datetime.toLocaleDateString() + ' ' +row.datetime.toLocaleTimeString()}}</label>
      </i-col>
      <i-col span="10">
        <img v-if="row.capturePath !== 'NOT'" :src="renderImage">
      </i-col>
    </Row>
  </div>
</template>
<script>
  export default {
    name: 'logDetails',
    props: {
      row: Object
    },
    data () {
      return {
        renderImage: null
      }
    },
    mounted () {
      this.renderImageF(this.row.capturePath, (base64Render) => {
        this.renderImage = base64Render
      })
    },
    methods: {
      /**
       * Convierte una ubicacion, en una imagen renderiada
       */
      renderImageF (location, callback) {
        if (location !== 'NOT') {
          const fs = require('fs')
          const path = require('path')
          fs.readFile(location, (err, data) => {
            if (err) return null
            let extensionName = path.extname(location)
            let base64Image = Buffer.from(data, 'binary').toString('base64') // new Buffer(data, 'binary').toString('base64')
            let imgSrcString = `data:image/${extensionName.split('.').pop()};base64,${base64Image}`
            callback(imgSrcString)
          })
        }
      }
    }
  }
</script>
<style scoped>
  .expand-row{
    padding: 20px;
  }
  .object-margin{
    margin: 5px;
  }
  img {
    width: 100%;
    margin: 5px;
  }
</style>