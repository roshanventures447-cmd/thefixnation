const SPREADSHEET_ID = '1Czn3xP1VHtUHuMLaYfMG-b_VmvonSN2cpnDhfRFI4oo';
const CUSTOMER_SHEET_NAME = 'Customer Leads';
const WORKER_SHEET_NAME = 'Worker Leads';

const HEADERS = [
  'submittedAt',
  'formType',
  'source',
  'pageUrl',
  'name',
  'email',
  'phone',
  'city',
  'address',
  'service',
  'skill',
  'experience',
  'callbackTime',
  'bookingId',
  'bookingFee',
  'paymentStatus',
  'paymentNote',
  'message'
];

function doPost(e) {
  const payload = parsePayload_(e);
  const sheet = getLeadSheet_(payload.formType);
  const row = HEADERS.map((key) => payload[key] || '');

  LockService.getScriptLock().waitLock(10000);
  try {
    sheet.appendRow(row);
  } finally {
    LockService.getScriptLock().releaseLock();
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput('The Fix Nation lead endpoint is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getLeadSheet_(formType) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetName = formType === 'worker' ? WORKER_SHEET_NAME : CUSTOMER_SHEET_NAME;
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  } else {
    ensureHeaders_(sheet);
  }

  return sheet;
}

function ensureHeaders_(sheet) {
  const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  HEADERS.forEach((header) => {
    if (existingHeaders.indexOf(header) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
    }
  });
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    const params = e.parameter || {};
    return Object.keys(params).reduce((data, key) => {
      data[key] = params[key];
      return data;
    }, {});
  }
}
