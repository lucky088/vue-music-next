import { get } from './base'

export function getRecommend(){
    return get('/api/getRecommend')  //这个请求的url与后端代理接口的url一致
}

export function getAlbum(album){
    return get('api/getAlbum', {
        id: album.id
    })
}