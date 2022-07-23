//定义收藏按钮逻辑
import { useStore } from 'vuex'
import { computed } from 'vue'
import { save, remove } from '@/assets/js/array-store'
import { FAVORITE_KEY } from '@/assets/js/constant'
export default function useFavorite(){
    const store = useStore()
    const favoriteList = computed(() => store.state.favoriteList)
    const maxLen = 100 //限制最多存放100首，超出则移除最先放入的第一首

    function getFavoriteIcon(song) {
        //根据歌曲是否在favoriteList收藏列表中，决定歌曲的收藏样式
        return isFavorite(song)? 'icon-favorite' : 'icon-not-favorite'
    }

    function isFavorite(song){
        return favoriteList.value.findIndex((item) => {
            return item.id === song.id
        }) > -1
        //这里面返回为true，说明歌曲在收藏列表中
    }
    function toggleFavorite(song){
        let list
        if(isFavorite(song)){
            //remove
            list = remove(FAVORITE_KEY, compare)
        }else{
            //save
            list = save(song, FAVORITE_KEY,compare,maxLen)
        }
        store.commit('setFavoriteList', list)  //操作完后会返回新的list，此时利用本地存储，防止刷新后新list丢失
        //点击按钮，加入或移除收藏list，图标随之变换

        function compare(item){
            return item.id === song.id
        }
    }
    return{
        getFavoriteIcon,
        toggleFavorite
    }
}