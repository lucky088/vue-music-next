<template>
    <scroll
      class="index-list"
      :probe-type="3"
      @scroll="onScroll" 
      ref="scrollRef"
    > 
        <!-- 歌手界面的歌手列表组件 -->
        
    <!-- 这里@scroll="onScroll" 监听了自定义事件scroll，赋值给onscroll，派发了位置信息pos值 ，
    但onScroll事件的定义在钩子函数use-fixed中，因为该文件中可以更改scrollY的值，返回值在此文件-->
    <!-- ref="scrollRef"拿到scroll组件实例，赋值给scrollRef，并调用scroll组件的setup中返回的所有信息 -->
    <ul ref="groupRef">
        <li
            v-for="group in data"
            :key="group.title"
            class="group"
        >
        <h2 class="title">{{group.title}}</h2>
        <ul>
            <li
                v-for="item in group.list"
                :key="item.id"
                class="item"
                @click="onItemClick(item)"
            >
                <img class="avatar" v-lazy="item.pic">
                <span class="name">{{item.name}}</span>
            </li>
        </ul>
        </li>
    </ul>
    <div class="fixed"
        v-show="fixedTitle"
        :style="fixedStyle">  
        <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <div class="shortcut"
    @touchstart.stop.prevent="onShortcutTouchStart"
    @touchmove.stop.prevent="onShortcutTouchMove"
    @touchend.stop.prevent>
    
    <!-- 由于侧边标题栏的每一个标题都需要获取其索引，直接在其父元素div绑定事件，但需要阻止默认事件prevent和冒泡stop  -->
    <!-- touchmove的移动变化：手指按下一次后继续滑动没有松开，继而页面也需要跟随响应变化（按住不动一直移）
    touchstart有初始索引值，进而记录touchstart纵坐标，之后获得touchmove的纵坐标，将两纵坐标作差再除以锚点高度，得出偏移了几个升位，最后将初始索引加上差 -->
    <ul>
        <li
        v-for="(item, index) in shortcutList"
        :key="item"
        :data-index="index"
        class="item"
        :class="{'current': currentIndex===index}"> 
        <!-- 利用currentIndex标志高亮 -->
        {{item}}
        </li>
    </ul>
    </div>
    </scroll>
</template>

<script>
import Scroll from '@/components/wrap-scroll'
import useFixed from './use-fixed'
import useShortcut from './use-shortcut'

export default {
    name:'index-list',
    components:{ Scroll },
    emits:['select'],  //vue3的自定义数组emits用来存放有哪些自定义事件
    props:{
        data:{
            type: Array,
            default(){
                return []
            }
        }
    },
    setup(props, {emit}){
        const { groupRef, onScroll, fixedTitle, fixedStyle, currentIndex } = useFixed(props)
        const {shortcutList, scrollRef, onShortcutTouchStart, onShortcutTouchMove} = useShortcut(props, groupRef)  //获取列表分组的title数组
        function onItemClick(item){
            emit('select', item)  
        //利用emit定义自定义事件select，当某个li标签触发点击函数onItemClick时，传出当前选中的item（数组中某一项歌手数据）
        }
        return{
            onItemClick, groupRef, onScroll, fixedTitle, fixedStyle, currentIndex, shortcutList, scrollRef, onShortcutTouchStart, onShortcutTouchMove
        }
    }
}
</script>

<style lang="scss" scoped>
.index-list {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;

  .group {
    padding-bottom: 30px;

    .title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }

    .item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }

  .fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .shortcut {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;

    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;

      &.current {
        color: $color-theme
      }
    }
  }
}
</style>