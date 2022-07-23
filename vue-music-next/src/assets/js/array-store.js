//对歌曲的收藏和取消收藏--对歌曲加入播放歌单和移除等相似逻辑，都是把数据往store中存储
//通用模块：local-storage
import storage from "good-storage"

function insertArray(arr, val, compare, maxLen){
    /*存储前先判断原缓存列表中是否已包含了对象，但不能用indexof判断，
    由于存储是对象结构。有时虽存储的是不同的对象（在推荐中和在排行榜或歌单或搜索中，添加歌曲到播放列表，此时可能添加曲目相同但所在对象形式不同）
    因此可能存入的不同对象，对应歌曲id是相同的（存的是同一首歌的数据），故不能比较index，要比较其他的（传入的compare里具体说明要比较什么，比如id，比较类型由对应功能界面实现*/
    const index = arr.findIndex(compare) //用compare比对存入的数据在数组中是否已经存在
    if(index === 0){  //查找歌曲在，且已经是最近播放第一个，不用动
        return
    }
    if(index > 0){ //查找歌曲在最近播放列表，先删除后面逻辑会添加
        arr.splice(index, 1)
    }
    arr.unshift(val)
    if(maxLen && arr.length > maxLen){
        arr.pop()  // 队列，先进先出
    }
}

function deleteFromArray(arr, compare){  //compare是遍历对比arr中每一项数据某个属性的函数
    /* 不需要传入具体删除item，只需传入对应逻辑页面指定遍历的对比函数compare，
    在storage缓存列表中，根据对比函数中指定对比属性，得到需要删除元素对象，输出缓存列表对应索引，进行删除*/
    const index = arr.findIndex(compare)
    if(index > -1){
        arr.splice(index, 1)
    }
}

export function save(item, key, compare, maxLen){  //支持用于传入compare函数，函数具体实现细节由外部决定
    //保存到localStorage里的逻辑，item是需要保存的对象，key是类型（存储是收藏列表还是搜索记录列表还是播放列表等）
    const items = storage.get(key, [])  //先从storage中读出现有元素，默认值为[]
    insertArray(items, item, compare, maxLen)
    storage.set(key, items)
    return items
}

export function remove(key, compare){
    //不需要传入具体删除item，只需传入对应功能列表对比方式的比较函数
    const items = storage.get(key, [])
    deleteFromArray(items, compare)
    storage.set(key, items)
    return items
}

//保证刷新界面后，从store读取数据，此时列表初始化为空，故初始化要设置加载数据的功能，从本地存储中获取之前缓存数据
export function load(key){
    return storage.get(key, [])
}

export function clear(key){
    storage.remove(key)
    return []
}

export function saveAll(items, key){
    storage.set(key, items)
}