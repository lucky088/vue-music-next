import MusicList from '@/components/music-list/music-list'
import storage from 'good-storage'
import { processSongs } from '@/service/song'
//创建歌单详情界面和歌手详情界面的模板
export default function createDetailComponent(name, key, fetch) {
    return { 
    name,
    components: { MusicList },
    props: {
        data: Object  //传入不同的singer，渲染不同的歌手数据
    },
    data(){
      return{
        songs:[],
        loading:true
      }
    },
    computed: {
      computedData(){
        /*在歌手详情界面刷新界面（渲染当前组件）时会判断，如果已通过props传入了这个singer，就优先选择；
        否则从本地缓存存储中拿，接收sessionstorage存储的singer，拿到singer的mid和当前路由path的参数上mid对比，
        匹配成功则代表是在当前页面刷新的，此时即可拿到对应歌手，渲染页面 
        */
        let ret = null
        const data = this.data
        if(data){
          ret = data
        }else{
          const cached = storage.session.get(key)
          if(cached && (cached.mid || cached.id + '') === this.$route.params.id){
            ret = cached
            //若二者相等则代表是在当前页面刷新渲染
          }
        }
        return ret
      },
      pic(){
        const data = this.computedData
        return data && data.pic
      },
      title(){
        const data = this.computedData
        return data && (data.name || data.title)
      }
    },
    async created(){
      const data = this.computedData //防止后面多次使用造成多次依赖收集
      if(!data){
        const path = this.$route.matched[0].path  //拿到一级路由path
        this.$router.push({path})
        return 
      }
        const result = await fetch(data);  //不再使用then，await等promise完成之后直接返回最终结果，这里的result已经是服务器返回的响应数据了
        this.songs = await processSongs(result.songs)
        this.loading = false
    }}
} 