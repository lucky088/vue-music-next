import { createRouter, createWebHashHistory } from "vue-router";  //路由组件的异步加载
const Recommend = () => import('@/views/recommend'/* webpackChunkName: "recommend" */)
const Singer = () => import('@/views/singer'/* webpackChunkName: "singer" */)
const TopList = () => import('@/views/top-list'/* webpackChunkName: "top-list" */)
const Search = () => import('@/views/search'/* webpackChunkName: "search" */)
const SingerDetail = () => import('@/views/singer-detail'/* webpackChunkName: "singer-detail" */)
const Album = () => import('@/views/album'/* webpackChunkName: "album" */)
const TopDetail = () => import('@/views/top-detail'/* webpackChunkName: "top-detail" */)
const UserCenter = () => import('@/views/user-center'/* webpackChunkName: "user-center" */)

 const routes = [
     {
        path:'/',
        redirect: './recommend'
     },  //访问的是根路径,会redirect到recommend路径,希望首页进入有默认组件显示
     {
         path: '/recommend',
         component: Recommend,
         children:[
             {
                 path: ':id',  //动态参数，根据点击推荐id不同，路由跳转页面不同
                 component: Album
             }
         ]
     },
     {
        path: '/singer',
        component: Singer,
        children:[
            {
                path: ':id',  //动态参数，不同的singer的id不一样
                component: SingerDetail
            }
        ]
    },
    {
       path: '/top-list',
       component: TopList,
       children:[
           {
               path:':id',
            component: TopDetail
        }
       ]
   },
   {
      path: '/search',
      component: Search,
      children:[
        {path:':id',
        component:SingerDetail}
      ]
  },
  {
      path:'/user',
      component: {
          user:UserCenter
      },
  }
 ]

 const router = createRouter({
    history: createWebHashHistory(process.env.BASE_URL),
    routes
  })
  
  export default router
  