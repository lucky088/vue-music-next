<template>
<!-- 歌手、歌单、榜单详情界面挂载组件 -->
  <div class="music-list">
      <div class="back" @click="goBack">
          <i class="icon-back"></i>
      </div>
      <h1 class="title">{{ title }}</h1>
      <!-- bgImage记录图片id，提取高度 -->
      <div class="bg-image" :style="bgImageStyle" ref="bgImage">  
        <div class="play-btn-wrapper" :style="playBtnStyle">
          <div v-show="songs.length > 0" class="play-btn" @click="random">
            <i class="icon-play"></i>
            <span class="text">随机播放全部</span>
          </div>
        </div>
          <div class="filter" :style="filterStyle"></div>  
          <!-- 图片上的遮盖层 -->
      </div>
    <!-- 需要动态计算背景图片高度，继而动态给list设置top值(scrollStyle)  loading是根据数据库取时设置,故设置为布尔值，数据加载前至为true--加载状态 -->
      <scroll class="list" :style="scrollStyle" v-loading="loading" v-no-result="noResult" :probe-type="3"  @scroll="onScroll">
          <div class="song-list-wrapper">
              <song-list :songs="songs" @select="selectItem" :rank="rank"></song-list>  
              <!-- 歌手详情界面的歌单，放入滚动列表中，也封装为一个组件, select接收该组件传来的具体点击播放歌曲 -->
          </div>
      </scroll>
  </div>
</template>

<script>
import SongList from '@/components/base/song-list/song-list'
import Scroll from '@/components/wrap-scroll'
import {mapActions, mapState} from 'vuex'
const RESERVED_HEIGHT = 40
export default {
    name: 'music-list',
    components: {
        SongList,
        Scroll
    },
    props: {
        songs: {
            type: Array,
            default(){
                return []
            }
        },
        title: String,
        pic: String,
        loading: Boolean,
        noResultText: {
            type : String,
            default: '抱歉，没有找到可播放的歌曲'
        },
        rank: Boolean
    },
    data(){
        return {
            imageHeight: 0,
            scrollY: 0,
            maxTranslateY:0
        }
    },
    computed: {
        noResult(){
            return !this.loading && !this.songs.length
        },
        playBtnStyle(){
          let display = ''
          if(this.scrollY >= this.maxTranslateY){
            display = 'none'
          }
          return{
            display
          }
        },
        bgImageStyle(){
            /*1)高度百分比：浏览器在计算有效宽度时会考虑浏览器窗口的宽度，如果没有设置绝对宽度，就会自动将页面内容横向平铺填满整个窗口。
            然而浏览器并不计算内容的高度，除非内容超过了视窗高度，形成滚动条。或者给页面设置一个绝对高度，不然的话，浏览器就会
            将内容按文档流往下堆砌，也就是高度值为缺省值auto。
            2）使用 padding 代替高度：首先，内边距就是元素边框与元素内容之间的空白区域；所以内边距越来越大时，元素的高度也会不断增大。
            如果一个元素的内容为空，内边距的高度就是该元素的高度，将高度替换成内边距，并且以百分比设置它的值。
            内边距padding是基于父元素的宽度的百分比的内边距
            3）实现：使用padding代替高度，使用padding-top或padding-bottom其中之一即可。引入的pic的宽/高=100%/x（将设置的图片宽为100%）
            */
            //处理列表中响应式图片时，宽度可以设置百分比自适应，但高度无法控制，如果图片宽高不一致，宽度设置一样，高度会参差不齐，使用padding来控制高度，让列表中图片强制设置同一高度
            const scrollY = this.scrollY
            let zIndex = 0  //本来图片层级在列表之下，当列表往上滑到顶部时，要调整层级，使得图片顶部覆盖在列表之上
            let paddingTop = '70%'  //利用padding-Top实现响应性图片，保持元素的宽高比，为元素添加垂直方向的paddingtop，使用百分比形式，相对于元素的宽高
            let height = 0
            //原始方式：图片等比例缩放，使用引入，设置宽高100%，根据不同手机的分辨率，等比缩放背景图高度
            
            let translateZ = 0 // 解决移动端苹果兼容问题（确保list能被顶部覆盖）
            if(scrollY > this.maxTranslateY){  //如果在图片的盒子区域，scrolly的实时移动距离大于最大移动距离
                zIndex = 10
                paddingTop = 0
                height = `${RESERVED_HEIGHT}px`
                translateZ = 1  //离用户屏幕近一些
                // 当移动到顶部时，固定顶部图片的高度，将paddingTop设置为0，使盒子高度不被撑开
            }

            let scale = 1
            if (scrollY < 0) {   //往下拉图片放大效果
                scale = 1 + Math.abs(scrollY / this.imageHeight)   //图片往下拉的距离越大，放大比例越大
            }
            return {
            zIndex,
            paddingTop,
            height,
            backgroundImage: `url(${this.pic})`,
            transform: `scale(${scale})translateZ(${translateZ}px)`
        }
        },
        scrollStyle(){
          const bottom = this.playlist.length? '60px': '0'
            return {
               top: `${this.imageHeight}px`, bottom
            }
        },
        filterStyle(){
            let blur = 0;
            const scrollY = this.scrollY //如果后面频繁使用this.scrollY，建议使用临时变量，不然会触发多次依赖收集，没有必要
            const imageHeight = this.imageHeight
            if(scrollY >= 0){
                blur = Math.min(this.maxTranslateY/imageHeight, scrollY / imageHeight) * 20  //限制最大值，未达到最大值时均取最小值
            }
            return {
                backdropFilter: `blur(${blur}px)`
            }
        },
        ...mapState([
          'playlist'
          ])
    },
   mounted(){
       this.imageHeight = this.$refs.bgImage.clientHeight   //提取图片高度，在dom挂载之后
       this.maxTranslateY = this.imageHeight - RESERVED_HEIGHT //记录可以移动的距离（图片高度减去上面固定留宽）
   },
   methods:{
       goBack(){
           this.$router.back()
       },
       onScroll(pos){
           this.scrollY = -pos.y  //知道实时的scrollY值
       },
       selectItem({song, index}){
         //此处要派发一个actions
         this.selectPlay({
           list: this.songs,  //由于songlist派发过来的函数所传参数song本身就是musiclist组件传过去的songs
           index
         })
       },
       random(){
         this.randomPlay(this.songs)
       },
       ...mapActions([
         'selectPlay',
         'randomPlay'
       ])
   }
}
</script>

<style lang="scss" scoped>
.music-list {
  position: relative;
  height: 100%;

  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 20;
    transform: translateZ(2px);

    .icon-back {
      display: block;
      padding: 10px;
      font-size: $font-size-large-x;
      color: $color-theme;
    }
  }

  .title {
    position: absolute;
    top: 0;
    left: 10%;
    width: 80%;
    z-index: 20;
    transform: translateZ(2px);
    @include no-wrap();
    text-align: center;
    line-height: 40px;
    font-size: $font-size-large;
    color: $color-text;
  }

  .bg-image {
    position: relative;
    width: 100%;
    transform-origin: top;
    background-size: cover;

    .play-btn-wrapper {
      position: absolute;
      bottom: 20px;
      z-index: 10;
      width: 100%;

      .play-btn {
        box-sizing: border-box;
        width: 135px;
        padding: 7px 0;
        margin: 0 auto;
        text-align: center;
        border: 1px solid $color-theme;
        color: $color-theme;
        border-radius: 100px;
        font-size: 0;
      }

      .icon-play {
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
        font-size: $font-size-medium-x;
      }

      .text {
        display: inline-block;
        vertical-align: middle;
        font-size: $font-size-small;
      }
    }

    .filter {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(7, 17, 27, 0.4);
    }
  }

  .list {
    position: absolute;
    bottom: 0;
    width: 100%;
    z-index: 0;

    .song-list-wrapper {
      padding: 20px 30px;
      background: $color-background;
    }
  }
}
</style>