// 工具函数集合

//洗牌函数
export function shuffle(source){
    const arr = source.slice()  //不会修改原数组
    for(let i = 0; i < arr.length; i++){
        const j = getRandomInt(i);
        swap(arr,j,i)
    }
    return arr
}
function getRandomInt(max){  //取0-max之间随机数
    return Math.floor(Math.random() * (max + 1))
}
function swap(arr, i, j){
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t
}

//格式化时间（转毫秒为。。）
export function formatTime(interval){
    interval = interval | 0
    const minute = ((interval / 60 | 0) + '').padStart(2, '0')  //将计算的分钟数变成字符串后，不足两位则往前填充0
    const second = ((interval % 60 ) + '').padStart(2, '0')
    return `${minute}:${second}`
}