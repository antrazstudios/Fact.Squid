<template>
  <div style="content">
    <!-- Titulo del WebComponent -->
    <h2 style="text-align: center; margin-bottom: 20px;">Editor de Telefono de Contacto</h2>
    <!-- Editor de Telefono -->
    <Row>
      <Form ref="FormTelefono" :label-width="130">
        <FormItem prop="numero" label="Numero Telefonico" :required="true" :error="validations.numero.result">
          <Input type="text" v-model="editTelefono.numero"/>
        </FormItem>
        <FormItem label="Extension" :required="false">
          <Input type="text" v-model="editTelefono.ext"/>
        </FormItem>
      </Form>
    </Row>
    <!-- Botones de accion -->
    <Row type="flex" align="bottom" justify="center">
      <i-col>
        <i-button style="margin-top: 10px" type="error" @click="() => { this.$parent.$parent.$parent.showstelefonosEdit = false }">CANCELAR</i-button>
        <i-button style="margin-top: 10px" type="info" @click="editTelefono.id === 0 ? createTelefono() : updateTelefono()">{{ editTelefono.id === 0 ? 'CREAR' : 'ACTUALIZAR' }}</i-button>
      </i-col>
    </Row>
  </div>
</template>
<script>
  export default {
    name: 'telefonos-editor',
    props: [ 'editTelefono' ],
    data () {
      return {
        validations: {
          numero: {
            result: '',
            rules: [
              {
                prop: 'nombre',
                typevalidation: 'content-null',
                message: 'Este campo es obligatorio',
                args: ''
              }
            ]
          }
        }
      }
    },
    methods: {
      createTelefono () {
        const rules = require('../../libs/rules')
        rules.validateRulesFormField(this.$refs.FormTelefono, this.validations).then((rta) => {
          if (rta.resultValidation === true) {
            const storage = require('../../libs/storage')
            storage._database_createTelefono({
              tipo: this.editTelefono.tipo,
              numero: this.editTelefono.numero,
              ext: this.editTelefono.ext,
              idContacto: this.editTelefono.idcontacto
            }).then((rta) => {
              this.$Message.info(rta.message)
              this.$parent.$parent.$parent.getContactoInfo()
              this.$parent.$parent.$parent.showstelefonosEdit = false
            }).catch((err) => {
              this.$Message.error(err)
            })
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      updateTelefono () {
        const rules = require('../../libs/rules')
        rules.validateRulesFormField(this.$refs.FormTelefono, this.validations).then((rta) => {
          if (rta.resultValidation === true) {
            const storage = require('../../libs/storage')
            storage._database_updateTelefono({
              tipo: this.editTelefono.tipo,
              numero: this.editTelefono.numero,
              ext: this.editTelefono.ext,
              idTelefono: this.editTelefono.id
            }).then((rta) => {
              this.$Message.info(rta.message)
              this.$parent.$parent.$parent.getContactoInfo()
              this.$parent.$parent.$parent.showstelefonosEdit = false
            }).catch((err) => {
              this.$Message.error(err)
            })
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      }
    }
  }
</script>
<style>
  .content{
    position: relative;
    width: 100%;
    min-height: 100%;
    user-select: none;
    margin-top: 20px;
  }
</style>