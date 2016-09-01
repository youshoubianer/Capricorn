'use strict'
var lodash = {}

// 将数组拆分成多个 size 长度的块，并组成一个新数组。 
// 如果数组无法被分割成全部等长的块，那么最后剩余的元素将组成一个块。
function chunk(array, size){
  if(!size){
    size = 1
  }
  var temp =[],
      res = [],
      idx = 0,
      len = array.length
  while(idx<len){
    temp.push(array[idx++])
    if(idx % size == 0){
      res.push(temp)
      temp = []
    }
  }
  if(len%size!=0){
    res.push(temp)
  }
  return res
}

// 创建一个移除了所有假值的数组。
// 例如：false、null、 0、""、undefined， 以及NaN 都是 “假值”.
function compact(array){
  var res = []
  for(var item of array){
    if(item){
      res.push(item)
    }
  }
  return res
}

//创建一个用任何数组 或 值连接的新数组。
function concat(){
  var length = arguments.length,
      array = arguments[0],
      res = []
  for(var idx = 0; idx < length; idx++){
    if(arguments[idx] instanceof Array){
      for(var item of arguments[idx]){
        res.push(item)
      }
    }
    else{
      res.push(arguments[idx])
    }
  }
  return res
}

// 创建一个差异化后的数组,
// 把a中元素在b出现的剔除剔除，a减去a和b的交集的结果
function difference(array,value) {
  var res = [],
      len = array.length,
      idx = -1,
      lenB = value.length,
      idxB = -1,
      flag = false
  while(++idx < len){
    idxB = -1
    flag = false
    while(++idxB < lenB){
      if(array[idx] == value[idxB]){
        flag = true
        break
      }
    }
    if(!flag){
      res.push(array[idx])
    }
  }
  return res
}




lodash.difference = difference
lodash.concat = concat
lodash.compact = compact
lodash.chunk = chunk
module.exports = lodash