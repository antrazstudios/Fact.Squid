<template>
  <div>
    <Form v-if="configuracion.direccion.use === true" ref="FormVisorText" :label-width="configuracion.labelWidth">
      <FormItem label="Direccion: " :required="configuracion.direccion.validation" :error="direccionError">
        <Input v-model="direccionText" :readonly="true" type="text" v-bind:style="{ width: configuracion.objectsWidth, textTransform: 'uppercase' }" placeholder="Aqui veras la direccion final" @on-enter="() => { isEdition = !isEdition }">
          <Button slot="append" :icon="isEdition === false ? 'edit' : 'checkmark-round'" @click="() => { isEdition = !isEdition }"></Button>
        </Input>
      </FormItem>
    </Form>
    <Card v-if="isEdition === true" style="margin-bottom: 20px">
      <p slot="title">Editor de Direccion</p>
      <Form>
        <!-- Tag interactivo de direcciones -->
        <FormItem label="Tags Seleccionados: ">
          <label style="color: red" v-if="direccionTags.length === 0">No ha seleccionado ningun Tag de Direccion</label>
          <Tag v-if="direccionTags.length > 0" v-for="item in direccionTags" :key="item" closable @on-close="deleteTag(item)">{{ item.content }}</Tag>
        </FormItem>
        <!-- Insercion de texto o numero adicional -->
        <FormItem v-if="insertAdditional !== ''">
          <Input v-if="insertAdditional === 'text'" v-model="textAdditional" style="text-transform:uppercase;">
            <Button slot="append" icon="checkmark-round" @click="() => { createTag('TEXT', textAdditional, textAdditional), insertAdditional = '' }"></Button>
            <Button slot="append" icon="close" @click="() => { insertAdditional = '' }"></Button>
          </Input>
          <Input type="number" style="text-transform:uppercase; " min="0" step="1" v-if="insertAdditional === 'number'" v-model="numAdditional">
            <Button slot="append" icon="checkmark-round" @click="() => { createTag('NUMBER', numAdditional, numAdditional), insertAdditional = ''}"></Button>
            <Button slot="append" icon="close" @click="() => { insertAdditional = '' }"></Button>
          </Input>
        </FormItem>
        <!-- Botones de Tag -->
        <FormItem>
          <Row :gutter="16">
            <i-col span="6">
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('CALLE', 'CALLE', 'CALLE')">CALLE</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('CARRERA', 'CRA.', 'CRA.')">CARRERA</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('AVENIDA', 'AV.', 'AV.')">AVENIDA</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('BOULEVARD', 'BOULEVARD', 'BOULEVARD')">BOULEVARD</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('TRANSVERSAL', 'TR.', 'TR.')">TRANSVERSAL</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('DIAGONAL', 'DG.', 'DG.')">DIAGONAL</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('CIRCUNVALAR', 'CIRCUNVALAR', 'CIRCUNVALAR')">CIRCUNVALAR</Button>
            </i-col>
            <i-col span="6">
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('ALMACEN', 'ALMACEN', 'ALMACEN')">ALMACEN</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('APARTAMENTO', 'APTO.', 'APTO.')">APARTAMENTO</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('CASA', 'CASA', 'CASA')">CASA</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('BODEGA', 'BODEGA', 'BODEGA')">BODEGA</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('BLOQUE', 'BLOQUE', 'BLOQUE')">BLOQUE</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('TORRE', 'T.', 'TORRE')">TORRE</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('ESQUINA', 'ESQUINA', 'ESQUINA')">ESQUINA</Button>
            </i-col>
            <i-col span="6">
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('EDIFICIO', 'EDIF.', 'EDIF.')">EDIFICIO</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('MANZANA', 'MANZANA', 'MANZANA')">MANZANA</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('OFICINA', 'OF.', 'OF.')">OFICINA</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('PISO', 'PISO', 'PISO')">PISO</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('SOTANO', 'SOTANO', 'SOTANO')">SOTANO</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('PASEO', 'PASEO', 'PASEO')">PASEO</Button>
            </i-col>
            <i-col span="6">
              <!-- <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('ESPACIO', '-ESPACIO-', ' ')">( ) ESPACIO</Button> -->
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('NUMERO', '#', 'NO.')">(#) NUMERO</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="createTag('SEPARADOR', '-', '-')">(-) SEPARADOR</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="() => { insertAdditional = 'text', textAdditional = '' }">INSERTAR TEXTO</Button>
              <Button style="width: 100%" :disabled="insertAdditional !== '' ? true : false" @click="() => { insertAdditional = 'number', numAdditional = '' }">INSERTAR NUM</Button>
            </i-col>
          </Row>
        </FormItem>
      </Form>
    </Card>
    <Form v-if="configuracion.ciudad.use === true" :label-width="configuracion.labelWidth">
      <FormItem prop="pais" label="Pais: " :required="configuracion.ciudad.validation" :error="paisesError">
        <Select v-bind:style="{ width: configuracion.objectsWidth }" v-model="selectPais" v-on:on-change="getDeparmentos()" :loading="chargePais">
          <Option v-for="item in paises" :value="item.id" :key="item.id">{{item.nombre}}</Option>
        </Select>
      </FormItem>
      <FormItem prop="departamento" label="Departamento: " :required="configuracion.ciudad.validation" :error="departamentosError">
        <Select v-bind:style="{ width: configuracion.objectsWidth }" v-model="selectDepartamento" v-on:on-change="getCiudades()" filterable>
          <Option v-for="item in departamentos" :value="item.id" :key="item.id">{{item.nombre}}</Option>
        </Select>
      </FormItem>
      <FormItem prop="pais" label="Pais: " :required="configuracion.ciudad.validation" :error="ciudadesError">
        <Select v-bind:style="{ width: configuracion.objectsWidth }" v-model="selectCiudad" filterable>
          <Option v-for="item in ciudades" :value="item.id" :key="item.id">{{item.nombre}}</Option>
        </Select>
      </FormItem>
    </Form>
  </div>
</template>

<script>
  export default {
    name: 'getciudad',
    props: ['direccionTags', 'selections'],
    data () {
      return {
        configuracion: {
          direccion: {
            validation: true,
            use: true
          },
          ciudad: {
            validation: true,
            use: true
          },
          objectsWidth: '100%',
          labelWidth: 130
        },
        direccionText: '',
        textAdditional: '',
        numAdditional: '',
        insertAdditional: '',
        isEdition: false,
        direccionError: '',
        chargePais: false,
        selectPais: 1,
        paises: [],
        paisesError: '',
        chargeDepartamento: false,
        selectDepartamento: '',
        departamentos: [],
        departamentosError: '',
        chargeCiudad: false,
        selectCiudad: '',
        ciudades: [],
        ciudadesError: ''
      }
    },
    mounted () {
      console.log(this.selections)
      this.updateDireccionText()
      if (this.selections !== null) {
        this.selectPais = this.selections.pais
        this.getPaises(() => {
          this.getDeparmentos(() => {
            this.selectDepartamento = this.selections.departamento
            this.getCiudades(() => {
              this.selectCiudad = this.selections.ciudad
            })
          })
        })
      } else {
        this.getPaises()
      }
    },
    methods: {
      createTag (caseTag, caseContent, caseRender) {
        this.direccionTags.push({
          id: this.direccionTags.length + 1,
          case: caseTag,
          content: caseContent,
          render: caseRender
        })
        this.updateDireccionText()
      },
      deleteTag (item) {
        const index = this.direccionTags.indexOf(item)
        this.direccionTags.splice(index, 1)
        this.updateDireccionText()
      },
      updateDireccionText () {
        this.direccionText = ''
        for (let i = 0; i < this.direccionTags.length; i++) {
          const element = this.direccionTags[i]
          if (this.direccionText === '') {
            this.direccionText = this.direccionText + element.render
          } else if (this.direccionText !== '') {
            this.direccionText = this.direccionText + ' ' + element.render
          }
        }
      },
      getPaises (__callback = null) {
        this.chargePais = true
        let storage = require('../../libs/storage')
        storage._database_consultPaises().then((rta) => {
          this.paises = rta
          this.chargePais = false
          if (__callback !== null) {
            __callback()
          }
        }).catch((err) => {
          this.$Message.error({
            content: err,
            duration: 10
          })
          console.log(err)
          this.chargePais = false
        })
      },
      getDeparmentos (__callback = null) {
        if (this.selectPais !== '') {
          this.selectDepartamento = ''
          this.chargeDepartamento = true
          let storage = require('../../libs/storage')
          storage._database_consultDepartamentos(this.selectPais).then((rta) => {
            this.departamentos = rta
            this.chargeDepartamento = false
            if (__callback !== null) {
              __callback()
            }
          }).catch((err) => {
            this.$Message.error({
              content: err,
              duration: 10
            })
            console.log(err)
            this.chargeDepartamento = false
          })
        }
      },
      getCiudades (__callback = null) {
        if (this.selectDepartamento !== '') {
          this.selectCiudad = ''
          this.chargeCiudad = true
          let storage = require('../../libs/storage')
          storage._database_consultCiudades(this.selectDepartamento).then((rta) => {
            this.ciudades = rta
            this.chargeCiudad = false
            if (__callback !== null) {
              __callback()
            }
          }).catch((err) => {
            this.$Message.error({
              content: err,
              duration: 10
            })
            console.log(err)
            this.chargeCiudad = false
          })
        }
      },
      _component_validate () {
        let rules = require('../../libs/rules')
        let resultvalidation = true
        if (this.configuracion.direccion.validation === true) {
          if (rules._rules_contentNull(this.direccionText) === false) {
            resultvalidation = false
            this.direccionError = 'Este campo es requerido'
          } else {
            this.direccionError = ''
          }
        }
        if (this.configuracion.ciudad.validation === true) {
          if (rules._rules_contentNull(this.selectPais) === false) {
            resultvalidation = false
            this.paisesError = 'Debe seleccionar al menos un pais'
          } else {
            this.paisesError = ''
          }
          if (rules._rules_contentNull(this.selectDepartamento) === false) {
            resultvalidation = false
            this.departamentosError = 'Debe seleccionar al menos un departamento'
          } else {
            this.departamentosError = ''
          }
          if (rules._rules_contentNull(this.selectCiudad) === false) {
            resultvalidation = false
            this.ciudadesError = 'Debe seleccionar al menos una ciudad'
          } else {
            this.ciudadesError = ''
          }
        }
        return resultvalidation
      },
      _component_getciudad () {
        // la respuesta a enviar
        let rta
        // instanciacion del procesador de objetos
        const objects = require('../../libs/objects')
        // verificamos la lista de ciudad haber cual esta seleccionada
        for (let i = 0; i < this.ciudades.length; i++) {
          const ciudadList = this.ciudades[i]
          if (ciudadList.id === this.selectCiudad) {
            rta = objects.createCiudad(ciudadList.id, ciudadList.nombre, '')
          }
        }
        // verificamos la lista de departamentos haber cual esta seleccionado
        for (let i = 0; i < this.departamentos.length; i++) {
          const departamentoList = this.departamentos[i]
          if (departamentoList.id === this.selectDepartamento) {
            rta.departamento = objects.createDepartamento(departamentoList.id, departamentoList.nombre, '')
          }
        }
        // verificamos la lista de paises haber cual esta seleccionado
        for (let i = 0; i < this.paises.length; i++) {
          const paisList = this.paises[i]
          if (paisList.id === this.selectPais) {
            rta.departamento.pais = objects.createPais(paisList.id, paisList.nombre)
          }
        }
        // retornamos la respuesta
        return rta
      },
      _component_getdireccionText () {
        return this.direccionText
      },
      _component_getdireccionTags () {
        return this.direccionTags
      }
    }
  }
</script>

<style lang="css" scoped>
  
</style>