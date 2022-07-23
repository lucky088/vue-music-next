//播放器旋转图逻辑
import { useStore } from 'vuex'
import { computed, ref, watch } from 'vue'
export default function useCd(){
    const cdRef = ref(null)
    const cdImageRef = ref(null)

    const store = useStore()
    const playing = computed(() => store.state.playing)


    const cdCls = computed(() => {
        return playing.value? 'playing':''  //根据播放状态开启旋转样式playing，按下暂停清除动画属性，回到初始样式，故按下暂停图片回弹
    })

    //观测playing状态变化，同步旋转角度
    watch(playing, (newPlaying) => {
        if(!newPlaying){
            syncTransform(cdRef.value, cdImageRef.value)
        }
    })
    
    function syncTransform(wrapper, inner){
        //旋转的是内层image，暂停时记录image旋转的角度，进而同步外侧cd角度 
        //本来暂停一次后，外层wrapper就有了初始角度，后面继续暂停给wrapper附加的tranfrom属性应该是在此基础上叠加旋转角度
        const wrapperTranform = getComputedStyle(wrapper).transform
        const innerTransform = getComputedStyle(inner).transform 
        //动态计算内存图片的旋转角度(image旋转角度是每次相对于wrapper层旋转的)
        //由于每次暂停键都会清除动画属性，故图片角度重新开始计算，故第一次往后暂停键记录角度都是每次暂停后旋转的
        wrapper.style.transform = wrapperTranform === 'none'? innerTransform : innerTransform.concat(' ',wrapperTranform)
        
    }

    return{
        cdCls,
        cdRef,
        cdImageRef
    }
   
}