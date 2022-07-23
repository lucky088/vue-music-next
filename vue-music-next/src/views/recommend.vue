<template>
  <div class="recommend" v-loading="loading">
    <!-- 容器层scroll -->
    <scroll class="recommend-content">   
      <!-- 只针对第一个子节点生效，故加一个div包裹所有内容，下面是内容层 -->
     <div>
       <div class="slider-wrapper">
          <div class="slider-content">
            <slider v-if="sliders.length" :sliders="sliders"></slider>
          </div>
        </div>
     <!-- 热门歌单推荐使用flex布局 -->
     <div class="recommend-list">
          <h1 class="list-title" v-show="!loading">热门歌单推荐</h1>
          <ul>
            <li
                v-for="item in albums"
                class="item"
                :key="item.id"
                @click="selectItem(item)"
                >
                <!-- @click="selectItem(item)" -->
              <div class="icon">
                <img width="60" height="60" v-lazy="item.pic" :src="item.pic"/>
              </div>
              <div class="text">
                <h2 class="name">
                  {{ item.username }}
                </h2>
                <p class="title">
                  {{ item.title }}
                </p>
              </div>
            </li>
          </ul>
        </div>
     </div>
     </scroll>
      <router-view v-slot="{ Component }">
      <transition appear name="slide">  
        <!-- transition的name和样式class名（slide-enter-active）对应 -->
        <component :is="Component" :data="selectedAlbum"/>
      </transition>
    </router-view>
  </div>
</template>

<script>
import { getRecommend } from '../service/recommend'
import Slider from '@/components/base/slider/slider'
import Scroll from '@/components/wrap-scroll'
import storage from 'good-storage'
import {ALBUM_KEY} from "@/assets/js/constant"
//发送请求过程是异步.使用 async / await, 搭配 promise
//可以通过编写形似同步的代码来处理异步流程, 提高代码的简洁性和可读性
export default {
    name:'recommend',
    components:{
      Slider,
      Scroll
    },
    data(){
      return{
        sliders:[],
        albums:[],
        selectedAlbum: null
      }
    },
    computed: {
    loading () {
      return !this.sliders.length && !this.albums.length
    }
  },
    async created () {
    const result = await getRecommend()
    this.sliders = result.sliders
    this.albums = result.albums
  },
  methods:{
    selectItem(album){
      this.selectedAlbum = album  //跳转路由时传递到详情界面的数据
      this.cacheAlbum(album)
      this.$router.push({
        path: `/recommend/${album.id}`
      })
    },
    cacheAlbum(album){
      storage.session.set(ALBUM_KEY, album)
    }
  }
}
</script>

<style lang="scss" scoped>
.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  overflow: scroll;  //浏览器原生滚动，不顺滑，不支持回弹

  .recommend-content {
    height: 100%;
    overflow: hidden;

    .slider-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 40%;
      overflow: hidden;

      .slider-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
      }
    }

    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;  //标题垂直居中
        text-align: center; //标题水平居中
        font-size: $font-size-medium;
        color: $color-theme;
      }

      .item {  //一个歌单模块
        display: flex;
        box-sizing: border-box;//就是将border和padding数值包含在width和height之内，修改border和padding数值盒子的宽高不变。
        align-items: center;  //保证模块里的图片垂直居中
        padding: 0 20px 20px 20px;

        .icon {
          flex: 0 0 60px;
          width: 60px;
          padding-right: 20px;
        }

        .text {
          display: flex;
          flex-direction: column;  //垂直轴为主轴,歌单名和介绍纵向排列
          justify-content: center; //垂直轴上的对齐方式:居中
          flex: 1;    //父级的flex布局,除去图片,其余部分全部自适应分配给text
          line-height: 20px;  //其中子元素标题h2和p标签的行高都是20px
          overflow: hidden;
          font-size: $font-size-medium;
        }

        .name {
          margin-bottom: 10px;
          color: $color-text;
        }

        .title {
          color: $color-text-d;
        }
      }
    }
  }
}
</style>