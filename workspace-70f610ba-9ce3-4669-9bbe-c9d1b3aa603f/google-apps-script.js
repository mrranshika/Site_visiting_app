// Google Apps Script for Google Sheets Integration
// This script creates a web app that can receive data and append it to Google Sheets

// 1. Create a new Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste this code
// 4. Deploy as web app
// 5. Use the web app URL in your Next.js application

function doGet(e) {
  return HtmlService.createHtmlOutput("Wedabime Pramukayo API is running!");
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1") || 
                  SpreadsheetApp.getActiveSpreadsheet().insertSheet("Sheet1");
    
    // Set up headers if they don't exist
    if (sheet.getRange("A1:T1").getValues()[0][0] !== "Customer ID") {
      const headers = [
        "Customer ID", "Customer Name", "Date Received", "Day of Week", "Phone Number",
        "Has WhatsApp", "WhatsApp Number", "District", "City", "Address",
        "Latitude", "Longitude", "Has Removals", "Removal Charge",
        "Has Additional Labour", "Additional Labour Charge", "Service Type",
        "Status", "Quotation Number", "Created At"
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange("A1:T1").setFontWeight("bold");
      sheet.getRange("A1:T1").setBackground("#4a86e8");
      sheet.getRange("A1:T1").setFontColor("white");
    }

    // Parse the incoming data
    const data = JSON.parse(e.postData.getDataAsString());
    
    // Create new row
    const newRow = [
      data.customerId || "",
      data.customerName || "",
      data.dateReceived || "",
      data.dayOfWeek || "",
      data.phoneNumber || "",
      data.hasWhatsApp ? "Yes" : "No",
      data.whatsappNumber || "",
      data.district || "",
      data.city || "",
      data.address || "",
      data.latitude?.toString() || "",
      data.longitude?.toString() || "",
      data.hasRemovals ? "Yes" : "No",
      data.removalCharge?.toString() || "",
      data.hasAdditionalLabour ? "Yes" : "No",
      data.additionalLabourCharge?.toString() || "",
      data.serviceType || "",
      data.status || "",
      data.quotationNumber || "",
      data.createdAt || ""
    ];

    // Find the last row with data
    const lastRow = sheet.getLastRow();
    
    // Append the new row
    sheet.getRange(lastRow + 1, 1, 1, newRow.length).setValues([newRow]);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 20);
    
    // Format the new row
    const newRowRange = sheet.getRange(lastRow + 1, 1, 1, newRow.length);
    newRowRange.setFontWeight("normal");
    newRowRange.setBackground("white");
    
    // Add timestamp
    const timestamp = new Date();
    sheet.getRange(lastRow + 1, 20).setValue(timestamp);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Data appended successfully",
      row: lastRow + 1
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to set up the sheet with proper formatting
function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1") || 
                SpreadsheetApp.getActiveSpreadsheet().insertSheet("Sheet1");
  
  // Clear the sheet
  sheet.clear();
  
  // Set up headers
  const headers = [
    "Customer ID", "Customer Name", "Date Received", "Day of Week", "Phone Number",
    "Has WhatsApp", "WhatsApp Number", "District", "City", "Address",
    "Latitude", "Longitude", "Has Removals", "Removal Charge",
    "Has Additional Labour", "Additional Labour Charge", "Service Type",
    "Status", "Quotation Number", "Created At"
  ];
  
  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange("A1:T1").setFontWeight("bold");
  sheet.getRange("A1:T1").setBackground("#4a86e8");
  sheet.getRange("A1:T1").setFontColor("white");
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 20);
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  return "Sheet setup completed!";
}

// Function to get all data (for testing)
function getAllData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  const data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}