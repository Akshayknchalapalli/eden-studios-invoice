/* Keep fitting independent of form, storage, fonts and export initialization. */
(function(){
 'use strict';
 var currentZoom=1;
 function fit(multiplier){
  if(typeof multiplier==='number')currentZoom=multiplier;
  var wrap=document.getElementById('previewWrap');
  var stage=document.getElementById('previewStage');
  var preview=document.getElementById('preview');
  if(!wrap||!stage||!preview)return;
  var style=window.getComputedStyle(wrap);
  var available=wrap.clientWidth-(parseFloat(style.paddingLeft)||0)-(parseFloat(style.paddingRight)||0);
  if(available<=0)return;
  var scale=available/794*currentZoom;
  preview.style.transform='scale('+scale+')';
  preview.style.webkitTransform='scale('+scale+')';
  stage.style.width=(794*scale)+'px';
  stage.style.height=(1123*scale)+'px';
 }
 window.fitInvoicePreview=fit;
 fit();
 window.addEventListener('resize',function(){fit();});
 window.addEventListener('orientationchange',function(){fit();});
 window.addEventListener('pageshow',function(){fit();});
 if(typeof window.ResizeObserver==='function'){
  try{new window.ResizeObserver(function(){fit();}).observe(document.getElementById('previewWrap'));}catch(error){}
 }
})();
