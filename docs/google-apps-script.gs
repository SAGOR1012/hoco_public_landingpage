/**
 * Google Sheet receiver for Gadget Lab BD orders.
 *
 * Setup:
 * 1. Create a Google Sheet. Extensions > Apps Script. Paste this file.
 * 2. Change SECRET below to a long random text. Use the SAME text as ORDER_WEBHOOK_SECRET in your env.
 * 3. Deploy > New deployment > type "Web app". Execute as: Me. Who has access: Anyone.
 * 4. Copy the Web app URL into ORDER_WEBHOOK_URL.
 *
 * The "Orders" sheet gets one row per order. Incomplete orders keep ONE row per visitor
 * (updated as they type). When that visitor later orders, the old row becomes CONVERTED.
 */
const SECRET = 'CHANGE_ME_TO_A_LONG_RANDOM_TEXT';
const SHEET_NAME = 'Orders';
const HEADERS = ['সময়', 'স্ট্যাটাস', 'অর্ডার আইডি', 'Visitor ID', 'নাম', 'ফোন', 'ঠিকানা', 'এলাকা', 'পরিমাণ', 'পণ্যের দাম', 'ডেলিভারি', 'মোট', 'UTM Source', 'UTM Campaign', 'Referrer'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.secret !== SECRET) return reply({ ok: false, error: 'unauthorized' });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
    sh.getRange('F:F').setNumberFormat('@'); // keep the leading 0 in phone numbers

    const a = d.attribution || {};
    const row = [d.time, d.status, d.orderId || '', d.visitorId || '', d.name || '', d.phone || '', d.address || '', d.area || '', d.qty || '', d.subtotal || '', d.delivery || '', d.total || '', a.utm_source || '', a.utm_campaign || '', a.referrer || ''];

    // find this visitor's INCOMPLETE row (search from the bottom)
    let found = 0;
    const last = sh.getLastRow();
    if (last > 1 && d.visitorId) {
      const vals = sh.getRange(2, 1, last - 1, 4).getValues();
      for (let i = vals.length - 1; i >= 0; i--) {
        if (vals[i][1] === 'INCOMPLETE' && vals[i][3] === d.visitorId) { found = i + 2; break; }
      }
    }

    if (d.status === 'INCOMPLETE') {
      if (found) sh.getRange(found, 1, 1, row.length).setValues([row]);
      else sh.getRange(last + 1, 1, 1, row.length).setValues([row]);
    } else {
      if (found) sh.getRange(found, 2).setValue('CONVERTED');
      sh.getRange(sh.getLastRow() + 1, 1, 1, row.length).setValues([row]);
    }
    return reply({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function reply(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
