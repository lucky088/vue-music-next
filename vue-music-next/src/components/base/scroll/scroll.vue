<template>
  <div ref="rootRef">
    <slot></slot>
      <!-- 滚动内容放到插槽部分 -->
  </div>  
  <!-- 外层和betterscroll做初始化联动 -->
</template>

<script>
import useScroll from './use-scroll'
import { ref } from 'vue'
export default {
    name: 'scroll',
    props: {
        click: {
        type: Boolean,
        default: true
        },
        probeType: {
        type: Number,
        default: 0
        }
    },
    emits: ['scroll'],  //自定义组件封装的自定义事件，先在emits节点中声明，通过 this.$emit('自定义事件的名称') 方法进行触发。
    setup(props, { emit }) {  //setup第二个参数是context，这里采用解构赋值，取出来了context.emit，这里的emit就相当于$emit了
        const rootRef = ref(null)  //获取需要滚动条容器的id
        const scroll = useScroll(rootRef, props, emit)  //传入到useScroll函数的挂载函数onMounted中处理，Dom挂载后，得到位置信息pos（实时滚动位置）
        return {
            rootRef, scroll 
            // 通过scroll实例返回betterscroll组件实例
        }
    }
}
</script>

<style>

</style>