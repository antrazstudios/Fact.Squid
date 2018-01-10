<template>
  <div class="content">
    <!-- Titulo del WebComponent -->
    <h2 style="text-align: center; margin-bottom: 20px;">Editor de Horarios</h2>
    <!-- Editor de Horarios -->
    <Row>
      <Form ref="FormHorario" :label-width="130">
        <FormItem prop="diainicio" label="Dia de inicio: " :required="true" :error="validations.diainicio.result">
          <InputNumber :min="0" :max="30" v-model="horarioEdit.diainicio"/>
        </FormItem>
        <FormItem prop="diafin" label="Dia final: " :required="true" :error="validations.diafin.result">
          <InputNumber :min="horarioEdit.diainicio + 1" :max="30" v-model="horarioEdit.diafinal"/>
        </FormItem>
        <FormItem prop="horainicio" label="Hora de inicio: " :required="true" :error="validations.horainicio.result">
          <TimePicker format="HH:mm" v-model="horarioEdit.horainicio"></TimePicker>
        </FormItem>
        <FormItem prop="horafin" label="Hora final: " :required="true" :error="validations.horafin.result">
          <TimePicker format="HH:mm" v-model="horarioEdit.horafinal"></TimePicker>
        </FormItem>
      </Form>
    </Row>
    <!-- Botones de accion -->
    <Row type="flex" align="bottom" justify="center">
      <i-col>
        <i-button style="margin-top: 10px" type="error" @click="() => { this.$parent.$parent.editHorariosShow = false }">CANCELAR</i-button>
        <i-button style="margin-top: 10px" type="info" @click="horarioEdit.id === 0 ? createHorario() : updateHorario()">{{ horarioEdit.id === 0 ? 'CREAR' : 'ACTUALIZAR' }}</i-button>
      </i-col>
    </Row>
  </div>
</template>
<script>
  export default {
    name: 'horarios-editor',
    props: [ 'horarioEdit' ],
    data () {
      return {
        validations: {
          diainicio: {
            result: '',
            rules: [
              {
                prop: 'diainicio',
                typevalidation: 'content-null',
                message: 'Este campo es obligatorio no puede estar en blanco',
                args: ''
              }
            ]
          },
          diafin: {
            result: '',
            rules: [
              {
                prop: 'diafin',
                typevalidation: 'content-null',
                message: 'Este campo es obligatorio no puede estar en blanco',
                args: ''
              }
            ]
          },
          horainicio: {
            result: '',
            rules: [
              {
                prop: 'horainicio',
                typevalidation: 'content-null',
                message: 'Este campo es obligatorio no puede estar en blanco',
                args: ''
              }
            ]
          },
          horafin: {
            result: '',
            rules: [
              {
                prop: 'horafin',
                typevalidation: 'content-null',
                message: 'Este campo es obligatorio no puede estar en blanco',
                args: ''
              }
            ]
          }
        }
      }
    },
    methods: {
      createHorario () {
        const rules = require('../../libs/rules')
        rules.validateRulesFormField(this.$refs.FormHorario, this.validations).then((rta) => {
          if (rta.resultValidation === true) {
            const storage = require('../../libs/storage')
            storage._database_createHorario({
              idDireccion: this.horarioEdit.iddireccion,
              diainicio: this.horarioEdit.diainicio,
              diafinal: this.horarioEdit.diafinal,
              horainicio: this.horarioEdit.horainicio,
              horafinal: this.horarioEdit.horafinal
            }).then((rta) => {
              this.$Message.info(rta.message)
              this.$parent.$parent.getDireccionInfo()
              this.$parent.$parent.editHorariosShow = false
            }).catch((err) => {
              this.$Message.error(err)
            })
          } else {
            this.$Message.error('Aun hay campos pendientes por diligenciar')
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      updateHorario () {
        const rules = require('../../libs/rules')
        rules.validateRulesFormField(this.$refs.FormHorario, this.validations).then((rta) => {
          if (rta.resultValidation === true) {
            const storage = require('../../libs/storage')
            storage._database_updateHorario({
              idHorario: this.horarioEdit.id,
              diainicio: this.horarioEdit.diainicio,
              diafinal: this.horarioEdit.diafinal,
              horainicio: this.horarioEdit.horainicio,
              horafinal: this.horarioEdit.horafinal
            }).then((rta) => {
              this.$Message.info(rta.message)
              this.$parent.$parent.getDireccionInfo()
              this.$parent.$parent.editHorariosShow = false
            }).catch((err) => {
              this.$Message.error(err)
            })
          } else {
            this.$Message.error('Aun hay campos pendientes por diligenciar')
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