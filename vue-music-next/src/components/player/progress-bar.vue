<template>
  <div class="progress-bar" @click="onClick">
        <!-- 进度条组件 -->
      <div class="bar-inner">
          <!-- 黄色进度条 -->
          <div class="progress" ref="progress" :style="progressStyle"></div>  
          <!-- 滑动按钮 -->
           <div class="progress-btn-wrapper">
            <div
                class="progress-btn"
                :style="btnStyle"
                @touchstart.prevent="onTouchStart"
                @touchmove.prevent="onTouchMove"
                @touchend.prevent="onTouchEnd"></div>
        </div>
      </div>
  </div>
</template>

<script>
const progressBtnWidth = 16

export default {
    name:'progress-bar',
    emits:['progress-changing','progress-changed'],  //手指还未离开（还在滑），手指已经放开
    props: {
        progress: {   //播放进度（0-1）决定了btn播放条滑动按钮位置，以及黄色进度条的宽度
            type: Number,
            default: 0
        }
    },
    data(){
        return{
            offset: 0  //对比touch对象，希望触发模板重新渲染，就必须是响应式
        }
    },
    computed:{
        progressStyle(){  //左侧黄色进度条
            return `width:${this.offset}px`
        },
        btnStyle(){  //按钮
            return `transform:translate3d(${this.offset}px,0,0)`
        }
    },
    watch:{
        progress(newProgress){  //watch会等渲染之后 ,Vue脚手架中，$el指向当前组件template模板中的根标签
            this.setOffset(newProgress)
            // const barWidth = this.$el.clientWidth - progressBtnWidth  //进度条宽度：当前总div宽度 - 按钮宽度
            // this.offset = barWidth * newProgress  
            //如果用computed的话，模板渲染时offset就会被访问，检测到变量progress的变化，但此时dom还未挂载，clientWidth获取不到
        }
    },
    created(){
        this.touch = {}  
        /*不定义在data中原因，在函数中共享this.touch对象，并不需要观测其变化，
        而放在data中数据都会变成响应式，一旦发生变化就是触发组件重新渲染，浪费性能 */
        //页面初始化过程中，定义一个对象，用来存放进度条移动数据
        //常用技巧，不需要观测变化数据，但需要在组件上下文访问到
    },
    methods: {
        // touches:表示当前跟踪的触摸操作的Touch对象的数组

        onTouchStart(e){
            this.touch.x1 = e.touches[0].pageX   //获取移动进度条开始时的按钮位置
            this.touch.beginWidth = this.$refs.progress.clientWidth    //获取移动进度条开始时,进度条的初始宽度
        },
        onTouchMove(e){
            // 获取相对于初始位置的偏移值
            const delta = e.touches[0].pageX - this.touch.x1; //按钮被点击移动的距离
            const tempWidth = this.touch.beginWidth + delta  //基于按钮距离得到进度条新宽度
            const barWidth = this.$el.clientWidth - progressBtnWidth  //原进度条总宽度
            const progress = Math.min(1, Math.max(tempWidth / barWidth, 0)) //得到新的进度条进度比
            //最多是1，小于等于1，用min---最少是0，大于等于0，用max
            this.offset = barWidth * progress  

            //保证修改进度条时，歌曲本身也要对应进度条的进度
            this.$emit('progress-changing',progress)  //手指还未离开时，派发实时进度比给播放器
        },
        onTouchEnd(){
            const barWidth = this.$el.clientWidth - progressBtnWidth  //原进度条总宽度
            const progress = this.$refs.progress.clientWidth / barWidth
            this.$emit('progress-changed', progress) //手指离开后，派发最终进度比给播放器
        },
        onClick(e){
            //点击进度条实现歌曲进度改变
            const rect = this.$el.getBoundingClientRect() 
           //getBoundingClientRect()用于获得页面中某个元素的左，上，右和下分别相对浏览器视窗的位置
            const offsetWidth = e.pageX - rect.left  //进度条更新值（偏移量） = 点击的页面横坐标 - 进度条左顶端离视窗的距离
            const barWidth = this.$el.clientWidth - progressBtnWidth
            const progress = offsetWidth / barWidth
            this.$emit('progress-changed', progress)
        },
        setOffset(progress){
            const barWidth = this.$el.clientWidth - progressBtnWidth
            this.offset = barWidth * progress
        }
    }
}
</script>

<style lang="scss" scoped>
.progress-bar {
  height: 30px;

  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);

    .progress {
      position: absolute;
      height: 100%;
      background: $color-theme;
    }

    .progress-btn-wrapper {
      position: absolute;
      left: -8px;
      top: -13px;
      width: 30px;
      height: 30px;

      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid $color-text;
        border-radius: 50%;
        background: $color-theme;
      }
    }
  }
}
</style>