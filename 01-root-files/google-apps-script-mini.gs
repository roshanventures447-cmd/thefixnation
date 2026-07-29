var SPREADSHEET_ID = '1Czn3xP1VHtUHuMLaYfMG-b_VmvonSN2cpnDhfRFI4oo';
var WORKER_SPREADSHEET_ID = '1nmu4BCtJ4pfC46-_YYDr25SEPEQ1TTXp7Tqed7F7T8I';
var CUSTOMER_SHEET_NAME = 'Customer Leads';
var WORKER_SHEET_NAME = 'Worker Leads';
var NOTIFICATION_EMAIL = 'roshanventures447@gmail.com';
var HEADERS = ['serverReceivedAt','updatedAt','submittedAt','submissionId','formType','source','pageUrl','name','email','phone','city','address','latitude','longitude','googleMapsUrl','service','serviceCount','skill','experience','serviceArea','ownTools','transport','availability','workType','applicationId','consent','callbackTime','bookingId','bookingFee','paymentStatus','leadStatus','paymentNote','transactionReference','paymentReportedAt','technicianName','technicianPhone','scheduledAt','completedAt','cancellationReason','statusHistory','message'];
var CUSTOMER_STATUSES = ['New','Callback pending','Confirmed','Assigned','Professional on the way','Work in progress','Completed','Cancelled'];
var PAYMENT_STATUSES = ['Not started','Pending verification','Customer reported paid','Verified','Failed','Refunded'];

function doPost(e) {
  try {
    var p = parsePayload_(e);
    if (p.action === 'report_payment') return json_(reportPayment_(p));
    return json_(createLead_(p));
  } catch (err) {
    return json_({ok:false,error:'Server error. Try again.'});
  }
}

function doGet(e) {
  var p = e && e.parameter ? e.parameter : {};
  if (p.action === 'status') return json_(getStatus_(p.bookingId, p.phone));
  return json_({ok:true,status:'The Fix Nation backend live'});
}

function createLead_(p) {
  p = normalize_(p);
  var v = validate_(p);
  if (!v.ok) return v;
  var sheet = getSheet_(p.formType);
  ensureHeaders_(sheet);
  if (findRow_(sheet, p.bookingId)) return {ok:true,duplicate:true,bookingId:p.bookingId};
  var now = new Date().toISOString();
  p.serverReceivedAt = now;
  p.updatedAt = now;
  p.leadStatus = p.leadStatus || (p.formType === 'worker' ? 'Application received' : 'New');
  p.paymentStatus = p.paymentStatus || 'Pending verification';
  p.statusHistory = JSON.stringify([{status:p.leadStatus,note:'Created',at:now}]);
  var headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0];
  var row = headers.map(function(h){ return safe_(p[h]); });
  LockService.getScriptLock().waitLock(10000);
  sheet.appendRow(row);
  LockService.getScriptLock().releaseLock();
  notify_(p);
  return {ok:true,bookingId:p.bookingId || '',submissionId:p.submissionId};
}

function getStatus_(bookingId, phone) {
  bookingId = String(bookingId || '').trim().toUpperCase();
  phone = digits_(phone);
  if (!/^TFN-\d{8}-[A-Z0-9]{4}$/.test(bookingId)) return {ok:false,error:'Valid Booking ID required.'};
  if (phone.length < 4) return {ok:false,error:'Phone last 4 digits required.'};
  var sheet = getSheet_('customer');
  var found = findRow_(sheet, bookingId);
  if (!found) return {ok:false,error:'Booking not found.'};
  if (digits_(found.data.phone).slice(-4) !== phone.slice(-4)) return {ok:false,error:'Booking ID and phone do not match.'};
  return {ok:true,bookingId:bookingId,service:found.data.service,city:found.data.city,leadStatus:found.data.leadStatus || 'New',paymentStatus:found.data.paymentStatus || 'Pending verification',scheduledAt:found.data.scheduledAt || '',technicianAssigned:!!found.data.technicianName,technicianName:found.data.technicianName || '',technicianPhoneMasked:mask_(found.data.technicianPhone),timeline:timeline_(found.data.leadStatus || 'New', found.data.paymentStatus || 'Pending verification')};
}

function reportPayment_(p) {
  var bookingId = String(p.bookingId || '').trim().toUpperCase();
  var phone = digits_(p.phone).slice(-10);
  var sheet = getSheet_('customer');
  var found = findRow_(sheet, bookingId);
  if (!found || digits_(found.data.phone).slice(-10) !== phone) return {ok:false,error:'Booking details do not match.'};
  var now = new Date().toISOString();
  setCells_(sheet, found.row, {paymentStatus:'Customer reported paid',transactionReference:String(p.transactionReference || '').slice(0,80),paymentReportedAt:now,updatedAt:now});
  return {ok:true,bookingId:bookingId,paymentStatus:'Customer reported paid'};
}

function setupBackend() {
  var c = getSheet_('customer'), w = getSheet_('worker');
  ensureHeaders_(c); ensureHeaders_(w); applyValidation_(c); applyValidation_(w);
  return 'Backend ready';
}

function markPaymentVerified(bookingId, transactionId) { return updateBooking_(bookingId,{paymentStatus:'Verified',transactionReference:transactionId || '',leadStatus:'Confirmed'}); }
function assignProfessional(bookingId, name, phone, scheduledAt) { return updateBooking_(bookingId,{technicianName:name,technicianPhone:digits_(phone).slice(-10),scheduledAt:scheduledAt || '',leadStatus:'Assigned'}); }
function updateLeadStatus(bookingId, leadStatus) { return updateBooking_(bookingId,{leadStatus:leadStatus}); }
function cancelBooking(bookingId, reason) { return updateBooking_(bookingId,{leadStatus:'Cancelled',cancellationReason:reason || 'Cancelled'}); }

function updateBooking_(bookingId, changes) { var sheet=getSheet_('customer'), found=findRow_(sheet,String(bookingId).toUpperCase()); if(!found) throw new Error('Booking not found'); changes.updatedAt=new Date().toISOString(); setCells_(sheet,found.row,changes); return 'Updated '+bookingId; }
function getSheet_(type) { var ss=SpreadsheetApp.openById(type==='worker'?WORKER_SPREADSHEET_ID:SPREADSHEET_ID); var name=type==='worker'?WORKER_SHEET_NAME:CUSTOMER_SHEET_NAME; return ss.getSheetByName(name) || ss.insertSheet(name); }
function ensureHeaders_(sheet) { if(sheet.getLastRow()===0) sheet.appendRow(HEADERS); var ex=sheet.getRange(1,1,1,Math.max(sheet.getLastColumn(),1)).getDisplayValues()[0]; HEADERS.forEach(function(h){ if(ex.indexOf(h)===-1) sheet.getRange(1,sheet.getLastColumn()+1).setValue(h); }); sheet.getRange(1,1,1,sheet.getLastColumn()).setFontWeight('bold').setBackground('#173d55').setFontColor('#fff'); }
function findRow_(sheet, bookingId) { if(sheet.getLastRow()<2) return null; var headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0]; var b=headers.indexOf('bookingId'); var values=sheet.getRange(2,1,sheet.getLastRow()-1,sheet.getLastColumn()).getDisplayValues(); for(var i=values.length-1;i>=0;i--){ if(values[i][b]===bookingId){ var d={}; headers.forEach(function(h,j){d[h]=values[i][j];}); return {row:i+2,data:d,headers:headers}; }} return null; }
function setCells_(sheet,row,changes){ var headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0]; for(var k in changes){ var col=headers.indexOf(k)+1; if(col>0) sheet.getRange(row,col).setValue(safe_(changes[k])); } }
function normalize_(p){ p=Object.assign({},p||{}); p.formType=p.formType==='worker'?'worker':'customer'; p.phone=digits_(p.phone).slice(-10); p.submissionId=String(p.submissionId||Utilities.getUuid()); p.bookingId=String(p.bookingId||'').trim().toUpperCase(); return p; }
function validate_(p){ if(!/^\d{10}$/.test(p.phone)) return {ok:false,error:'Valid phone required.'}; if(!p.city) return {ok:false,error:'City required.'}; if(p.formType==='customer' && (!p.bookingId || !p.service)) return {ok:false,error:'Booking ID and service required.'}; if(p.formType==='worker' && (!p.name || !p.skill)) return {ok:false,error:'Worker name and skill required.'}; return {ok:true}; }
function applyValidation_(sheet){ var headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0]; var ls=headers.indexOf('leadStatus')+1, ps=headers.indexOf('paymentStatus')+1; if(ls>0) sheet.getRange(2,ls,Math.max(sheet.getMaxRows()-1,1),1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(CUSTOMER_STATUSES,true).build()); if(ps>0) sheet.getRange(2,ps,Math.max(sheet.getMaxRows()-1,1),1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(PAYMENT_STATUSES,true).build()); }
function timeline_(leadStatus,paymentStatus){ var order=['New','Callback pending','Confirmed','Assigned','Professional on the way','Work in progress','Completed']; var cur=Math.max(order.indexOf(leadStatus),0); return {paymentStatus:paymentStatus,items:order.map(function(x,i){return {label:x,state:i<cur?'complete':(i===cur?'current':'pending')};})}; }
function notify_(p){ try{ MailApp.sendEmail(NOTIFICATION_EMAIL,'The Fix Nation '+(p.bookingId||p.applicationId||'lead'),JSON.stringify(p,null,2)); }catch(e){} }
function parsePayload_(e){ if(e && e.postData && e.postData.contents){ try{return JSON.parse(e.postData.contents);}catch(err){} } return e && e.parameter ? Object.assign({},e.parameter) : {}; }
function digits_(v){ return String(v||'').replace(/\D/g,''); }
function mask_(v){ var p=digits_(v); return p.length>=4?'XXXXXX'+p.slice(-4):''; }
function safe_(v){ var t=v===undefined||v===null?'':String(v); return /^[=+\-@]/.test(t)?"'"+t:t; }
function json_(d){ return ContentService.createTextOutput(JSON.stringify(d)).setMimeType(ContentService.MimeType.JSON); }
