// 存储播放历史歌曲的逻辑，附加在player组件的ready函数中，歌曲首次缓冲时
import { useStore } from 'vuex'
import {PLAY_KEY} from '@/assets/js/constant';
import { save } from '@/assets/js/array-store'
export default function usePlayHistory(){
    const store = useStore()
    const maxLen = 200
    function savePlay(song){
        const songs = save(song, PLAY_KEY, (item)=>{
            return item.id == song.id
        }, maxLen)
        store.commit('setPlayHistory', songs)
    }
    return {
        savePlay
    }
}