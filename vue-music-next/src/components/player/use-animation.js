import { ref } from 'vue'
import animations from 'create-keyframe-animation'

export default function useAnimation(){
    // 完成cd由mini播放器位置偏移到全屏播放器中间的偏移动画---对比player组件中的css是动画结束到达位置后，cd层变化前后样式
    const cdWrapperRef = ref(null)
    let entering = false
    let leaving = false

    function enter(el, done){  //参数一：获取相应dom层，直接取el会对应待整个normalplayer不是我们想要的cd层；参数二：动画结束函数
        if(leaving) {
            afterleave()  //避免Q2，保证afterLeave一定执行
        }
        entering = true
        const { x, y, scale } = getPosAndScale()
        const animation = {  //实际的动画变化
            0: {
                transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
            },
            100:{
                transform: 'translate3d(0, 0, 0) scale(1)'
            }
        }  
        animations.registerAnimation({
            name: 'move',
            animation,
            presets:{  //实际运行动画时的可选预设
                duration: 600,
                easing: 'cubic-bezier(0.45, 0, 0.55, 1)'  //变化方式
            }
        }) 
//Q1：enter本质是异步过程，会执行一段长duration的动画，若在duration内动画未完成，会触发leave，导致下面runanimation、afterenter等不执行
        animations.runAnimation(cdWrapperRef.value, 'move', done)
    }

    function afterEnter(){
        entering = false
        animations.unregisterAnimation('move')
        cdWrapperRef.value.animation = ''  //清理操作
    }
    
//Q2：leave本质也是异步过程，会执行长duration的动画，若在duration内动画未完成，会触发enter，导致下面next、afterleave等不执行
    function leave(el, done){
        if(entering){
            afterEnter()  //避免Q1情况，保证afterEnter一定执行
        }
        leaving = true
        const {x, y, scale } = getPosAndScale()
        const cdWrapperEl = cdWrapperRef.value
        cdWrapperEl.style.transition = 'all .6s cubic-bezier(0.45, 0, 0.55, 1)'
        cdWrapperEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        cdWrapperEl.addEventListener('transitionend', next) 
        // 监听事件transitionend,在CSS完成过渡后触发done回调, 执行完之后就执行afterLeave
    
        function next () {
            cdWrapperEl.removeEventListener('transitionend', next)
            done()
          }
    }

    function afterleave(){
        leaving = false
        const cdWrapperEl = cdWrapperRef.value
        cdWrapperEl.style.transition = ''
        cdWrapperEl.style.transform = ''
    }

    function getPosAndScale(){  //fullScreen-cd偏移到mini-cd的偏移量计算（左下方）
        //mini-cd相关数据
        const targetWidth = 40
        const paddingLeft = 40  //取mini-cd圆心相对于左边偏移量。左边距20+半径20
        const paddingBottom = 30

        //fullScreen相关数据
        const paddingTop = 80  //fullScreen-cd上的头顶部距离
        const width = window.innerWidth * 0.8

        //偏移量
        const x = -(window.innerWidth / 2 - paddingLeft)  //向左
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom  //向下
        const scale = targetWidth / width  //比例

        return{
            x,
            y,
            scale
        }
    }

    return {
        cdWrapperRef,
        enter,
        afterEnter,
        leave,
        afterleave
    }
}