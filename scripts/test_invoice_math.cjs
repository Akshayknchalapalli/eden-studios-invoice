const assert=require('node:assert/strict');
const {calculateInvoiceAmounts:calc}=require('../dist/invoice-math.js');
const line=(quantity,rate)=>({label:'Music composition',quantity,rate});
let result=calc([],'0','0');assert.equal(result.grand,0);assert.deepEqual(result.errors,[]);
result=calc([line('2','8000')],'500','18');assert.equal(result.subtotal,16000);assert.equal(result.discount,500);assert.equal(result.taxable,15500);assert.equal(result.tax,2790);assert.equal(result.grand,18290);assert.deepEqual(result.errors,[]);
result=calc([line('0.25','199.99'),line('0.1','0.05')],'0','18');assert.equal(result.rows[0].amount,50);assert.equal(result.rows[1].amount,.01);assert.equal(result.subtotal,50.01);assert.equal(result.tax,9);assert.equal(result.grand,59.01);
result=calc([line('1','0')],'0','0');assert.equal(result.grand,0);assert.deepEqual(result.errors,[]);
for(const [q,r] of [['0','100'],['-1','100'],['1','-1'],['','100'],['1',''],['1.111','100'],['1','0.001'],['1','1e3'],['NaN','100'],['1','999999999999999999999999']])assert.ok(calc([line(q,r)],'0','18').errors.length,[q,r].join(','));
for(const [d,t] of [['101','18'],['-1','18'],['0','101'],['0','-1'],['1.234','18'],['0','18.001']]){result=calc([line('1','100')],d,t);assert.ok(result.errors.length);assert.ok(Number.isFinite(result.grand));assert.ok(result.grand>=0);}
result=calc([line('1','100')],'100','18');assert.equal(result.grand,0);assert.equal(result.tax,0);
result=calc(Array.from({length:10},()=>line('1','100')),'100','18');assert.equal(result.grand,1062);assert.equal(result.rows.length,10);
result=calc(Array.from({length:13},()=>line('1','100')),'100','18');assert.equal(result.grand,1416);assert.equal(result.rows.length,13);
console.log('PASS: quantity/rate multiplication, paise rounding, discount-before-tax, zero-priced work, ten services and invalid input boundaries.');
