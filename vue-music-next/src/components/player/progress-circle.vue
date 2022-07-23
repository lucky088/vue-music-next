<template>
    <div class="progress-circle">
    <!-- mini组件中的播放开关（进度圈） -->
        <svg
        :width="radius"
        :height="radius"
        viewBox="0 0 100 100"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg">
      <circle
          class="progress-background"
          r="50"
          cx="50"
          cy="50"
          fill="transparent"/>
      <circle
          class="progress-bar"
          r="50"
          cx="50"
          cy="50"
          fill="transparent"
          :stroke-dasharray="dashArray"
          :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot></slot>
    </div>
</template>

<script>
export default {
    name: 'progress-circle',
    props: {
        radius:{
            type:Number,
            default: 100
        },
        progress: {  //进度，具体亮色黄色进度条
            type: Number,
            default: 0
        }
    },
    data(){
        return {
            dashArray: Math.PI * 100  //周长2piR
        }
    },
    computed: {
        dashOffset(){
            return(1 - this.progress) * this.dashArray  //灰色路径距离开始处的偏移量，进度越大，其越小，黄色路径显示越多（灰色部分）
        }
    }
}
</script>

<style lang="scss" scoped>
.progress-circle {
  position: relative;

  circle {
    stroke-width: 8px;
    transform-origin: center;

    &.progress-background {
      transform: scale(0.9);
      stroke: $color-theme-d;
    }

    &.progress-bar {
      transform: scale(0.9) rotate(-90deg);
      stroke: $color-theme;
    }
  }
}
</style>
