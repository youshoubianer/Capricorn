/*
* chrome书签转为json
* you_shoubian
* 2016-8-18
*/

const fs = require('fs')

var arguments = process.argv.splice(2);
if(arguments.length<2){
  return 'error>> 参数错误'
}
else{
  var htmlPath = arguments[0]
  var jsonPath = arguments[1]
}

var html = fs.readFileSync(htmlPath,'utf-8')

//正则匹配 H3 和 A 标签
var H3_A_pattern = /((<H3.*>).*(<\/H3>))|(<DL>)|((<A.*).*(<\/A>))|(<\/DL>)/g
var bookmarkList = html.match(H3_A_pattern)

//定义匹配模式
var H3_info_pattern = /(ADD_DATE=\"[0-9]+\")|(LAST_MODIFIED=\"[0-9]+\")|>(.*)</g
var A_info_pattern = /(HREF=(\"|\'){1}([^\"])+)(\"|\'){1}|(ADD_DATE=\"[0-9]+\")|(ICON=\"([^\n\"\'])+\")|(\>.*\<)/g
var H3_test = /<H3/
var DL_test = /\<DL/
var DLend_test = /\<\/DL/
var A_test = /\<A/

//将标签文本转为json对象
var getInfo = function(str,pattern){
  var info_list = str.match(pattern)
  var info_obj = {}
  for(var info of info_list){
    info = info.split('=')
    if(info.length>1){
      info_obj[info[0]] = info[1].slice(1,info[1].length-1)
    }
    else{
      info_obj['name'] = info[0].slice(1,info[0].length-1)
    }
  }
  return info_obj
}

var len = bookmarkList.length
var A_list = []
var stack = []

for(var i = 1;i < len-2; i++){
  var item = bookmarkList[i]
  if(H3_test.test(item)){
    stack.push(getInfo(item,H3_info_pattern))
  }
  else if(DL_test.test(item)){
    stack.push([])
  }
  else if(A_test.test(item)){
    var A_info = getInfo(item,A_info_pattern)
    stack[stack.length-1].push(A_info)
  }
  else if(DLend_test.test(item)){
    var floder = stack[stack.length-1]
    var floder_info = stack[stack.length-2]
    floder_info['subBookMarks'] = floder
    stack[stack.length-3].push(floder_info)
    if(stack.length>2){
      stack.splice(-2)
    }
  }
  else{
    console.log(i,'err>>>>>>',item);
  }
}

stack[0]['subBookMarks'] = stack[1]
var jsonBookMarks = stack[0]

fs.writeFileSync(jsonPath,JSON.stringify(jsonBookMarks),'utf-8')
console.log('done!');









