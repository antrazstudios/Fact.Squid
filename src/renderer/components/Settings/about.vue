<template>
  <div class="content">
    <Row v-if="source !== ''">
      <i-col span="5">
        <div class="menu">
          <Menu theme="light" :active-name="activeName" style="z-index: 0">
            <MenuGroup v-for="group in listContents" :key="group.key" :title="group.title">
              <MenuItem style="padding: 0" v-for="item in group.contenidos" :key="item.key" :name="item.id">
                <i-button style="width: 100%; text-align: left" type="text" @click="loadMdWithItem(item)">{{item.title}}</i-button>
              </MenuItem>
            </MenuGroup>
          </Menu>
        </div>
      </i-col>
      <i-col span="19">
        <Card class="markdown-viewer" dis-hover>
          <vue-markdown style="height: 100%; margin: 10px;" :source="source"></vue-markdown>
        </Card>
      </i-col>
    </Row>
    <Row v-if="source === ''">
      <div style="height: 100%; ">
        <h1 style="margin-top: 10px; margin-bottom: 5px;">No es posible encontrar el contenido de ayuda de BillsDelivery</h1>
        <p style="center; margin-bottom: 15px">Para poder utilizar el contenido de ayuda de BillsDelivery es necesario descargarlo, solo es cuestion de hacer click en el boton de descargar y esperar un poco</p>
        <i-progress :percent="progressDownload" status="active"></i-progress>
        <i-button @click="downloadDocumentation()">REINTENTAR</i-button>
      </div>
    </Row>
    <BackTop>
      <div class="top">
        <Icon type="arrow-up-b"></Icon>
      </div>
    </BackTop>
  </div>
</template>
<script>
  import VueMarkdown from 'vue-markdown'
  export default {
    name: 'settings-about',
    data: () => ({
      progressDownload: 0,
      source: '',
      activeName: '1',
      listContents: [
        {
          type: 'group',
          title: 'Informacion basica',
          contenidos: [
            {
              id: '1',
              type: 'item',
              title: 'Acerca de BillsDelivery',
              nameFile: 'README.md'
            },
            {
              id: '2',
              type: 'item',
              title: 'Actualizaciones',
              nameFile: 'updates.md'
            }
          ]
        }
      ]
    }),
    components: {
      VueMarkdown
    },
    mounted () {
      // Verificacion de la existencia del contenido de documentacion
      require('../../libs/settings.js').getDocumentsExist((rta) => {
        if (rta === false) {
          this.downloadDocumentation()
        } else {
          this.loadMdWithId(this.$route.params.id)
        }
      })
    },
    methods: {
      loadMdWithItem (item) {
        if (item !== undefined) {
          let modalPath = require('path').join(require('../../libs/settings.js').getDocumentsPath(), 'documentation/', item.nameFile)
          this.source = require('fs').readFileSync(modalPath, 'utf8')
        }
      },
      loadMdWithId (id) {
        for (let i = 0; i < this.listContents.length; i++) {
          for (let j = 0; j < this.listContents[i].contenidos.length; j++) {
            if (this.listContents[i].contenidos[j].id === id) {
              this.loadMdWithItem(this.listContents[i].contenidos[j])
              this.activeName = id
            }
          }
        }
      },
      downloadDocumentation () {
        const pathDownload = require('../../libs/settings.js').getDocumentsPath()
        this.$parent.downloadFunction({
          remoteuri: 'http://antrazstudios.com/billsdelivery/assetsdoc/documentation.zip',
          localuri: pathDownload + 'documentation.zip',
          onProgress: (getSize, totalSize) => {
            this.progressDownload = (getSize * 100) / totalSize
            this.$forceUpdate()
          }
        }).then(() => {
          this.$parent.unzipFunction({ uri: pathDownload + 'documentation.zip', path: pathDownload }).then((content) => {
            this.$Message.success({
              content: 'Se ha descargado e instalado los paquetes de documentacion',
              duration: 8
            })
            this.loadMdWithId(this.$route.params.id)
          }).catch((err) => {
            this.$Message.error({
              content: err.toString(),
              duration: 8
            })
          })
        }).catch((err) => {
          this.$Message.error({
            content: err.toString(),
            duration: 8
          })
        })
      }
    }
  }
</script>
<style lang="css" scoped>
  .content{
    width: 100%;
    height: 100% !important;
    padding: 10px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: right;
    user-select: none;
  }
  .menu{
    background-color: white;
    height: 100% !important;
    bottom: 10px;
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 10px;
    padding-bottom: 10px;
    border: 1px solid #e6e4e4;
    border-radius: 3px;
    margin-right: 35px;
    z-index: 0;
  }
  .markdown-viewer{
    margin-left: 20px;
    margin-right: 20px;
    margin-bottom: 20px;
    height: 100% !important;
    background-color: white;
  }
  .top{
    padding: 1px;
    background: rgba(84, 84, 84, 0.7);
    color: #fff;
    text-align: center;
    border-radius: 8px;
  }
  img{
    width: 100% !important;
  }
  .modal-contenedor{
      position: absolute;
      background-color: white;
  }
</style>
