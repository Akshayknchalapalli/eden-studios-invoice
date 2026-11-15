const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../dist/preview-fit.js'),'utf8');
for(const available of [198,240,280,310,350,600]){
 const wrap={clientWidth:available+8},stage={style:{}},preview={style:{}};const listeners={};
 const window={getComputedStyle:()=>({paddingLeft:'4px',paddingRight:'4px'}),addEventListener:(event,fn)=>listeners[event]=fn};
 const document={getElementById:id=>({previewWrap:wrap,previewStage:stage,preview})[id]};
 vm.runInNewContext(source,{window,document,parseFloat});
 function check(multiplier){const scale=Number(preview.style.transform.slice(6,-1));assert.ok(Math.abs(scale*794-available*multiplier)<.001);assert.ok(Math.abs(parseFloat(stage.style.width)-available*multiplier)<.001);assert.ok(Math.abs(parseFloat(stage.style.height)-1123*scale)<.001);assert.equal(preview.style.webkitTransform,preview.style.transform);}
 check(1);window.fitInvoicePreview(2);check(2);window.fitInvoicePreview(1);check(1);
 wrap.clientWidth+=20;listeners.resize();assert.ok(Math.abs(parseFloat(stage.style.width)-(available+20))<.001);
}
for(const name of ['dist/index.html','index.html']){const html=fs.readFileSync(path.join(__dirname,'..',name),'utf8');assert.ok(!/<foreignObject\b/i.test(html));assert.ok(html.includes('<div class="preview" id="preview">'));assert.ok(html.includes('fitInvoicePreview')||html.includes('preview-fit.js'));}
console.log('PASS: complete A4 fit, stage height, zoom, WebKit transform and resize without ResizeObserver at six widths; no foreignObject wrapper.');
