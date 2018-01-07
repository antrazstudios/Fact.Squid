<template>
  <div class="content">
    <!-- Titulo del WebComponent -->
    <h2 style="text-align: center; margin-bottom: 20px;">Editor de Direcciones</h2>
    <!-- Contenido del WebComponent -->
    <!-- Editor de Horarios -->
    <Row type="flex">
      
    </Row>
    <!-- Editor de Contactos -->
    <Row type="flex">
      
    </Row>
    <!-- Editor de Direccion -->
    <Row type="flex" :gutter="16">
      <i-col span="12">
        <Form ref="FormDireccion" :label-width="130">
          <!-- Tipo de Direccion -->
          <FormItem prop="tipoDireccion" label="Tipo de Direccion: " :required="true">
            <Select v-model="selectIdTipoDireccion" v-on:on-change="updateTipoDireccion()">
              <Option v-for="item in tiposDirecciones" :value="item.id" :key="item.id">{{item.nombre}}</Option>
            </Select>
          </FormItem>
          <!-- Dependencia de la Direccion en caso que aplique -->
          <FormItem v-if="selectTipoDireccion.reqdependencia === 1" prop="dependenciaDireccion" label="Dependencia: " :required="true">
            <Input type="text" v-model="direccionEdit.dependencia"/>
          </FormItem>
          <!-- Componente de Ciudad-Departamento-Ciudad -->
          <edit-direccion-component ref="editordireccion" :direccionTags="direccionEdit.direccionjson" :selections="{ pais: this.direccionEdit.ciudad.departamento.pais.id, departamento: this.direccionEdit.ciudad.departamento.id, ciudad: this.direccionEdit.ciudad.id }"></edit-direccion-component>
        </Form>
      </i-col>
      <i-col span="12">
        <Alert type="warning" show-icon>Geolocalizacion de tercero desactivada, el servicio de Geolocalizacion se encuentra desactivado directamente desde el servidor de AntrazStudios.</Alert>
      </i-col>
    </Row>
    <!-- Tablas de informacion adicional -->
    <Row v-if="direccionEdit.id !== 0" type="flex" :gutter="16">
      <!-- Tabla de Contactos -->
      <i-col span="12">
        <i-table size="small" :columns="contactosColumns" :data="contactos" :stripe="false" :height="240" :loading="contactosIsLoading">
          <div slot="footer" style="text-align: center;">
            <i-button>Agregar Contacto</i-button>
          </div>
          <div slot="loading" style="text-align: center;">
            <div class="modal-contenedor--img"></div>
            <label class="modal-contenedor--label">Cargando contactos</label>
          </div>
        </i-table>
      </i-col>
      <!-- Tabla de Horarios -->
      <i-col span="12">
        <i-table v-if="selectTipoDireccion.reqhorario === 1" size="small" :columns="horariosColumns" :data="horarios" :stripe="false" :height="240" :loading="horariosIsLoading">
          <div slot="footer" style="text-align: center;">
            <i-button>Agregar Horario</i-button>
          </div>
          <div slot="loading" style="text-align: center;">
            <div class="modal-contenedor--img"></div>
            <label class="modal-contenedor--label">Cargando horarios</label>
          </div>
        </i-table>
        <Alert v-if="selectTipoDireccion.reqhorario !== 1" type="warning" show-icon>Este tipo de Direccion no require el uso de horarios para el envio de documentacion</Alert>
      </i-col>
    </Row>
    <!-- Botones de accion -->
    <Row type="flex" align="bottom" justify="center">
      <i-col>
        <i-button style="margin-top: 10px" type="error" @click="() => { $router.go(-1) }">CANCELAR</i-button>
        <i-button style="margin-top: 10px" type="info" @click="direccionEdit.id === 0 ? createDireccion() : updateDireccion()">{{ direccionEdit.id === 0 ? 'CREAR' : 'ACTUALIZAR' }}</i-button>
      </i-col>
    </Row>
  </div>
</template>

<script>
  import EditDireccionComponent from '../miscelanius/editDireccionComponent'
  export default {
    name: 'direcciones-editor',
    components: { EditDireccionComponent },
    props: ['direccionEdit'],
    data () {
      return {
        id: 0,
        selectIdTipoDireccion: '',
        selectTipoDireccion: '',
        tiposDirecciones: [],
        horarios: [],
        horariosColumns: [],
        horariosIsLoading: true,
        contactos: [],
        contactosColumns: [],
        contactosIsLoading: true
      }
    },
    mounted () {
      console.log(this.direccionEdit.dependencia)
      if (this.direccionEdit.id !== 0) {
        this.getTiposDireccion(() => {
          this.selectIdTipoDireccion = this.direccionEdit.tipodireccion.id
        })
      } else {
        this.getTiposDireccion()
      }
    },
    methods: {
      getTiposDireccion (_callback = null) {
        let storage = require('../../libs/storage')
        storage._database_consultTiposDirecciones().then((rta) => {
          this.tiposDirecciones = rta
          if (_callback !== null) {
            _callback()
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      updateTipoDireccion () {
        // buscar id seleccionada en la lista de id
        for (let i = 0; i < this.tiposDirecciones.length; i++) {
          const tipoDireccion = this.tiposDirecciones[i]
          if (tipoDireccion.id === this.selectIdTipoDireccion) {
            this.selectTipoDireccion = tipoDireccion
          }
        }
      },
      createDireccion () {
        console.log('prueba', this.$refs.editordireccion._component_getciudad())
      },
      updateDireccion () {}
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
  .modal-contenedor--img{
    display: block;
    margin: auto;
    width: 30px;
    height: 30px;
    /* background-image: url("~@/assets/images/ajax-loader.gif"); */
    background-image: url("~@/assets/images/loading.gif");
    background-size: contain;
  }
  .modal-contenedor--label{
    display: block;
    margin: 4%;
    text-align: center;
    color: rgba(41, 41, 41, 0.6);
  }
</style>
