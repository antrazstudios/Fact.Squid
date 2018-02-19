<template>
  <div class="principal">
    <div class="middle">
      <!-- <transition-group tag="div" name="flip-list"> -->
      <div class="inner">
        <h1 v-if="sizeMenu === 'large'" style="margin-bottom: 20px;">{{titleMenu}}</h1>
        <h2 v-if="sizeMenu === 'normal'" style="margin-bottom: 10px;">{{titleMenu}}</h2>
        <h3 v-if="sizeMenu === 'small'" style="margin-bottom: 5px;">{{titleMenu}}</h3>
        <Card :style="transformsCardSizeSelectInitial(item.key)" :dis-hover="showFolder" v-for="item in optionsMenu" :key="item.key" :padding="0">
          <i-button :disabled="showFolder" :style="transformsButtonSizeSelectInitial()" :type="item.button_style" @click="clickeditem(item)">
            <Icon :size="transformsIconFolderSizeSelectInitial().sizeIcon" ref="icon" :style="transformsIconFolderSizeSelectInitial().style" v-if="showIconFolder(item.isFolder) === true" type="android-folder"></Icon>
            <Icon v-if="item.icon_style === 'icon'" :type="item.icon_type" :size="transformsIconSizeSelectInitial()" style="display:block"/>
            <img v-if="item.icon_style === 'img'" :src="item.icon_type" :style="'width: ' + transformsIconSizeSelectInitial() + 'px'"/>
            <div v-if="showFolder === false" class="content-text">
              <label v-bind:style="sizeMenu === 'large' ? { fontSize: '16px' } : sizeMenu === 'normal' ? { fontSize: '12px' } : { fontSize: '10px' }">{{ item.text }}</label>
            </div>
          </i-button>
        </Card>
        <Card v-if="optionsMenu.length === 0" style="opacity: 0.6" dis-hover>
          Aun existen opciones para mostrar en este modulo
        </Card>
      </div>
      <Card v-if="showFolder === true" class="inner--folder" :borderer="true" :shadow="true" style="margin-top: 10px">
          <Row type="flex" justify="space-between">
            <i-button class="footer-container" style="flex: left" shape="circle" size="small" icon="close-round" @click="() => { 
              this.showFolder = !this.showFolder 
              this.itemClicked = ''
              }"></i-button>
            <Icon class="footer-container" type="android-folder-open" :size="20"></Icon>
          </Row>
          <h2 v-if="sizeMenu === 'large'" style="margin-bottom: 10px; margin-top: -30px">{{ titleFolder }}</h2>
          <h3 v-if="sizeMenu === 'normal'" style="margin-bottom: 5px; margin-top: -30px">{{ titleFolder }}</h3>
          <h4 v-if="sizeMenu === 'small'" style="margin-bottom: 3px; margin-top: -30px">{{ titleFolder }}</h4>
          <Card style="background-color: #f9f9f9" :class="sizeMenu === 'large' ? 'buttons-options buttons-options--large' : sizeMenu === 'normal' ? 'buttons-options buttons-options--normal' : 'buttons-options buttons-options--small'" v-for="item in optionsFolder" :key="item.key">
            <i-button :class="sizeMenu === 'large' ? 'sub-buttons-options sub-buttons-options--large' : sizeMenu === 'normal' ? 'sub-buttons-options sub-buttons-options--normal' : 'sub-buttons-options sub-buttons-options--small'" type="text" @click="clickeditem(item)">
              <Icon :type="item.icon_type" :size="sizeMenu === 'large' ? 100 : sizeMenu === 'normal' ? 60 : 25" style="display:block"/>
              <div class="content-text">
                <label v-bind:style="sizeMenu === 'large' ? { fontSize: '16px' } : sizeMenu === 'normal' ? { fontSize: '12px' } : { fontSize: '10px' }">{{ item.text }}</label>
              </div>
            </i-button>
          </Card>
        </Card>
    </div>
  </div>
</template>
<script>
export default {
  name: 'menu-options',
  props: [ 'optionsMenu', 'titleMenu', 'sizeMenu' ],
  data: () => ({
    showFolder: false,
    titleFolder: 'Prueba',
    optionsFolder: [],
    itemClicked: '',
    minusPercent: 0.60
  }),
  mounted () {
    for (let i = 0; i < this.optionsMenu.length; i++) {
      const element = this.optionsMenu[i]
      element.key = i
    }
  },
  methods: {
    clickeditem (item) {
      console.log(item)
      if (item.isFolder === true) {
        this.titleFolder = item.text
        this.showFolder = !this.showFolder
        this.itemClicked = item.key
        this.optionsFolder = item.folderContent
      } else if (item.isFolder === false) {
        item.clickAction()
      }
    },
    transformsIconSizeSelectInitial () {
      let sizeReal
      switch (this.sizeMenu) {
        case 'large':
          sizeReal = 100
          break
        case 'normal':
          sizeReal = 60
          break
        case 'small':
          sizeReal = 40
          break
      }
      if (this.showFolder === true) {
        sizeReal = sizeReal - (sizeReal * this.minusPercent)
      }
      return sizeReal
    },
    transformsButtonSizeSelectInitial () {
      let heightReal, widthReal
      widthReal = 100
      switch (this.sizeMenu) {
        case 'large':
          heightReal = 198
          break
        case 'normal':
          heightReal = 118
          break
        case 'small':
          heightReal = 78
          break
      }
      if (this.showFolder === true) {
        heightReal = heightReal - (heightReal * this.minusPercent)
        widthReal = widthReal - (widthReal * this.minusPercent)
      }
      return {
        width: widthReal + '%',
        height: heightReal + 'px',
        margin: '0%',
        padding: '0%'
      }
    },
    transformsCardSizeSelectInitial (itemID) {
      let heightReal, widthReal, cursorReal, opacityReal
      cursorReal = 'pointer'
      opacityReal = 1
      switch (this.sizeMenu) {
        case 'large':
          heightReal = 200
          widthReal = 200
          break
        case 'normal':
          heightReal = 120
          widthReal = 120
          break
        case 'small':
          heightReal = 80
          widthReal = 80
          break
      }
      if (this.showFolder === true) {
        cursorReal = 'no-drop'
        if (this.itemClicked !== itemID) {
          opacityReal = 0.27
        }
        heightReal = heightReal - (heightReal * this.minusPercent)
        widthReal = widthReal - (widthReal * this.minusPercent)
      }
      return {
        marginLeft: '5px',
        marginRight: '5px',
        marginTop: '5px',
        marginBottom: '3px',
        display: 'inline-block',
        padding: '0%',
        height: heightReal + 'px',
        width: widthReal + 'px',
        cursor: cursorReal,
        opacity: opacityReal
      }
    },
    transformsIconFolderSizeSelectInitial () {
      let marginLeftReal, marginTopReal, sizeIconReal
      switch (this.sizeMenu) {
        case 'large':
          marginTopReal = -30
          marginLeftReal = 72
          sizeIconReal = 20
          break
        case 'normal':
          marginTopReal = -18
          marginLeftReal = 41
          sizeIconReal = 15
          break
        case 'small':
          marginTopReal = -8
          marginLeftReal = 25
          sizeIconReal = 12
          break
      }
      return {
        style: {
          position: 'fixed',
          opacity: 0.3,
          marginLeft: marginLeftReal + 'px',
          marginTop: marginTopReal + 'px'
        },
        sizeIcon: sizeIconReal
      }
    },
    showIconFolder (itemFolder) {
      let rta = itemFolder
      if (this.showFolder === true) {
        rta = false
      }
      return rta
    }
  }
}
</script>
<style>
  .principal{
    display: table;
    height: 100%;
    width: 100%;
  }
  .middle{
    display: table-cell;
    vertical-align: middle;
  }
  .inner{
    margin-left: 5%;
    margin-right: 5%;
    text-align: center;
  }
  .content-text{
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
  }
  .inner--folder{
    margin-left: 5%;
    margin-right: 5%;
    text-align: center;
  }
  .content-buttons{
    margin: 2%;
  }
  .buttons-options--folder{
    background-color: #f1f1f1
  }
  .buttons-options{
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 5px;
    margin-bottom: 3px;
    display: inline-block;
    padding: 0%;
  }
  .buttons-options--large{
    width: 200px;
    height: 200px;
  }
  .buttons-options--normal{
    width: 120px;
    height: 120px;
  }
  .buttons-options--small{
    width: 80px;
    height: 80px;
  }
  .sub-buttons-options{
    width: 100%;
    margin: 0%;
    padding: 0%;
  }
  .sub-buttons-options--large{
    height: 165px;
  }
  .sub-buttons-options--normal{
    height: 90px;
  }
  .sub-buttons-options--small{
    height: 45px;
  }
  .footer-container{
    display: inline-block;
  }
  .display-on{
    display: '';
  }
  .display-off{
    display: none;
  }
</style>