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
          <Input type="text" v-model="contactoEdit.nombre"/>
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
            result: ''
          },
          cargo: {
            result: ''
          }
        }
      }
    },
    methods: {
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