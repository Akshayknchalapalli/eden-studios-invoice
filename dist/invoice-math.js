'use strict';
// Decimal inputs are converted to hundredths before money calculations.
function invoiceHundredths(value){
 const text=String(value==null?'':value).trim();
 if(!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(text))return null;
 const parts=text.split('.'),result=Number(parts[0]||0)*100+Number(((parts[1]||'')+'00').slice(0,2));
 return Number.isSafeInteger(result)?result:null;
}
function calculateInvoiceAmounts(lines,discountValue,taxValue){
 const errors=[];let subtotalMinor=0;
 const rows=lines.map(line=>{
  const quantity=invoiceHundredths(line.quantity),rate=invoiceHundredths(line.rate);
  let amountMinor=0;
  if(quantity===null||quantity<=0)errors.push(line.label+': enter a quantity greater than zero, with at most 2 decimal places.');
  if(rate===null)errors.push(line.label+': enter a non-negative rate, with at most 2 decimal places.');
  if(quantity!==null&&quantity>0&&rate!==null){
   const product=quantity*rate;
   if(!Number.isSafeInteger(product))errors.push(line.label+': quantity or rate is too large.');
   else amountMinor=Math.round(product/100);
  }
  if(!Number.isSafeInteger(subtotalMinor+amountMinor)){errors.push('The invoice total is too large.');amountMinor=0;}
  subtotalMinor+=amountMinor;
  return {amountMinor,amount:amountMinor/100};
 });
 let discountMinor=invoiceHundredths(discountValue===''?'0':discountValue);
 if(discountMinor===null){errors.push('Enter a non-negative discount with at most 2 decimal places.');discountMinor=0;}
 if(discountMinor>subtotalMinor){errors.push('Discount cannot exceed the subtotal.');discountMinor=subtotalMinor;}
 let taxBasisPoints=invoiceHundredths(taxValue===''?'0':taxValue);
 if(taxBasisPoints===null||taxBasisPoints>10000){errors.push('Enter a GST / tax rate from 0 to 100, with at most 2 decimal places.');taxBasisPoints=0;}
 const taxableMinor=subtotalMinor-discountMinor;
 const taxProduct=taxableMinor*taxBasisPoints;
 let taxMinor=0;
 if(!Number.isSafeInteger(taxProduct))errors.push('The taxable amount is too large.');else taxMinor=Math.round(taxProduct/10000);
 const grandMinor=taxableMinor+taxMinor;
 if(!Number.isSafeInteger(grandMinor))errors.push('The invoice total is too large.');
 return {rows,subtotal:subtotalMinor/100,discount:discountMinor/100,taxable:taxableMinor/100,taxRate:taxBasisPoints/100,tax:taxMinor/100,grand:grandMinor/100,errors};
}
if(typeof module!=='undefined'&&module.exports)module.exports={invoiceHundredths,calculateInvoiceAmounts};
