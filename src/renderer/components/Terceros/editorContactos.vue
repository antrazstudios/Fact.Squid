<template>
  <div class="content">
    <!-- Titulo del WebComponent -->
    <h2 style="text-align: center; margin-bottom: 20px;">Editor de Contactos</h2>
    <!-- Editor de Contactos -->
    <Row>
      <Form ref="FormContacto" :label-width="130">
        <FormItem prop="nombre" label="Nombre Contacto: " :required="true" :error="validations.nombre.result">
          <Input type="text" v-model="contactoEdit.nombre"/>
        </FormItem>
        <FormItem prop="cargo" label="Cargo: " :required="true" :error="validations.cargo.result">
          <Input type="text" v-model="contactoEdit.cargo"/>
        </FormItem>
      </Form>
    </Row>
    <!-- Tabla de Telefonos -->
    <!-- Tabla de emails -->
    <!-- Botones de accion -->
    <Row type="flex" align="bottom" justify="center">
      <i-col>
        <i-button style="margin-top: 10px" type="error" @click="() => { this.$parent.$parent.editContactosShow = false }">CANCELAR</i-button>
        <i-button style="margin-top: 10px" type="info" @click="contactoEdit.id === 0 ? createContacto() : updateContacto()">{{ contactoEdit.id === 0 ? 'CREAR' : 'ACTUALIZAR' }}</i-button>
      </i-col>
    </Row>
  </div>
</template>
<script>
  export default {
    name: 'contactos-editor',
    props: [ 'contactoEdit' ],
    data () {
      return {
        validations: {
          nombre: {
            result: '',
            rules: [
              {
                prop: 'nombre',
                typevalidation: 'content-null',
                message: 'Este campo es obligatorio',
                args: ''
              }
            ]
          },
          cargo: {
            result: '',
            rules: [
              {
                prop: 'cargo',
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
      createContacto () {
        const rules = require('../../libs/rules')
        rules.validateRulesFormField(this.$refs.FormContacto, this.validations).then((rta) => {
          if (rta.resultValidation === true) {
            const storage = require('../../libs/storage')
            storage._database_createContacto({
              idDireccion: this.contactoEdit.iddireccion,
              nombre: this.contactoEdit.nombre,
              cargo: this.contactoEdit.cargo
            }).then((rta) => {
              this.$Message.info(rta.message)
              this.$parent.$parent.getDireccionInfo()
              this.$parent.$parent.editContactosShow = false
            }).catch((err) => {
              this.$Message.error(err)
            })
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      updateContacto () {
        const rules = require('../../libs/rules')
        rules.validateRulesFormField(this.$refs.FormContacto, this.validations).then((rta) => {
          if (rta.resultValidation === true) {
            const storage = require('../../libs/storage')
            storage._database_updateContacto({
              idContacto: this.contactoEdit.id,
              nombre: this.contactoEdit.nombre,
              cargo: this.contactoEdit.cargo
            }).then((rta) => {
              this.$Message.info(rta.message)
              this.$parent.$parent.getDireccionInfo()
              this.$parent.$parent.editContactosShow = false
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