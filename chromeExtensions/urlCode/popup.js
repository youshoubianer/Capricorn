(function(){
  
chrome.tabs.getSelected(function(tabs){
  $('#qrCodeTitle')[0].innerHTML = tabs.title;
  $('#qrCodeUrl')[0].innerHTML = tabs.url;
  $('#qrContainer').qrcode({
    render:"canvas",
    height:150, 
    width:150,
    correctLevel:0,
    text:tabs.url
  }); 
})
  
}());