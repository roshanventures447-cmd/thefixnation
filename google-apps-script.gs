const SPREADSHEET_ID = '1Czn3xP1VHtUHuMLaYfMG-b_VmvonSN2cpnDhfRFI4oo';
const WORKER_SPREADSHEET_ID = '1nmu4BCtJ4pfC46-_YYDr25SEPEQ1TTXp7Tqed7F7T8I';
const CUSTOMER_SHEET_NAME = 'Customer Leads';
const WORKER_SHEET_NAME = 'Worker Leads';
const NOTIFICATION_EMAIL = 'roshanventures447@gmail.com';

const HEADERS = [
  'serverReceivedAt', 'submittedAt', 'submissionId', 'formType', 'source',
  'pageUrl', 'name', 'email', 'phone', 'city', 'address', 'latitude', 'longitude',
  'googleMapsUrl', 'service', 'serviceCount',
  'skill', 'experience', 'serviceArea', 'ownTools', 'transport', 'availability',
  'workType', 'applicationId', 'consent', 'callbackTime', 'bookingId', 'bookingFee',
  'paymentStatus', 'leadStatus', 'paymentNote', 'message'
];

function doPost(e) {
  try {
    const payload = normalizePayload_(parsePayload_(e));
    const validation = validatePayload_(payload);
    if (!validation.ok) return json_({ ok: false, error: validation.error });
    if (isRateLimited_(payload)) return json_({ ok: false, error: 'Please wait before submitting again.' });

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      const sheet = getLeadSheet_(payload.formType);
      const duplicate = findDuplicate_(sheet, payload.submissionId, payload.bookingId);
      if (duplicate) {
        return json_({ ok: true, duplicate: true, bookingId: duplicate.bookingId });
      }

      payload.serverReceivedAt = new Date().toISOString();
      payload.leadStatus = payload.leadStatus || 'New';
      payload.paymentStatus = payload.paymentStatus || 'Not started';
      const sheetHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      sheet.appendRow(sheetHeaders.map((key) => safeCell_(payload[key])));
    } finally {
      lock.releaseLock();
    }

    notifyTeam_(payload);
    return json_({ ok: true, bookingId: payload.bookingId || '', submissionId: payload.submissionId });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: 'Server error. Please try again.' });
  }
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.action === 'status' && params.bookingId) {
    return json_(getBookingStatus_(String(params.bookingId)));
  }
  return json_({ ok: true, service: 'The Fix Nation booking API', status: 'live', timestamp: new Date().toISOString() });
}

function normalizePayload_(input) {
  const payload = Object.assign({}, input || {});
  payload.formType = payload.formType === 'worker' ? 'worker' : 'customer';
  payload.phone = String(payload.phone || '').replace(/\D/g, '').slice(-10);
  payload.submissionId = String(payload.submissionId || Utilities.getUuid());
  payload.bookingId = String(payload.bookingId || '');
  payload.bookingFee = payload.bookingFee ? Number(payload.bookingFee) : '';
  HEADERS.forEach((key) => {
    if (typeof payload[key] === 'string') payload[key] = payload[key].trim().slice(0, 2000);
  });
  return payload;
}

function validatePayload_(payload) {
  if (!/^\d{10}$/.test(payload.phone)) return { ok: false, error: 'Valid 10 digit phone is required.' };
  if (!payload.city) return { ok: false, error: 'City is required.' };
  if (payload.formType === 'customer') {
    if (!payload.service) return { ok: false, error: 'Service is required.' };
    if (payload.address && payload.address.length < 8) return { ok: false, error: 'Complete address is required.' };
  }
  if (payload.formType === 'worker' && !payload.skill) return { ok: false, error: 'Worker skill is required.' };
  if (payload.formType === 'worker' && !payload.name) return { ok: false, error: 'Worker name is required.' };
  if (payload.formType === 'worker' && !payload.consent) return { ok: false, error: 'Worker consent is required.' };
  return { ok: true };
}

function getLeadSheet_(formType) {
  const spreadsheetId = formType === 'worker' ? WORKER_SPREADSHEET_ID : SPREADSHEET_ID;
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheetName = formType === 'worker' ? WORKER_SHEET_NAME : CUSTOMER_SHEET_NAME;
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);
  ensureHeaders_(sheet);
  sheet.setFrozenRows(1);
  return sheet;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }
  const existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  HEADERS.forEach((header) => {
    if (existing.indexOf(header) === -1) sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
  });
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setFontWeight('bold').setBackground('#173d55').setFontColor('#ffffff');
  sheet.autoResizeColumns(1, sheet.getLastColumn());
}

function findDuplicate_(sheet, submissionId, bookingId) {
  if (sheet.getLastRow() < 2) return null;
  const headerMap = headerMap_(sheet);
  const submissionIndex = headerMap.submissionId;
  const bookingIndex = headerMap.bookingId;
  const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  for (let index = ids.length - 1; index >= Math.max(0, ids.length - 500); index -= 1) {
    const row = ids[index];
    if ((submissionId && submissionIndex !== undefined && row[submissionIndex] === submissionId) || (bookingId && bookingIndex !== undefined && row[bookingIndex] === bookingId)) {
      return { bookingId: bookingIndex !== undefined ? row[bookingIndex] : bookingId || '' };
    }
  }
  return null;
}

function getBookingStatus_(bookingId) {
  const sheet = getLeadSheet_('customer');
  if (sheet.getLastRow() < 2) return { ok: false, error: 'Booking not found.' };
  const map = headerMap_(sheet);
  if (map.bookingId === undefined) return { ok: false, error: 'Booking status is not configured.' };
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (values[index][map.bookingId] === bookingId) {
      return {
        ok: true,
        bookingId,
        service: map.service === undefined ? '' : values[index][map.service],
        city: map.city === undefined ? '' : values[index][map.city],
        leadStatus: map.leadStatus === undefined ? 'New' : values[index][map.leadStatus],
        paymentStatus: map.paymentStatus === undefined ? 'Pending verification' : values[index][map.paymentStatus]
      };
    }
  }
  return { ok: false, error: 'Booking not found.' };
}

function headerMap_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  return headers.reduce((map, header, index) => { map[header] = index; return map; }, {});
}

function notifyTeam_(payload) {
  try {
    const subject = payload.formType === 'worker'
      ? `New worker lead: ${payload.city}`
      : `New booking ${payload.bookingId}: ${payload.service}`;
    const body = HEADERS.map((key) => `${key}: ${payload[key] || ''}`).join('\n');
    MailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
  } catch (error) {
    console.warn('Notification email skipped: ' + error.message);
  }
}

function isRateLimited_(payload) {
  const cache = CacheService.getScriptCache();
  const key = ['lead', payload.formType || 'customer', payload.phone || 'unknown'].join(':');
  if (cache.get(key)) return true;
  cache.put(key, '1', 20);
  return false;
}

function setupBackend() {
  const customerSheet = getLeadSheet_('customer');
  const workerSheet = getLeadSheet_('worker');
  applyStatusValidation_(customerSheet);
  applyStatusValidation_(workerSheet);
  return 'Customer and worker sheets are ready.';
}

function applyStatusValidation_(sheet) {
  const map = headerMap_(sheet);
  if (map.leadStatus !== undefined) {
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['New', 'Callback pending', 'Confirmed', 'Assigned', 'Completed', 'Cancelled', 'Application received', 'Under review', 'Approved', 'Rejected'], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(2, map.leadStatus + 1, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(rule);
  }
  if (map.paymentStatus !== undefined) {
    const paymentRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Not started', 'Pending verification', 'Verified', 'Failed', 'Refunded'], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(2, map.paymentStatus + 1, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(paymentRule);
  }
}

function markPaymentVerified(bookingId, transactionId) {
  return updateBooking_(bookingId, {
    paymentStatus: 'Verified',
    paymentNote: transactionId ? 'UPI transaction: ' + transactionId : 'Verified manually',
    leadStatus: 'Confirmed'
  });
}

function updateLeadStatus(bookingId, leadStatus) {
  return updateBooking_(bookingId, { leadStatus: leadStatus });
}

function updateBooking_(bookingId, changes) {
  if (!bookingId) throw new Error('Booking ID is required.');
  const sheet = getLeadSheet_('customer');
  const map = headerMap_(sheet);
  const values = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), sheet.getLastColumn()).getDisplayValues();
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (values[index][map.bookingId] === bookingId) {
      Object.keys(changes).forEach((key) => {
        if (map[key] !== undefined) sheet.getRange(index + 2, map[key] + 1).setValue(safeCell_(changes[key]));
      });
      return 'Updated ' + bookingId;
    }
  }
  throw new Error('Booking not found: ' + bookingId);
}

function safeCell_(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function parsePayload_(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (error) {}
  }
  return Object.assign({}, e.parameter || {});
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
