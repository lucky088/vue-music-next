import axios from 'axios'

const ERR_OK = 0
const baseURL =  process.env.NODE_ENV === 'production'? 'http://usthuangyi.com/music-next':'/'

axios.defaults.baseURL = baseURL
//前端发送请求函数的封装
export function get (url, params) {
    return axios.get(url, {
      params
    }).then((res) => {
      const serverData = res.data
      if (serverData.code === ERR_OK) {
        return serverData.result
      }
    }).catch((e) => {
      console.log(e)
    })
  }