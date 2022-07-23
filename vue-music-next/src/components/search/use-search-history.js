import { save, remove, clear } from '@/assets/js/array-store'
import { SEARCH_KEY } from '@/assets/js/constant'
import {useStore} from 'vuex'
export default function useSearchHistory(){
    const maxLen = 200
    const store = useStore()
    function saveSearch(query){
        //搜索界面中搜索历史列表的逻辑操作
        const searches = save(query, SEARCH_KEY, ()=>{
            return item === query
        }, maxLen)
        store.commit('setSearchHistory', searches)
    }
    function deleteSearch(query){
        const searches = remove(SEARCH_KEY,()=>{
            return item === query
        })
        store.commit('setSearchHistory', searches)
    }
    function clearSearch(){
        const searches = clear(SEARCH_KEY)
        store.commit('setSearchHistory', searches)
    }
    return {saveSearch, deleteSearch, clearSearch}
}