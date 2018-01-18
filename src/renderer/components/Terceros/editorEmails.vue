<template>
  <div style="content">
    <!-- Titulo del WebComponent -->
    <h2 style="text-align: center; margin-bottom: 20px;">Editor de Telefono de Contacto</h2>
    <!-- Editor de Mails -->
    <Row>
      <Form ref="FormEmail" :label-width="130">
        <FormItem prop="email" label="Correo Electronico" :required="true" :error="validations.email.result">
          <Input v-model="editEmails.mail"/>
        </FormItem>
      </Form>
    </Row>
    <!-- Botones de accion -->
    <Row type="flex" align="bottom" justify="center">
      <i-col>
        <i-button style="margin-top: 10px" type="error" @click="() => { this.$parent.$parent.$parent.showstelefonosEdit = false }">CANCELAR</i-button>
        <i-button style="margin-top: 10px" type="info" @click="editEmails.id === 0 ? createEmail() : updateEmail()">{{ editEmails.id === 0 ? 'CREAR' : 'ACTUALIZAR' }}</i-button>
      </i-col>
    </Row>
  </div>
</template>
<script>
  export default {
    name: 'emails-editor',
    props: [ 'editEmails' ],
    data () {
      return {
        validations: {
          email: {
            result: '',
            rules: [
              {
                prop: 'email',
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
      createEmail () {
        const rules = require('../../libs/rules')
        rules.validateRulesFormField(this.$refs.FormEmail, this.validations).then((rta) => {
          if (rta.resultValidation === true) {
            const storage = require('../../libs/storage')
            storage._database_createEmail({
              mail: this.editEmails.mail,
              idcontacto: this.editEmails.idcontacto
            }).then((rta) => {
              this.$Message.info(rta.message)
              this.$parent.$parent.$parent.getContactoInfo()
              this.$parent.$parent.$parent.showsemailsEdit = false
            }).catch((err) => {
              this.$Message.error(err)
            })
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      updateEmail () {
        const rules = require('../../libs/rules')
        rules.validateRulesFormField(this.$refs.FormEmail, this.validations).then((rta) => {
          if (rta.resultValidation === true) {
            const storage = require('../../libs/storage')
            storage._database_updateEmail({
              mail: this.editEmails.mail,
              idmail: this.editEmails.id,
              isdefault: this.editEmails.isdefault
            }).then((rta) => {
              this.$Message.info(rta.message)
              this.$parent.$parent.$parent.getContactoInfo()
              this.$parent.$parent.$parent.showsemailsEdit = false
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