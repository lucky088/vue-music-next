<template>
  <ul class="switches"><!--添加歌曲到播放列表的头部组件切换功能，添加页面的左最近播放右历史搜索的切换组件  -->
    <li
        class="switch-item"
        v-for="(item, index) in items"
        :key="item"
        :class="{'active':modelValue===index}"
        @click="switchItem(index)"
        >
      <span>{{ item }}</span>
    </li>
    <div class="active-bar" :style="activeStyle"></div>
  </ul>
</template>

<script>
export default {
  name: 'switches',
  props: {
    items: {
      type: Array,
      default () {
        return []
      }
    },
    modelValue: {  //由外部传入的索引值来控制，是显示左边的最近播放还是显示右边的历史组件
      type: Number,
      default: 0
    }
  },
  computed: {  //逻辑少用options API
    activeStyle () {  //根据组件显示，对应过渡到界面
      const x = 120 * this.modelValue
      return {
        transform: `translate3d(${x}px, 0, 0)`
      }
    }
  },
  methods: {
    switchItem (index) {
      this.$emit('update:modelValue', index)
    }
  }
}
</script>

<style lang="scss" scoped>
.switches {
  display: flex;
  position: relative;
  align-items: center;
  width: 240px;
  margin: 0 auto;
  border: 1px solid $color-highlight-background;
  border-radius: 5px;

  .switch-item {
    position: relative;
    z-index: 10;
    flex: 1;
    height: 30px;
    line-height: 30px;
    text-align: center;
    font-size: $font-size-medium;
    color: $color-text;

    &.active {
      color: $color-text
    }
  }

  .active-bar {
    position: absolute;
    left: 0;
    top: 0;
    width: 120px;
    height: 30px;
    transition: transform 0.3s;
    border-radius: 5px;
    background: $color-highlight-background;
  }
}
</style>
