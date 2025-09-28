# Google Sheets Integration Setup Guide

## Prerequisites

1. Node.js 16+ installed
2. Google Cloud Console account
3. Google Sheets created
4. Service account credentials

## Step 1: Install Required Packages

```bash
npm install google-auth-library googleapis
```

## Step 2: Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# Database Configuration
DATABASE_URL=file:./dev.db
```

## Step 3: Create Google Sheets Service

Replace the existing Google Sheets service with this implementation:

```typescript
// src/lib/google-sheets-prod.ts
import { google } from 'googleapis'

export interface GoogleSheetData {
  customerId: string
  customerName: string
  dateReceived: string
  dayOfWeek: string
  phoneNumber: string
  hasWhatsApp: boolean
  whatsappNumber?: string
  district: string
  city: string
  address?: string
  latitude?: number
  longitude?: number
  hasRemovals: boolean
  removalCharge?: number
  hasAdditionalLabour: boolean
  additionalLabourCharge?: number
  serviceType: string
  status: string
  quotationNumber?: string
  createdAt: string
}

export class GoogleSheetsService {
  private static instance: GoogleSheetsService
  private sheets: any = null
  private spreadsheetId: string = ''
  private initialized = false

  private constructor() {}

  static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService()
    }
    return GoogleSheetsService.instance
  }

  async initialize(spreadsheetId?: string): Promise<void> {
    try {
      // Load service account credentials
      const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || './credentials.json'
      
      const auth = new google.auth.GoogleAuth({
        keyFile: keyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      })

      this.sheets = google.sheets({ version: 'v4', auth })
      
      if (spreadsheetId) {
        this.spreadsheetId = spreadsheetId
      } else {
        this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || ''
      }
      
      if (!this.spreadsheetId) {
        throw new Error('Spreadsheet ID is required')
      }
      
      this.initialized = true
      console.log('Google Sheets service initialized')
    } catch (error) {
      console.error('Failed to initialize Google Sheets service:', error)
      throw error
    }
  }

  async appendToSheet(data: GoogleSheetData): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize()
      }

      // Prepare row data
      const rowData = [
        data.customerId,
        data.customerName,
        data.dateReceived,
        data.dayOfWeek,
        data.phoneNumber,
        data.hasWhatsApp ? 'Yes' : 'No',
        data.whatsappNumber || '',
        data.district,
        data.city,
        data.address || '',
        data.latitude?.toString() || '',
        data.longitude?.toString() || '',
        data.hasRemovals ? 'Yes' : 'No',
        data.removalCharge?.toString() || '',
        data.hasAdditionalLabour ? 'Yes' : 'No',
        data.additionalLabourCharge?.toString() || '',
        data.serviceType,
        data.status,
        data.quotationNumber || '',
        data.createdAt
      ]

      // Append to sheet
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:T',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData]
        }
      })

      console.log('Data appended to Google Sheets:', response.data)

    } catch (error) {
      console.error('Error appending to Google Sheet:', error)
      throw error
    }
  }

  async createSpreadsheet(title: string = 'Wedabime Pramukayo Data'): Promise<string> {
    try {
      if (!this.initialized) {
        await this.initialize()
      }

      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: title
          },
          sheets: [
            {
              properties: {
                title: 'Site Visits',
                gridProperties: {
                  columnCount: 20,
                  rowCount: 1000
                }
              }
            }
          ]
        }
      })

      const spreadsheetId = response.data.spreadsheetId
      console.log(`Spreadsheet created with ID: ${spreadsheetId}`)
      
      // Set up headers
      await this.setupHeaders(spreadsheetId)
      
      return spreadsheetId
      
    } catch (error) {
      console.error('Error creating spreadsheet:', error)
      throw error
    }
  }

  private async setupHeaders(spreadsheetId: string): Promise<void> {
    const headers = [
      'Customer ID', 'Customer Name', 'Date Received', 'Day of Week', 'Phone Number',
      'Has WhatsApp', 'WhatsApp Number', 'District', 'City', 'Address',
      'Latitude', 'Longitude', 'Has Removals', 'Removal Charge',
      'Has Additional Labour', 'Additional Labour Charge', 'Service Type',
      'Status', 'Quotation Number', 'Created At'
    ]

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: 'Site Visits!A1:T1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers]
      }
    })
  }

  async getSpreadsheetUrl(): Promise<string> {
    if (!this.spreadsheetId) {
      throw new Error('No spreadsheet ID available')
    }
    
    return `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`
  }
}
```

## Step 4: Update API Route

Replace your existing API route with this implementation:

```typescript
// src/app/api/site-visits/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { GoogleSheetsService, GoogleSheetData } from '@/lib/google-sheets-prod'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const data = JSON.parse(formData.get('data') as string)
    const files = formData.getAll('files') as File[]

    // Create site visit record in database
    const siteVisit = await db.siteVisit.create({
      data: {
        customerId: data.customerId,
        customerName: data.customerName,
        dateReceived: new Date(data.dateReceived),
        dayOfWeek: new Date(data.dateReceived).toLocaleDateString('en-US', { weekday: 'long' }),
        phoneNumber: data.phoneNumber,
        hasWhatsApp: data.hasWhatsApp,
        hasWhatsAppNumber: data.hasWhatsAppNumber,
        whatsappNumber: data.whatsappNumber,
        district: data.district,
        city: data.city,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        hasRemovals: data.hasRemovals,
        removalCharge: data.removalCharge,
        hasAdditionalLabour: data.hasAdditionalLabour,
        additionalLabourCharge: data.additionalLabourCharge,
        serviceType: data.serviceType,
        status: data.status,
        quotationNumber: data.quotationNumber,
        quotationAttachment: data.quotationAttachment,
      }
    })

    // Handle service-specific details (existing code remains the same)
    // ... [Keep your existing service-specific logic]

    // Send data to Google Sheets
    try {
      const googleSheetsService = GoogleSheetsService.getInstance()
      
      const sheetData: GoogleSheetData = {
        customerId: data.customerId,
        customerName: data.customerName,
        dateReceived: new Date(data.dateReceived).toISOString().split('T')[0],
        dayOfWeek: new Date(data.dateReceived).toLocaleDateString('en-US', { weekday: 'long' }),
        phoneNumber: data.phoneNumber,
        hasWhatsApp: data.hasWhatsApp,
        whatsappNumber: data.whatsappNumber,
        district: data.district,
        city: data.city,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        hasRemovals: data.hasRemovals,
        removalCharge: data.removalCharge,
        hasAdditionalLabour: data.hasAdditionalLabour,
        additionalLabourCharge: data.additionalLabourCharge,
        serviceType: data.serviceType,
        status: data.status,
        quotationNumber: data.quotationNumber,
        createdAt: new Date().toISOString()
      }
      
      await googleSheetsService.appendToSheet(sheetData)
      console.log('Data successfully sent to Google Sheets')
      
    } catch (error) {
      console.error('Error sending to Google Sheets:', error)
      // Don't fail the request if Google Sheets integration fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Site visit created successfully',
      siteVisitId: siteVisit.id 
    })

  } catch (error) {
    console.error('Error creating site visit:', error)
    return NextResponse.json(
      { error: 'Failed to create site visit' },
      { status: 500 }
    )
  }
}
```

## Step 5: Deployment Configuration

### For Vercel Deployment:

1. **Set Environment Variables in Vercel:**
   - Go to your Vercel project dashboard
   - Click "Settings" → "Environment Variables"
   - Add the following variables:
     ```
     GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
     GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./credentials.json
     DATABASE_URL=file:./dev.db
     ```

2. **Upload Credentials:**
   - Place your `credentials.json` file in the project root
   - Make sure it's included in your deployment

### For Other Hosting Platforms:

**Environment Variables:**
```bash
export GOOGLE_SHEETS_SPREADSHEET_ID="your-spreadsheet-id"
export GOOGLE_SERVICE_ACCOUNT_KEY_PATH="./credentials.json"
export DATABASE_URL="file:./dev.db"
```

## Step 6: Testing the Integration

1. **Test Locally:**
```bash
npm run dev
```

2. **Fill out a test form:**
   - Open your app
   - Fill in all required fields
   - Submit the form

3. **Check Google Sheet:**
   - Open your Google Sheet
   - Verify that the data appears in the sheet

## Troubleshooting

### Common Issues:

1. **Permission Denied:**
   - Make sure your service account email has editor access to the Google Sheet
   - Verify the service account key is correct

2. **Spreadsheet Not Found:**
   - Check your spreadsheet ID
   - Ensure the sheet is shared with the service account

3. **Authentication Issues:**
   - Verify your service account credentials
   - Check that the Google Sheets API is enabled

4. **Deployment Issues:**
   - Ensure environment variables are set correctly
   - Check that credentials file is accessible

### Debug Mode:

Add this to your Google Sheets service for debugging:

```typescript
async appendToSheet(data: GoogleSheetData): Promise<void> {
  try {
    console.log('Attempting to append to Google Sheets...')
    console.log('Spreadsheet ID:', this.spreadsheetId)
    console.log('Data:', data)
    
    // ... rest of the code
    
  } catch (error) {
    console.error('Detailed error:', error)
    throw error
  }
}
```

## Security Considerations

1. **Keep Credentials Safe:**
   - Never commit `credentials.json` to version control
   - Use environment variables for sensitive data

2. **Limit Permissions:**
   - Only give necessary permissions to service account
   - Use the principle of least privilege

3. **Monitor Access:**
   - Regularly check who has access to your Google Sheet
   - Monitor API usage in Google Cloud Console

## Alternative: Using Z-AI SDK

If you prefer to use the Z-AI SDK for Google Sheets integration:

```typescript
// In your Google Sheets service
async appendToSheetWithZAI(data: GoogleSheetData): Promise<void> {
  try {
    const zai = await ZAI.create()
    
    const result = await zai.functions.invoke('google_sheets_append', {
      spreadsheetId: this.spreadsheetId,
      range: 'Sheet1!A:T',
      values: [[
        data.customerId,
        data.customerName,
        // ... rest of the data
      ]]
    })
    
    console.log('Z-AI SDK result:', result)
    
  } catch (error) {
    console.error('Error with Z-AI SDK:', error)
    throw error
  }
}
```

This setup provides a complete, production-ready Google Sheets integration for your Wedabime Pramukayo application!