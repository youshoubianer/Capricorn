/*
*   循环发送请求
*/

'use strict'

const request = require('request')
const url = 'http://182.92.155.97:8081/web/fun/ajax.aspx'
const delay = 500

let info = {}
setInterval(function(){
  request.post({url:url, formData: {'type': 'searchrand'}}, function optionalCallback(err, httpResponse, body) {
    if (err) {
      console.error('get info failed:', err);
      return
    }
    body = JSON.parse(body)
    info[body[0].carcode.trim()] = body[0].tel.trim()
    console.log('info>>',JSON.stringify(info));
    return
  })
},delay)
