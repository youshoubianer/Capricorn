(function(){
  
  //更新标签树
  function updateTree(){
    chrome.bookmarks.getTree(function(tree){
      console.log(tree);
      //Todo:send to server and update client
      
    })
  }
  
  function log(id, changeInfo){
    console.log('id:',id,'\nchengeInfo>>\n',changeInfo);
  }
  
  //初始加载已有书签
  updateTree()

  //当书签或者书签夹发生改变时触发该事件
  chrome.bookmarks.onChanged.addListener(function(id, changeInfo) {
    log(id, changeInfo)
    updateTree()
  });
  
  //由于UI中的顺序发生改变时，书签夹会改变其子节点的顺序，此时会触发该事件
  chrome.bookmarks.onChildrenReordered.addListener(function(id, changeInfo) {
    log(id, changeInfo)
    updateTree()
  });
  
  //当创建书签或者书签夹夹时，会触发该事件
  chrome.bookmarks.onCreated.addListener(function(id, changeInfo) {
    log(id, changeInfo)
    updateTree()
  });
  
  //当开始导入书签时，会触发该事件
  chrome.bookmarks.onImportBegan.addListener(function(id, changeInfo) {
    log(id, changeInfo)
    updateTree()
  });
  
  //当导入书签结束时，会触发该事件
  chrome.bookmarks.onImportEnded.addListener(function(id, changeInfo) {
    log(id, changeInfo)
    updateTree()
  });
  
  //当书签或者书签夹被移动到其他父书签夹时，触发该事件
  chrome.bookmarks.onMoved.addListener(function(id, changeInfo) {
    log(id, changeInfo)
    updateTree()
  });
  
  //当书签和书签夹被删除时，触发该事件
  //当递归删除书签夹时，只会触发一个节点删除事件，它的子节点不会触发节点删除事件
  chrome.bookmarks.onRemoved.addListener(function(id, changeInfo) {
    log(id, changeInfo)
    updateTree()
  });
  
}());