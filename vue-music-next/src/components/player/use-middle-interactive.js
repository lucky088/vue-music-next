//中间层切换逻辑，cd和歌词界面滑动切换
import { ref } from 'vue'
export default function useMiddleInteractive(){
    const currentShow = ref('cd')
    const middleLStyle = ref(null)
    const middleRStyle = ref(null)

    //下面变量不需要做响应式，做局部变量
    const touch = {} //touch函数中的共享变量
    let currentView = 'cd'  
    //currentshow记录每次滑动切换后的页面，currentview代表当前切换的起始页面（在切换中move时，view不变，show已变）

    function onMiddleTouchStart(e){
        touch.startX = e.touches[0].pageX// 得到开始位置横坐标
        touch.startY = e.touches[0].pageY //对歌词界面的移动进行单方向锁定，要么横向，要么纵向
        touch.directionLocked = ''

    }
    function onMiddleTouchMove(e){  
        //手指拖动过程中函数一直触发，不借助currentView利用currentshow（一切换就变)来判断当前起始界面，逻辑会错乱

        const deltaX = e.touches[0].pageX - touch.startX
        const deltaY = e.touches[0].pageY - touch.startY

        const absDeltaX = Math.abs(deltaX)
        const absDeltaY = Math.abs(deltaY)

        if(!touch.directionLocked){
            //移动的横坐标大于纵坐标，有效的横向滚动
            touch.directionLocked = absDeltaX >= absDeltaY? 'h':'v'
        }
        if(touch.directionLocked === 'v'){
            //纵向偏移，无操作
            return
        }

        const left = currentView === 'cd'? 0 : -window.innerWidth
        /*
        如果当前位置是cd界面，代表当前位置起始值是0（cd界面从右往左滑，得到偏移量是负值，
        滑到歌词界面的偏移值刚刚好是整个屏幕宽度负值—window.innerWidth）；
        如果当前位置是歌词界面，代表当前位置起始值是—屏幕宽度 —window.innerWidth
        （歌词界面从左往右滑，得到偏移量是正值，滑到歌词界面的偏移值刚刚好是0） 
        */
        const offsetWidth = Math.min(0, Math.max(left + deltaX, -window.innerWidth))
        touch.percent = Math.abs(offsetWidth / window.innerWidth)

        if(currentView === 'cd'){
            if (touch.percent > 0.2) {
                currentShow.value = 'lyric'
              } else {
                currentShow.value = 'cd'
              }
        }else{
            //当前起始位置从歌词界面开始，left起始值是-window.width<0，占据百分之百，随偏移量负值增大，绝对值减小，半分比减小到80%
            if (touch.percent < 0.8) {
                currentShow.value = 'cd'
              } else {
                currentShow.value = 'lyric'
              }
        }
        middleLStyle.value = {  //cd界面的透明度，完全滑到歌词界面percent是100%
            opacity : 1 - touch.percent,
            //cd界面在下，歌词界面在上，故cd需要透明度
            transitionDuration: '0ms'
            //若不设置0，拖动过程中样式显示都是缓慢动，怪异
        }
        middleRStyle.value = {
            transform: `translate3d(${offsetWidth}px, 0, 0)`,
            transitionDuration: '0ms'
            //cd界面在下，歌词界面在上，故移动效果的界面永远是歌词界面
        }
    }
    function onMiddleTouchEnd() {
        let offsetWidth
        let opacity
        if (currentShow.value === 'cd') {
          currentView = 'cd'
          offsetWidth = 0
          opacity = 1
        } else {
          currentView = 'lyric'
          offsetWidth = -window.innerWidth
          opacity = 0
        }
    const duration = 300
    middleLStyle.value = {
      opacity,
      transitionDuration: `${duration}ms`
    }

    middleRStyle.value = {
      transform: `translate3d(${offsetWidth}px, 0, 0)`,
      transitionDuration: `${duration}ms`
    }
    }
    return{
        currentShow,
        middleLStyle,
        middleRStyle,
        onMiddleTouchStart,
        onMiddleTouchMove,
        onMiddleTouchEnd
    }
}