(function () {
  var uploaddFile = {};
  $('#imgContainer').bind('paste', function () {
    //for chrome
    var clipboardData = event.clipboardData;
    if (!uploaddFile) {
      uploaddFile = {};
    }
    for (var i = 0; i < clipboardData.items.length; i++) {
      var item = clipboardData.items[i];
      if (item.kind == 'file' && item.type.match(/^image\//i)) {
        //blob就是剪贴板中的二进制图片数据
        var blob = item.getAsFile();
        var reader = new FileReader();
        //定义fileReader读取完数据后的回调
        reader.onload = function () {
          uploaddFile[$.md5(event.target.result)] = blob
          var sHtml = '<img src="' + event.target.result + '">'; //result应该是base64编码后的图片
          document.getElementById('imgContainer').innerHTML += sHtml;
        }
        reader.readAsDataURL(blob); //用fileReader读取二进制图片，完成后会调用上面定义的回调函数
      }
    }
  });

  $("#uploadBtn").click(function () {
    if (!uploaddFile || Object.keys(uploaddFile).length <= 0) {
      $('body').append('<div><span class="spanError">队列已全部上传！</span></div>')
      return false;
    }
    var token = '';
    var cdn = '';

    for (var md5Key in uploaddFile) {
      var key = 'screen-' + md5Key + '-' + (new Date().getTime());
      uploadToQiniu(token, key, uploaddFile[md5Key], function (error, res) {
        var resSpan = '';
        if (error) {
          resSpan = '<div><span class="spanError">error: ' + key + '</span></div>'
        } else {
          resSpan = '<div><span class="spanSuccess">success: <a class="spanSuccess" target="_blank" href="' + cdn + '/' + key + '">' + key + '</a></span></div>'
          delete uploaddFile[md5Key]
        }
        $('body').append(resSpan)
      });
    }
  })

  function uploadToQiniu(token, key, file, callback) {
    var uploadUrl = 'http://up.qiniu.com';
    var formData = new FormData();
    formData.append('key', key);
    formData.append('token', token);
    formData.append('file', file);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl, true);
    xhr.onreadystatechange = function (response) {
      if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
        var uploadRes = JSON.parse(xhr.responseText);
        callback(null, uploadRes)
      } else if (xhr.status != 200 && xhr.responseText) {
        callback(xhr.responseTexts)
      }
    };
    xhr.send(formData);
  }
}())