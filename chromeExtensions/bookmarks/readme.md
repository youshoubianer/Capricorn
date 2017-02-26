# chrome 插件开发

[toc]

需求：通过chrome插件获取书签
## 1. 结构目录
> manifest.json  
popup.html  
popup.js  
icon.png

## 2. manifest.json
chrome插件的配置文件
```
"manifest_version": 2,
//manifest文件自身格式的版本号，从Chrome 18开始，指定版本号为2
```
```
"name": "bookmarksExport",    //插件名称
"description": "This extension description",  //插件描述 
"version": "1.0",     //插件版本号
```

```
"browser_action": {
    "default_icon": "icon.png",     //图标
    "default_popup": "popup.html",  //显示的内容
    "default_title": "Click here!"
},

//在chrome主工具条的地址栏右侧增加一个图标，还有Page Actions在地址栏增加图标
```
```
"permissions": [
    "<all_urls>", 
    "bookmarks",
    "tabs",
    "notifications"
]

//使用的权限，参见文档
//以上四个分别是“所有网址、书签、标签页、通知”
```

## 2. popup.html
点击工具栏的插件图标后显示的内容主体
为html页面

## 3. popup.js
根据需求写插件行为

demo为书签的获取，参考接口就ok
并根据api定义的行为进行更新


参考文档：  
[google chrome API](https://developer.chrome.com/extensions/api_index)  
[360 翻译中文文档](http://open.chrome.360.cn/extension_dev/overview.html)

