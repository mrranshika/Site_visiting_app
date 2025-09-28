import { ZAI } from 'z-ai-web-dev-sdk'

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
  private zai: any = null
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
      this.zai = await ZAI.create()
      
      if (spreadsheetId) {
        this.spreadsheetId = spreadsheetId
      } else {
        // Create a new spreadsheet if no ID provided
        this.spreadsheetId = await this.createSpreadsheet()
      }
      
      this.initialized = true
      console.log('Google Sheets service initialized with spreadsheet:', this.spreadsheetId)
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

      // Prepare data for Google Sheets
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

      console.log('Appending to Google Sheets:', rowData)

      // For production use with actual Google Sheets API
      // This is a placeholder implementation
      // In production, you would use the Google Sheets API directly
      
      // Log the data that would be sent
      console.log('Data prepared for Google Sheets:', {
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:T',
        values: [rowData]
      })

      // TODO: Implement actual Google Sheets API call
      // Example using Google Sheets API:
      /*
      await this.zai.functions.invoke('google_sheets_append', {
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:T',
        values: [rowData]
      })
      */

    } catch (error) {
      console.error('Error appending to Google Sheet:', error)
      throw error
    }
  }

  async createSpreadsheet(title: string = 'Wedabime Pramukayo Data'): Promise<string> {
    try {
      if (!this.zai) {
        await this.initialize()
      }

      console.log(`Creating spreadsheet with title: ${title}`)

      // TODO: Implement actual spreadsheet creation
      // For now, return a mock ID
      const mockSpreadsheetId = `mock_spreadsheet_${Date.now()}`
      
      console.log(`Spreadsheet created with ID: ${mockSpreadsheetId}`)
      
      return mockSpreadsheetId
      
    } catch (error) {
      console.error('Error creating spreadsheet:', error)
      throw error
    }
  }

  async getSpreadsheetUrl(): Promise<string> {
    if (!this.spreadsheetId) {
      throw new Error('No spreadsheet ID available')
    }
    
    return `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`
  }

  // Alternative implementation using direct Google Sheets API
  async appendToSheetDirect(data: GoogleSheetData, credentials: any): Promise<void> {
    try {
      const { GoogleAuth } = await import('google-auth-library')
      const { google } = await import('googleapis')

      // Create auth client
      const auth = new GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      })

      const sheets = google.sheets({ version: 'v4', auth })

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
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:T',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData]
        }
      })

      console.log('Data appended to Google Sheets:', response.data)

    } catch (error) {
      console.error('Error appending to Google Sheet directly:', error)
      throw error
    }
  }
}