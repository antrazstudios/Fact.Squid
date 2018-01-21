<template>
  <div class="principal">
    <div class="middle">
      <transition enter-class="display-off" enter-active-class="animated fadeIn" :duration="{ enter: 8000 }">
        <div v-if="showFolder === false" class="inner">
          <h1 v-if="sizeMenu === 'large'" style="margin-bottom: 20px;">{{titleMenu}}</h1>
          <h2 v-if="sizeMenu === 'normal'" style="margin-bottom: 10px;">{{titleMenu}}</h2>
          <h3 v-if="sizeMenu === 'small'" style="margin-bottom: 5px;">{{titleMenu}}</h3>
          <Card :class="sizeMenu === 'large' ? 'buttons-options buttons-options--large' : sizeMenu === 'normal' ? 'buttons-options buttons-options--normal' : 'buttons-options buttons-options--small'" v-for="item in optionsMenu" :key="item.key">
            <i-button :class="sizeMenu === 'large' ? 'sub-buttons-options sub-buttons-options--large' : sizeMenu === 'normal' ? 'sub-buttons-options sub-buttons-options--normal' : 'sub-buttons-options sub-buttons-options--small'" type="text" @click="clickeditem(item)">
              <Icon v-if="item.isFolder === true" :class="sizeMenu === 'large' ? 'folder-icon--large' : sizeMenu === 'normal' ? 'folder-icon--normal' : 'folder-icon--small'" type="android-folder"></Icon>
              <Icon :type="item.icon_type" :size="sizeMenu === 'large' ? 100 : sizeMenu === 'normal' ? 60 : 25" style="display:block"/>
              <h3 v-if="sizeMenu === 'large'">{{ item.text }}</h3>
              <h4 v-if="sizeMenu === 'normal'">{{ item.text }}</h4>
              <h5 v-if="sizeMenu === 'small'">{{ item.text }}</h5>
            </i-button>
          </Card>
        </div>
      </transition>
      <transition enter-active-class="animated zoomIn" leave-active-class="animated slideOutDown" :duration="{ enter: 800, leave: 300 }">
        <Card v-if="showFolder === true" class="inner--folder" :borderer="true" :shadow="true">
          <Row type="flex" justify="space-between">
            <i-button class="footer-container" style="flex: left" shape="circle" size="small" icon="close-round" @click="() => { this.showFolder = !this.showFolder }"></i-button>
            <Icon class="footer-container" type="android-folder-open" :size="20"></Icon>
          </Row>
          <h2 v-if="sizeMenu === 'large'" style="margin-bottom: 10px; margin-top: -30px">{{ titleFolder }}</h2>
          <h3 v-if="sizeMenu === 'normal'" style="margin-bottom: 5px; margin-top: -30px">{{ titleFolder }}</h3>
          <h4 v-if="sizeMenu === 'small'" style="margin-bottom: 3px; margin-top: -30px">{{ titleFolder }}</h4>
          <Card style="background-color: #f9f9f9" :class="sizeMenu === 'large' ? 'buttons-options buttons-options--large' : sizeMenu === 'normal' ? 'buttons-options buttons-options--normal' : 'buttons-options buttons-options--small'" v-for="item in optionsFolder" :key="item.key">
            <i-button :class="sizeMenu === 'large' ? 'sub-buttons-options sub-buttons-options--large' : sizeMenu === 'normal' ? 'sub-buttons-options sub-buttons-options--normal' : 'sub-buttons-options sub-buttons-options--small'" type="text" @click="clickeditem('')">
              <Icon :type="item.icon_type" :size="sizeMenu === 'large' ? 100 : sizeMenu === 'normal' ? 60 : 25" style="display:block"/>
              <h3 v-if="sizeMenu === 'large'">{{ item.text }}</h3>
              <h4 v-if="sizeMenu === 'normal'">{{ item.text }}</h4>
              <h5 v-if="sizeMenu === 'small'">{{ item.text }}</h5>
            </i-button>
          </Card>
        </Card>
      </transition>
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
    optionsFolder: []
  }),
  methods: {
    clickeditem (item) {
      if (item.isFolder === true) {
        this.titleFolder = item.text
        this.showFolder = !this.showFolder
        this.optionsFolder = item.folderContent
      } else if (item.isFolder === false) {
        item.clickAction()
      }
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
    cursor: pointer;
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
  .folder-icon--large{
    position: fixed;
    margin-top: -30px;
    margin-left: 80px;
    opacity: 0.3;
  }
  .folder-icon--normal{
    position: fixed;
    margin-top: -20px;
    margin-left: 45px;
    opacity: 0.3;
  }
  .folder-icon--small{
    position: fixed;
    margin-top: -15px;
    margin-left: 22px;
    opacity: 0.3
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