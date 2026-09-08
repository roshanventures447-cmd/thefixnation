var SPREADSHEET_ID = '1Czn3xP1VHtUHuMLaYfMG-b_VmvonSN2cpnDhfRFI4oo';
var WORKER_SPREADSHEET_ID = '1nmu4BCtJ4pfC46-_YYDr25SEPEQ1TTXp7Tqed7F7T8I';
var CUSTOMER_SHEET_NAME = 'Customer Leads';
var WORKER_SHEET_NAME = 'Worker Leads';
var NOTIFICATION_EMAIL = 'roshanventures447@gmail.com';
var API_VERSION = '2.2-ops';

var HEADERS = [
  'serverReceivedAt', 'updatedAt', 'submittedAt', 'submissionId', 'formType', 'source',
  'pageUrl', 'name', 'email', 'phone', 'city', 'address', 'latitude', 'longitude',
  'googleMapsUrl', 'service', 'serviceCount', 'skill', 'experience', 'serviceArea',
  'ownTools', 'transport', 'availability', 'workType', 'applicationId', 'consent',
  'callbackTime', 'bookingId', 'bookingFee', 'paymentStatus', 'leadStatus',
  'paymentMethod', 'paymentNote', 'transactionReference', 'paymentReportedAt',
  'paymentVerificationNote', 'technicianName', 'technicianPhone', 'scheduledAt',
  'assignedBy', 'completedAt', 'cancellationReason', 'priority', 'customerLast4',
  'statusHistory', 'message'
];

var CUSTOMER_STATUSES = ['New', 'Callback pending', 'Confirmed', 'Assigned', 'Professional on the way', 'Work in progress', 'Completed', 'Cancelled'];
var WORKER_STATUSES = ['Application received', 'Under review', 'Document check', 'Skill verification', 'Approved', 'Rejected'];
var PAYMENT_STATUSES = ['Not started', 'Pending verification', 'Customer reported paid', 'Verified', 'Failed', 'Refunded'];

function doPost(e) {
  try {
    var input = parsePayload_(e);
    var action = String(input.action || 'create').toLowerCase();
    if (action === 'report_payment') return json_(reportPayment_(input));
    return json_(createLead_(input));
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: 'Server error. Please try again.', apiVersion: API_VERSION });
  }
}

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  if (params.action === 'status') return json_(getBookingStatus_(String(params.bookingId || ''), String(params.phone || '')));
  return json_({ ok: true, service: 'The Fix Nation booking API', apiVersion: API_VERSION, status: 'live', timestamp: new Date().toISOString() });
}

function createLead_(input) {
  var payload = normalizePayload_(input);
  var validation = validatePayload_(payload);
  if (!validation.ok) return { ok: false, error: validation.error, apiVersion: API_VERSION };
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getLeadSheet_(payload.formType);
    var duplicate = findDuplicate_(sheet, payload.submissionId, payload.bookingId);
    if (duplicate) return { ok: true, duplicate: true, bookingId: duplicate.bookingId, apiVersion: API_VERSION };
    if (isRateLimited_(payload)) return { ok: false, error: 'Please wait before submitting another request.', apiVersion: API_VERSION };
    var now = new Date().toISOString();
    payload.serverReceivedAt = now;
    payload.updatedAt = now;
    payload.leadStatus = payload.leadStatus || (payload.formType === 'worker' ? 'Application received' : 'New');
    payload.paymentStatus = payload.paymentStatus || (payload.formType === 'worker' ? 'Not started' : 'Pending verification');
    payload.paymentMethod = payload.paymentMethod || (payload.formType === 'worker' ? '' : 'UPI manual/intent');
    payload.customerLast4 = payload.phone ? payload.phone.slice(-4) : '';
    payload.priority = payload.priority || computePriority_(payload);
    payload.statusHistory = historyEntry_(payload.leadStatus, 'Booking request created', now);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    var row = [];
    for (var i = 0; i < headers.length; i += 1) row.push(safeCell_(payload[headers[i]]));
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }
  notifyTeam_(payload);
  return { ok: true, bookingId: payload.bookingId || '', applicationId: payload.applicationId || '', submissionId: payload.submissionId, apiVersion: API_VERSION };
}

function reportPayment_(input) {
  var bookingId = String(input.bookingId || '').trim().toUpperCase();
  var phone = digits_(input.phone).slice(-10);
  var reference = String(input.transactionReference || '').trim().slice(0, 80);
  if (!/^TFN-\d{8}-[A-Z0-9]{4}$/.test(bookingId)) return { ok: false, error: 'Valid Booking ID is required.' };
  if (!/^\d{10}$/.test(phone)) return { ok: false, error: 'Valid booking phone is required.' };
  var found = findBooking_(bookingId);
  if (!found || digits_(found.row[found.map.phone]).slice(-10) !== phone) return { ok: false, error: 'Booking details do not match.' };
  if (limitAction_('payment:' + bookingId, 3, 300)) return { ok: false, error: 'Payment report already received. Please wait for verification.' };
  var now = new Date().toISOString();
  updateRow_(found.sheet, found.rowNumber, found.map, {
    paymentStatus: 'Customer reported paid',
    transactionReference: reference,
    paymentReportedAt: now,
    updatedAt: now,
    statusHistory: appendHistory_(found.row[found.map.statusHistory], historyEntry_('Payment reported', reference || 'Awaiting team verification', now))
  });
  notifyTeam_({ formType: 'customer', bookingId: bookingId, city: found.row[found.map.city], service: found.row[found.map.service], paymentStatus: 'Customer reported paid', transactionReference: reference });
  return { ok: true, bookingId: bookingId, paymentStatus: 'Customer reported paid', apiVersion: API_VERSION };
}

function getBookingStatus_(bookingId, phoneInput) {
  bookingId = String(bookingId || '').trim().toUpperCase();
  var phone = digits_(phoneInput);
  if (!/^TFN-\d{8}-[A-Z0-9]{4}$/.test(bookingId)) return { ok: false, error: 'Valid Booking ID is required.' };
  if (phone.length < 4) return { ok: false, error: 'Enter the last 4 digits of the booking phone.' };
  var found = findBooking_(bookingId);
  if (!found) return { ok: false, error: 'Booking not found.' };
  var savedPhone = digits_(found.row[found.map.phone]);
  if (savedPhone.slice(-4) !== phone.slice(-4)) return { ok: false, error: 'Booking ID and phone do not match.' };
  if (limitAction_('status:' + bookingId, 20, 300)) return { ok: false, error: 'Too many status checks. Please wait a few minutes.' };
  var status = getRowValue_(found, 'leadStatus', 'New');
  return {
    ok: true,
    apiVersion: API_VERSION,
    bookingId: bookingId,
    service: getRowValue_(found, 'service', 'Service request'),
    city: getRowValue_(found, 'city', ''),
    leadStatus: status,
    paymentStatus: getRowValue_(found, 'paymentStatus', 'Pending verification'),
    scheduledAt: getRowValue_(found, 'scheduledAt', ''),
    updatedAt: getRowValue_(found, 'updatedAt', getRowValue_(found, 'serverReceivedAt', '')),
    technicianAssigned: Boolean(getRowValue_(found, 'technicianName', '')),
    technicianName: getRowValue_(found, 'technicianName', ''),
    technicianPhoneMasked: maskPhone_(getRowValue_(found, 'technicianPhone', '')),
    timeline: buildTimeline_(status, getRowValue_(found, 'paymentStatus', 'Pending verification'), getRowValue_(found, 'statusHistory', ''))
  };
}

function normalizePayload_(input) {
  var payload = Object.assign({}, input || {});
  payload.formType = payload.formType === 'worker' ? 'worker' : 'customer';
  payload.phone = digits_(payload.phone).slice(-10);
  payload.submissionId = String(payload.submissionId || Utilities.getUuid()).trim().slice(0, 100);
  payload.bookingId = String(payload.bookingId || '').trim().toUpperCase();
  payload.bookingFee = payload.bookingFee ? Number(payload.bookingFee) : '';
  for (var i = 0; i < HEADERS.length; i += 1) {
    var key = HEADERS[i];
    if (typeof payload[key] === 'string') payload[key] = payload[key].trim().slice(0, 2000);
  }
  return payload;
}

function validatePayload_(payload) {
  if (!/^\d{10}$/.test(payload.phone)) return { ok: false, error: 'Valid 10 digit phone is required.' };
  if (!payload.city) return { ok: false, error: 'City is required.' };
  if (payload.formType === 'customer') {
    if (!/^TFN-\d{8}-[A-Z0-9]{4}$/.test(payload.bookingId)) return { ok: false, error: 'Valid Booking ID is required.' };
    if (!payload.service) return { ok: false, error: 'Service is required.' };
    if (/inline booking/i.test(payload.source) && (!payload.address || payload.address.length < 8)) return { ok: false, error: 'Complete address is required.' };
    if (Number(payload.bookingFee) !== 49) return { ok: false, error: 'Invalid booking fee.' };
  }
  if (payload.formType === 'worker' && (!payload.skill || !payload.name || !payload.consent)) return { ok: false, error: 'Worker name, skill and consent are required.' };
  return { ok: true };
}

function getLeadSheet_(formType) {
  var spreadsheet = SpreadsheetApp.openById(formType === 'worker' ? WORKER_SPREADSHEET_ID : SPREADSHEET_ID);
  var sheetName = formType === 'worker' ? WORKER_SHEET_NAME : CUSTOMER_SHEET_NAME;
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);
  ensureHeaders_(sheet);
  sheet.setFrozenRows(1);
  return sheet;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  var existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getDisplayValues()[0];
  for (var i = 0; i < HEADERS.length; i += 1) {
    if (existing.indexOf(HEADERS[i]) === -1) sheet.getRange(1, sheet.getLastColumn() + 1).setValue(HEADERS[i]);
  }
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold').setBackground('#173d55').setFontColor('#ffffff');
}

function findBooking_(bookingId) {
  var sheet = getLeadSheet_('customer');
  if (sheet.getLastRow() < 2) return null;
  var map = headerMap_(sheet);
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  for (var i = values.length - 1; i >= 0; i -= 1) {
    if (values[i][map.bookingId] === bookingId) return { sheet: sheet, map: map, row: values[i], rowNumber: i + 2 };
  }
  return null;
}

function findDuplicate_(sheet, submissionId, bookingId) {
  if (sheet.getLastRow() < 2) return null;
  var map = headerMap_(sheet);
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  for (var i = values.length - 1; i >= Math.max(0, values.length - 1000); i -= 1) {
    if ((submissionId && values[i][map.submissionId] === submissionId) || (bookingId && values[i][map.bookingId] === bookingId)) return { bookingId: values[i][map.bookingId] || bookingId };
  }
  return null;
}

function buildTimeline_(status, paymentStatus, history) {
  var order = ['New', 'Callback pending', 'Confirmed', 'Assigned', 'Professional on the way', 'Work in progress', 'Completed'];
  var current = Math.max(order.indexOf(status), 0);
  var items = [];
  for (var i = 0; i < order.length; i += 1) {
    var state = i < current ? 'complete' : (i === current ? 'current' : 'pending');
    if (status === 'Cancelled') state = i === 0 ? 'complete' : 'pending';
    items.push({ label: order[i], state: state });
  }
  if (status === 'Cancelled') items.push({ label: 'Cancelled', state: 'current' });
  return { items: items, paymentStatus: paymentStatus, history: parseHistory_(history).slice(-8) };
}

function markPaymentVerified(bookingId, transactionId) {
  return updateBooking_(bookingId, { paymentStatus: 'Verified', transactionReference: transactionId || '', paymentVerificationNote: 'Verified by operations', leadStatus: 'Confirmed' }, 'Payment verified');
}

function assignProfessional(bookingId, name, phone, scheduledAt) {
  return updateBooking_(bookingId, { technicianName: name, technicianPhone: digits_(phone).slice(-10), scheduledAt: scheduledAt || '', assignedBy: Session.getActiveUser().getEmail() || 'Ops team', leadStatus: 'Assigned' }, 'Professional assigned');
}

function updateLeadStatus(bookingId, leadStatus, note) {
  if (CUSTOMER_STATUSES.indexOf(leadStatus) === -1) throw new Error('Unsupported status.');
  var changes = { leadStatus: leadStatus };
  if (leadStatus === 'Completed') changes.completedAt = new Date().toISOString();
  return updateBooking_(bookingId, changes, note || leadStatus);
}

function cancelBooking(bookingId, reason) {
  return updateBooking_(bookingId, { leadStatus: 'Cancelled', cancellationReason: reason || 'Cancelled by team' }, 'Booking cancelled');
}

function updateBooking_(bookingId, changes, note) {
  var found = findBooking_(String(bookingId || '').trim().toUpperCase());
  if (!found) throw new Error('Booking not found: ' + bookingId);
  var now = new Date().toISOString();
  changes.updatedAt = now;
  changes.statusHistory = appendHistory_(found.row[found.map.statusHistory], historyEntry_(changes.leadStatus || changes.paymentStatus || 'Updated', note || 'Booking updated', now));
  updateRow_(found.sheet, found.rowNumber, found.map, changes);
  return 'Updated ' + bookingId;
}

function updateRow_(sheet, rowNumber, map, changes) {
  for (var key in changes) {
    if (changes.hasOwnProperty(key) && map[key] !== undefined) sheet.getRange(rowNumber, map[key] + 1).setValue(safeCell_(changes[key]));
  }
}

function setupBackend() {
  var customer = getLeadSheet_('customer');
  var worker = getLeadSheet_('worker');
  applyStatusValidation_(customer, CUSTOMER_STATUSES);
  applyStatusValidation_(worker, WORKER_STATUSES);
  applyOpsFormatting_(customer);
  applyOpsFormatting_(worker);
  setupOpsDashboard_();
  customer.autoResizeColumns(1, customer.getLastColumn());
  worker.autoResizeColumns(1, worker.getLastColumn());
  return 'The Fix Nation backend ' + API_VERSION + ' is ready.';
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('The Fix Nation')
    .addItem('Setup / repair backend', 'setupBackend')
    .addItem('Verify selected payment', 'verifySelectedPayment')
    .addItem('Assign selected professional', 'assignSelectedProfessional')
    .addItem('Mark selected callback pending', 'markSelectedCallbackPending')
    .addItem('Show backend help', 'showBackendHelp')
    .addToUi();
}

function showBackendHelp() {
  SpreadsheetApp.getUi().alert('Use setupBackend once. Customer sheet statuses: New > Callback pending > Confirmed > Assigned > Professional on the way > Work in progress > Completed. Select a booking row, then use The Fix Nation menu to verify payment or assign a professional.');
}

function verifySelectedPayment() {
  var selected = getSelectedCustomerBooking_();
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Verify payment for ' + selected.bookingId, 'Enter UPI transaction/reference ID:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  ui.alert(markPaymentVerified(selected.bookingId, response.getResponseText()));
}

function assignSelectedProfessional() {
  var selected = getSelectedCustomerBooking_();
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Assign professional to ' + selected.bookingId, 'Enter: Name, Phone, Schedule (example: Ramesh, 9876543210, Today 5 PM)', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  var parts = response.getResponseText().split(',');
  if (parts.length < 2) throw new Error('Enter at least name and phone.');
  ui.alert(assignProfessional(selected.bookingId, parts[0], parts[1], parts.slice(2).join(',').trim()));
}

function markSelectedCallbackPending() {
  var selected = getSelectedCustomerBooking_();
  SpreadsheetApp.getUi().alert(updateLeadStatus(selected.bookingId, 'Callback pending', 'Ops team started callback'));
}

function getSelectedCustomerBooking_() {
  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== CUSTOMER_SHEET_NAME) throw new Error('Open Customer Leads sheet and select a booking row.');
  var rowNumber = sheet.getActiveRange().getRow();
  if (rowNumber < 2) throw new Error('Select a customer booking row.');
  var map = headerMap_(sheet);
  var bookingId = sheet.getRange(rowNumber, map.bookingId + 1).getDisplayValue();
  if (!bookingId) throw new Error('Selected row does not have Booking ID.');
  return { sheet: sheet, rowNumber: rowNumber, bookingId: bookingId };
}

function applyOpsFormatting_(sheet) {
  if (!sheet.getFilter()) sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 2), sheet.getLastColumn()).createFilter();
  var map = headerMap_(sheet);
  if (map.priority !== undefined) sheet.getRange(2, map.priority + 1, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['High', 'Normal', 'Worker growth', 'Low'], true).build());
}

function setupOpsDashboard_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Ops Dashboard') || ss.insertSheet('Ops Dashboard');
  var customer = getLeadSheet_('customer');
  var map = headerMap_(customer);
  var leadStatusColumn = columnLetter_(map.leadStatus + 1);
  var paymentStatusColumn = columnLetter_(map.paymentStatus + 1);
  var priorityColumn = columnLetter_(map.priority + 1);
  sheet.clear();
  sheet.getRange(1, 1, 1, 2).setValues([['The Fix Nation Ops Dashboard', API_VERSION]]);
  sheet.getRange(3, 1, 9, 2).setValues([
    ['New bookings', '=COUNTIF(\'' + CUSTOMER_SHEET_NAME + '\'!' + leadStatusColumn + ':' + leadStatusColumn + ',"New")'],
    ['Callback pending', '=COUNTIF(\'' + CUSTOMER_SHEET_NAME + '\'!' + leadStatusColumn + ':' + leadStatusColumn + ',"Callback pending")'],
    ['Confirmed', '=COUNTIF(\'' + CUSTOMER_SHEET_NAME + '\'!' + leadStatusColumn + ':' + leadStatusColumn + ',"Confirmed")'],
    ['Assigned', '=COUNTIF(\'' + CUSTOMER_SHEET_NAME + '\'!' + leadStatusColumn + ':' + leadStatusColumn + ',"Assigned")'],
    ['Completed', '=COUNTIF(\'' + CUSTOMER_SHEET_NAME + '\'!' + leadStatusColumn + ':' + leadStatusColumn + ',"Completed")'],
    ['Payment reported', '=COUNTIF(\'' + CUSTOMER_SHEET_NAME + '\'!' + paymentStatusColumn + ':' + paymentStatusColumn + ',"Customer reported paid")'],
    ['Payment verified', '=COUNTIF(\'' + CUSTOMER_SHEET_NAME + '\'!' + paymentStatusColumn + ':' + paymentStatusColumn + ',"Verified")'],
    ['High priority', '=COUNTIF(\'' + CUSTOMER_SHEET_NAME + '\'!' + priorityColumn + ':' + priorityColumn + ',"High")'],
    ['Last setup', new Date().toISOString()]
  ]);
  sheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#173d55').setFontColor('#ffffff');
  sheet.autoResizeColumns(1, 2);
}

function computePriority_(payload) {
  if (payload.formType === 'worker') return 'Worker growth';
  var city = String(payload.city || '').toLowerCase();
  if (['chennai', 'bangalore', 'hyderabad', 'mumbai'].indexOf(city) !== -1) return 'High';
  return 'Normal';
}

function columnLetter_(columnNumber) {
  var letter = '';
  while (columnNumber > 0) {
    var temp = (columnNumber - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    columnNumber = Math.floor((columnNumber - temp - 1) / 26);
  }
  return letter;
}

function onEdit(e) {
  if (!e || !e.range || e.range.getRow() < 2) return;
  var sheet = e.range.getSheet();
  if ([CUSTOMER_SHEET_NAME, WORKER_SHEET_NAME].indexOf(sheet.getName()) === -1) return;
  var map = headerMap_(sheet);
  var editedColumn = e.range.getColumn() - 1;
  var key = '';
  for (var header in map) if (map[header] === editedColumn) key = header;
  if (['leadStatus', 'paymentStatus', 'technicianName', 'technicianPhone', 'scheduledAt'].indexOf(key) === -1) return;
  var now = new Date().toISOString();
  if (map.updatedAt !== undefined) sheet.getRange(e.range.getRow(), map.updatedAt + 1).setValue(now);
  if (map.statusHistory !== undefined) {
    var current = sheet.getRange(e.range.getRow(), map.statusHistory + 1).getDisplayValue();
    sheet.getRange(e.range.getRow(), map.statusHistory + 1).setValue(appendHistory_(current, historyEntry_(key, 'Changed to: ' + String(e.value || ''), now)));
  }
}

function applyStatusValidation_(sheet, statuses) {
  var map = headerMap_(sheet);
  var rows = Math.max(sheet.getMaxRows() - 1, 1);
  if (map.leadStatus !== undefined) sheet.getRange(2, map.leadStatus + 1, rows, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(statuses, true).setAllowInvalid(false).build());
  if (map.paymentStatus !== undefined) sheet.getRange(2, map.paymentStatus + 1, rows, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(PAYMENT_STATUSES, true).setAllowInvalid(false).build());
}

function notifyTeam_(payload) {
  try {
    var subject = payload.formType === 'worker' ? 'New worker lead: ' + (payload.city || '') : 'Booking update ' + (payload.bookingId || '') + ': ' + (payload.service || payload.paymentStatus || '');
    var body = [];
    for (var i = 0; i < HEADERS.length; i += 1) body.push(HEADERS[i] + ': ' + (payload[HEADERS[i]] || ''));
    MailApp.sendEmail(NOTIFICATION_EMAIL, subject, body.join('\n'));
  } catch (error) {
    console.warn('Notification skipped: ' + error.message);
  }
}

function isRateLimited_(payload) {
  var cache = CacheService.getScriptCache();
  var key = ['lead', payload.formType, payload.phone].join(':');
  if (cache.get(key)) return true;
  cache.put(key, '1', 15);
  return false;
}

function limitAction_(key, maximum, seconds) {
  var cache = CacheService.getScriptCache();
  var current = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(current), seconds);
  return current > maximum;
}

function getRowValue_(found, key, fallback) {
  return found.map[key] === undefined ? (fallback || '') : (found.row[found.map[key]] || fallback || '');
}

function headerMap_(sheet) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i += 1) map[headers[i]] = i;
  return map;
}

function historyEntry_(status, note, at) { return JSON.stringify({ status: status, note: note, at: at }); }
function appendHistory_(history, entry) { var list = parseHistory_(history); try { list.push(JSON.parse(entry)); } catch (error) {} return JSON.stringify(list.slice(-25)); }
function parseHistory_(history) { if (!history) return []; try { var parsed = JSON.parse(history); return Array.isArray(parsed) ? parsed : [parsed]; } catch (error) { return []; } }
function digits_(value) { return String(value || '').replace(/\D/g, ''); }
function maskPhone_(value) { var phone = digits_(value); return phone.length >= 4 ? 'XXXXXX' + phone.slice(-4) : ''; }
function safeCell_(value) { var text = value === undefined || value === null ? '' : String(value); return /^[=+\-@]/.test(text) ? "'" + text : text; }
function parsePayload_(e) { if (!e) return {}; if (e.postData && e.postData.contents) { try { return JSON.parse(e.postData.contents); } catch (error) {} } return Object.assign({}, e.parameter || {}); }
function json_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
