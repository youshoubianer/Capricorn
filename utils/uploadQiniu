'use strict';

const qiniu = require('qiniu');
const path = require('path');
const moment = require('moment');
const request = require('request');

const accessKey = '<your accessKey>';
const secretKey = '<your secretKey>';
const qiniuConfig = new qiniu.conf.Config();
qiniuConfig.zone = qiniu.zone.Zone_z0;

/**
 * 获取上传token
 * @param {*} bucket 
 */
function generateUploadToken(bucket) {
  bucket = bucket || 'test';
  let options = {
    scope: bucket,
    expires: 7200
  };
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  let putPolicy = new qiniu.rs.PutPolicy(options);
  let uploadToken = putPolicy.uploadToken(mac);
  console.log('uploadToken:', uploadToken);
  return uploadToken;
}

/**
 * 上传本地文件
 * @param {* string} filename 
 */
function uploadLocalFile(filename) {

  let localFile = path.resolve(__dirname, filename);
  let formUploader = new qiniu.form_up.FormUploader(qiniuConfig);
  let putExtra = new qiniu.form_up.PutExtra();
  let key = path.basename(localFile);
  let uploadToken = generateUploadToken();

  // 文件上传
  return new Promise((resolve, reject) => {
    formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
      if (respErr) {
        return reject(respErr);
      }
      return resolve({
        statusCode: respInfo.statusCode,
        respBody,
      })
    });
  })
}

/**
 * 上传字节数组
 * @param {*} buffer 内容
 * @param {*} key 存储文件名
 */
function uploadBuffer(buffer, key) {
  console.time('upload');
  let formUploader = new qiniu.form_up.FormUploader(qiniuConfig);
  let putExtra = new qiniu.form_up.PutExtra();
  key = key || `${moment().format('YYYYMMDDHHmmSS')}-Unknown.jpg`;
  let uploadToken = generateUploadToken();
  // 文件上传
  return new Promise((resolve, reject) => {
    formUploader.put(uploadToken, key, buffer, putExtra, function (respErr, respBody, respInfo) {
      console.timeEnd('upload');
      if (respErr) {
        return reject(respErr);
      }
      return resolve({
        statusCode: respInfo.statusCode,
        respBody,
      })
    });
  })
}


/**
 * get a image from web
 * @param {*} url 
 */
function getImageFromWeb(url) {
  console.time('getimage')
  return new Promise((resolve, reject) => {
    url = url || 'https://d3cbihxaqsuq0s.cloudfront.net/images/22062748_xl.jpg'
    let requestOpt = {
      url: url,
      method: 'GET',
      encoding: null,
    }
    request(requestOpt, function (error, resp, respBody) {
      console.timeEnd('getimage');
      if (error) {
        return reject(error);
      }
      return resolve({
        respBody,
        filename: path.basename(url)
      });
    })
  });
}

// 上传本地文件
// let filename = './path/to/file.jpg';
// uploadLocalFile(filename).then(res => console.log(res))

// 上传字节数组
getImageFromWeb().then(resp => {
  return uploadBuffer(resp.respBody, resp.filename)
}).then(res => {
  console.log(res)
}).catch(error => {
  console.log(error)
})
