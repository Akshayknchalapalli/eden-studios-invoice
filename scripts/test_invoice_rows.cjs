const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const values=[];const tableRows=Array.from({length:10},()=>({hidden:false}));let compact=false;
for(let i=0;i<10;i++)for(const column of ['description','quantity','rateText','amountText'])values.push({dataset:{row:String(i),column},style:{},scrollWidth:100,clientWidth:100,scrollHeight:20,clientHeight:20,setAttribute(){}});
const root={querySelector:()=>({classList:{toggle(name,state){compact=state}}}),querySelectorAll(selector){
 if(selector==='#invoiceTableBody tr')return tableRows;
 if(selector==='[data-row]'||selector==='[data-field],[data-row],[data-total]')return values;
 return [];
}};
const context=vm.createContext({getComputedStyle:()=>({getPropertyValue:()=> '12px'})});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/invoice-renderer.js'),'utf8'),context);
for(const count of [0,1,2,6,7,10]){
 const rows=Array.from({length:count},(_,i)=>({description:'Selected service '+i,quantity:'1',rateText:'100.00',amountText:'100.00'}));
 context.updateInvoiceDOM(root,{rows,checks:{}});
 assert.equal(tableRows.filter(row=>!row.hidden).length,count);assert.equal(compact,count>6);
 for(const value of values)assert.equal(value.textContent,rows[Number(value.dataset.row)]?rows[Number(value.dataset.row)][value.dataset.column]:'');
}
console.log('PASS: native invoice displays exactly the selected rows, clears removed services and compacts seven to ten lines.');
