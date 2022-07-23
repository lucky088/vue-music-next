import { createStore, createLogger } from 'vuex'  //可以在开发环境下使用createlogger插件查看提交状态
import state from './state'  
import mutations from './mutations'  //这两个对应默认导出export default
import * as getters from './getters'
import * as actions from './actions'  //这里是部分导出

const debug = process.env.NODE_ENV !== 'production'  //开发环境

export default createStore({
  state,
  mutations,
  actions,
  getters,
  strict: debug,   //检查状态state的修改是不是在提交mutations的时候，只在开发环境下开启
  plugins: debug ? [createLogger()] : []
})
