const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const totals=['advance','subtotal','discount','tax','grand','balance'].map(total=>({dataset:{total},style:{},scrollWidth:100,clientWidth:100,scrollHeight:20,clientHeight:20,setAttribute(){}}));
const values=[];const tableRows=Array.from({length:14},()=>({hidden:false}));let compact=false,many=false;
for(let i=0;i<14;i++)for(const column of ['description','quantity','rateText','amountText'])values.push({dataset:{row:String(i),column},style:{},scrollWidth:100,clientWidth:100,scrollHeight:20,clientHeight:20,setAttribute(){}});
const root={classList:{toggle(name,state){many=state}},querySelector:()=>({classList:{toggle(name,state){compact=state}}}),querySelectorAll(selector){
 if(selector==='#invoiceTableBody tr')return tableRows;
 if(selector==='[data-total]')return totals;
 if(selector==='[data-row]')return values;
 if(selector==='[data-field],[data-row],[data-total]')return values.concat(totals);
 return [];
}};
const context=vm.createContext({getComputedStyle:()=>({getPropertyValue:()=> '12px'})});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/invoice-renderer.js'),'utf8'),context);
for(const count of [0,1,2,6,7,10,11,12,13,14]){
 const rows=Array.from({length:count},(_,i)=>({description:'Selected service '+i,quantity:'1',rateText:'100.00',amountText:'100.00'}));
 context.updateInvoiceDOM(root,{rows,checks:{},advance:count?25:0,subtotal:count*100,discount:0,tax:0,grand:count*100,balance:Math.max(0,count*100-25)});
 assert.equal(totals.find(el=>el.dataset.total==='advance').textContent,count?'25.00':'0.00');assert.equal(totals.find(el=>el.dataset.total==='balance').textContent,Math.max(0,count*100-25).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}));
 assert.equal(tableRows.filter(row=>!row.hidden).length,count);assert.equal(compact,count>6);assert.equal(many,count>10);
 for(const value of values)assert.equal(value.textContent,rows[Number(value.dataset.row)]?rows[Number(value.dataset.row)][value.dataset.column]:'');
}
console.log('PASS: native invoice displays exactly the selected rows, clears removed services and compacts seven to fourteen lines.');
