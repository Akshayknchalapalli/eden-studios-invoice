// Exercise form synchronization with embedded-viewer APIs intentionally missing.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const elements=new Map();let latest=null;
function element(id='',type='text'){
 const el={id,type,value:'',checked:false,dataset:{},style:{},validity:{valid:true},listeners:{},textContent:'',hidden:false,
 addEventListener(event,fn){(this.listeners[event]||(this.listeners[event]=[])).push(fn)},
 setAttribute(){},append(child){if(child&&child.id)elements.set(child.id,child)},scrollIntoView(){},
 set innerHTML(value){register(value)},get innerHTML(){return ''}};
 if(id)elements.set(id,el);return el;
}
function attrs(tag){const result={};for(const m of tag.matchAll(/([\w-]+)="([^"]*)"/g))result[m[1]]=m[2];return result;}
function register(markup){for(const m of markup.matchAll(/<(input|textarea|select|[\w]+)\b[^>]*>/g)){const a=attrs(m[0]);if(!a.id)continue;const el=element(a.id,a.type||'text');el.value=a.value||'';if(a['data-check'])el.dataset.check=a['data-check'];el.readonly=/\breadonly\b/.test(m[0]);el.formControl=['input','textarea','select'].includes(m[1]);}}
register(html);
const editor=html.slice(html.indexOf('<div id="editor">'),html.indexOf('<section class="card" id="previewCard">'));
const editorIds=new Set([...editor.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
const doc={getElementById:id=>elements.get(id),createElement:()=>element(),querySelectorAll(selector){
 if(selector==='[data-check]')return [...elements.values()].filter(el=>el.dataset.check);
 if(selector.startsWith('#editor input'))return [...elements.values()].filter(el=>el.formControl&&!el.readonly&&(editorIds.has(el.id)||/^(desc|qty|rate)\d+$/.test(el.id)));
 if(selector==='a[href="#previewCard"]')return [];
 throw new Error('Unexpected selector '+selector);
}};
const sandbox={document:doc,window:{addEventListener(){},scrollTo(){}},localStorage:{getItem(){throw new Error('storage unavailable')},setItem(){throw new Error('storage unavailable')}},navigator:{},setTimeout:()=>1,clearTimeout(){},console,confirm:()=>false,buildInvoiceDOM(){},updateInvoiceDOM(node,data){latest=JSON.parse(JSON.stringify(data));return []}};
const context=vm.createContext(sandbox);
vm.runInContext('Object.fromEntries=undefined;Element=undefined;',context);
vm.runInContext(fs.readFileSync(path.join(root,'dist/invoice-math.js'),'utf8'),context);
const source=process.argv[2]?fs.readFileSync(process.argv[2],'utf8'):fs.readFileSync(path.join(root,'dist/app.js'),'utf8');
vm.runInContext(source,context);
function edit(id,value,event='input'){const el=elements.get(id);el.value=value;for(const fn of el.listeners[event]||[])fn();}
assert.equal(elements.has('service_score'),false);assert.equal(elements.has('qty6'),false);assert.equal(latest.rows.length,0);
assert.equal(elements.get('previewEmpty').hidden,false);assert.equal(elements.get('previewWrap').hidden,true);assert.equal(elements.get('downloadBtn').disabled,true);
assert.equal(elements.get('serviceEmpty').hidden,false);
for(const i of [1,2,3,4,5,7,8,9,10,11,12,13])assert.equal(elements.get('serviceLine'+i).hidden,true);
function select(key,value){const el=elements.get('service_'+key);el.checked=value;el.listeners.change.forEach(fn=>fn());}
edit('f_customer','Phone customer');assert.equal(latest.customer,'Phone customer');
edit('f_address','Mobile company','change');assert.equal(latest.address,'Mobile company');
edit('f_reference','Mobile reference','blur');assert.equal(latest.reference,'Mobile reference');
select('music',true);assert.equal(elements.get('previewEmpty').hidden,true);assert.equal(elements.get('previewWrap').hidden,false);assert.equal(elements.get('downloadBtn').disabled,false);assert.equal(latest.rows.length,1);assert.equal(latest.rows[0].description,'Music composition');
assert.equal(elements.get('serviceLine1').hidden,false);assert.equal(elements.get('serviceLine2').hidden,true);
edit('desc1','Music session');edit('qty1','2');edit('rate1','8000');edit('f_discount','500');edit('f_taxrate','18');assert.equal(latest.grand,18290);assert.equal(latest.rows[0].description,'Music session');
select('score_sfx',true);assert.equal(latest.rows.length,2);assert.equal(latest.checks.score_sfx,true);assert.equal(latest.rows[1].description,'Background Score SFX');
edit('rate9','1000');assert.equal(latest.grand,19470);
select('music',false);assert.equal(latest.rows.length,1);assert.equal(latest.rows[0].description,'Background Score SFX');assert.equal(latest.grand,590);
assert.equal(elements.get('qty1').value,'');assert.equal(elements.get('rate1').value,'');assert.equal(elements.get('amountLabel1').textContent,'Amount: ₹0.00');
select('music',true);assert.equal(elements.get('qty1').value,'1');assert.equal(elements.get('rate1').value,'');assert.equal(latest.grand,590);
edit('rate1','8000');assert.equal(latest.grand,10030);
edit('f_payment','UPI','change');assert.equal(latest.payment,'UPI');
for(const [key,index,label] of [['short_film_score',11,'Short Film Background Score'],['sound_sfx',12,'Sound SFX'],['foley_recording',13,'Foley Recording']]){
 select(key,true);edit('rate'+index,'100');assert.equal(latest.rows[latest.rows.length-1].description,label);assert.equal(latest.checks[key],true);select(key,false);assert.equal(elements.get('serviceLine'+index).hidden,true);
}
for(const el of [...elements.values()].filter(el=>el.dataset.check))select(el.dataset.check,true);
assert.equal(latest.rows.length,12);assert.equal(elements.get('serviceEmpty').hidden,true);
for(const el of [...elements.values()].filter(el=>el.dataset.check))select(el.dataset.check,false);
edit('f_discount','0');
for(const el of [...elements.values()].filter(el=>el.dataset.check)){
 const key=el.dataset.check;select(key,true);
 const active=[...elements.values()].find(row=>row.id&&/^serviceLine\d+$/.test(row.id)&&!row.hidden);const i=active.id.replace('serviceLine','');
 assert.equal(elements.get('qty'+i).value,'1',key);assert.equal(elements.get('rate'+i).value,'',key);
 edit('qty'+i,'4');edit('rate'+i,'125');assert.equal(latest.subtotal,500,key);
 select(key,false);assert.equal(elements.get('qty'+i).value,'',key);assert.equal(elements.get('rate'+i).value,'',key);assert.equal(latest.subtotal,0,key);
 select(key,true);assert.equal(elements.get('qty'+i).value,'1',key);assert.equal(elements.get('rate'+i).value,'',key);select(key,false);
}
assert.equal(elements.get('previewEmpty').hidden,false);assert.equal(elements.get('previewWrap').hidden,true);assert.equal(elements.get('downloadBtn').disabled,true);assert.equal(latest.rows.length,0);assert.equal(latest.grand,0);assert.equal(elements.get('serviceEmpty').hidden,false);
const legacy={version:1,values:[{id:'service_mix',checked:true,value:'on'},{id:'desc1',value:'Legacy mix'},{id:'qty1',value:'3'},{id:'rate1',value:'500'}]};context.restoreServiceDraft(legacy);assert.equal(legacy.values.find(v=>v.id==='desc4').value,'Legacy mix');assert.equal(legacy.values.find(v=>v.id==='qty4').value,'3');
// Restored selected services default only missing quantities; valid custom values survive.
function checkRestoredQuantity(quantity,expected){
 const draft={version:2,values:[{id:'service_score',checked:true,value:'on'},{id:'qty6',value:'9'},{id:'rate6',value:'9999'},{id:'service_live',checked:true,value:'on'},{id:'qty7',value:quantity},{id:'rate7',value:'250'},{id:'f_taxrate',value:'0'}]};
 const restored=vm.createContext({...sandbox,localStorage:{getItem:()=>JSON.stringify(draft),setItem(){}}});
 vm.runInContext(fs.readFileSync(path.join(root,'dist/invoice-math.js'),'utf8'),restored);
 vm.runInContext(source,restored);
 assert.equal(elements.get('qty7').value,expected);
 assert.equal(latest.rows[0].description,'Live instruments recording');
 assert.equal(latest.subtotal,Number(expected)*250);
}
checkRestoredQuantity('','1');checkRestoredQuantity('3','3');
setImmediate(()=>{assert.equal(latest.customer,'Phone customer');console.log('PASS: zero/one/twelve selected service lines, cleared quantities/rates, default quantity 1 on reselection, removed amounts, blur/change events and totals without Object.fromEntries, font/image APIs, sharing or localStorage.');});
