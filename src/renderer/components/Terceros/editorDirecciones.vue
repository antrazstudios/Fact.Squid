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
    <Row type="flex">
      <i-col span="12">
        <Form ref="FormDireccion" :label-width="130">
          <!-- Tipo de Direccion -->
          <FormItem prop="tipoDireccion" label="Tipo de Direccion: " :required="true">
            <Select style="width: 470px">
              <Option v-for="item in tiposDirecciones" :value="item.id" :key="item.id">{{item.nombre}}</Option>
            </Select>
          </FormItem>
          <!-- Dependencia de la Direccion en caso que aplique -->
          <FormItem prop="dependenciaDireccion" label="Dependencia: " :required="true">
            <Input style="width: 470px"/>
          </FormItem>
          <!-- Direccion general -->
          <FormItem prop="detalleDireccion" label="Direccion: " :required="true">
            <Input style="width: 470px"/>
          </FormItem>
          <!-- Pais de la Direccion -->
          <FormItem prop="paisDireccion" label="Pais: " :required="true">
            <Select style="width: 470px">
              <Option v-for="item in paises" :value="item.id" :key="item.id">{{item.nombre}}</Option>
            </Select>
          </FormItem>
          <!-- Departamento de la Direccion -->
          <FormItem prop="departamentoDireccion" label="Departamento: " :required="true">
            <Select style="width: 470px">
              <Option v-for="item in departamentos" :value="item.id" :key="item.id">{{item.nombre}}</Option>
            </Select>
          </FormItem>
          <!-- Ciudades de la Direccion -->
          <FormItem prop="paisDireccion" label="Ciudad: " :required="true">
            <Select style="width: 470px">
              <Option v-for="item in ciudades" :value="item.id" :key="item.id">{{item.nombre}}</Option>
            </Select>
          </FormItem>
        </Form>
      </i-col>
      <i-col span="12">
        <Alert type="warning" show-icon>Geolocalizacion de tercero desactivada, el servicio de Geolocalizacion se encuentra desactivado directamente desde el servidor de AntrazStudios.</Alert>
      </i-col>
    </Row>
    <!-- Tablas de informacion adicional -->
    <Row type="flex" :gutter="16">
      <!-- Tabla de Horarios -->
      <i-col span="12">
        <i-table size="small" :columns="horariosColumns" :data="horarios" :stripe="false" :height="300" :loading="horariosIsLoading">
          <div slot="footer" style="text-align: center;">
            <i-button>Agregar Horario</i-button>
          </div>
          <div slot="loading" style="text-align: center;">
            <div class="modal-contenedor--img"></div>
            <label class="modal-contenedor--label">Cargando horarios</label>
          </div>
        </i-table>
      </i-col>
      <!-- Tabla de Contactos -->
      <i-col span="12">
        <i-table size="small" :columns="contactosColumns" :data="contactos" :stripe="false" :height="300" :loading="contactosIsLoading">
          <div slot="footer" style="text-align: center;">
            <i-button>Agregar Contacto</i-button>
          </div>
          <div slot="loading" style="text-align: center;">
            <div class="modal-contenedor--img"></div>
            <label class="modal-contenedor--label">Cargando contactos</label>
          </div>
        </i-table>
      </i-col>
    </Row>
  </div>
</template>

<script>
  export default {
    name: 'direcciones-editor',
    data () {
      return {
        id: 0,
        direccionEdit: '',
        tiposDirecciones: [],
        paises: [],
        departamentos: [],
        ciudades: [],
        horarios: [],
        horariosColumns: [],
        horariosIsLoading: true,
        contactos: [],
        contactosColumns: [],
        contactosIsLoading: true
      }
    },
    mounted () {
      this.getTiposDireccion()
    },
    methods: {
      getTiposDireccion () {
        let storage = require('../../libs/storage')
        storage._database_consultTiposDirecciones().then((rta) => {
          this.tiposDirecciones = rta
        }).catch((err) => {
          this.$Message.error(err)
        })
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
