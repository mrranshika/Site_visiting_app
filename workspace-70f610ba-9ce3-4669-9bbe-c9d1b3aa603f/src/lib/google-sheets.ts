import ZAI from 'z-ai-web-dev-sdk'

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

  private constructor() {}

  static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService()
    }
    return GoogleSheetsService.instance
  }

  async initialize(): Promise<void> {
    try {
      this.zai = await ZAI.create()
      console.log('Google Sheets service initialized')
    } catch (error) {
      console.error('Failed to initialize Google Sheets service:', error)
      throw error
    }
  }

  async appendToSheet(data: GoogleSheetData): Promise<void> {
    try {
      if (!this.zai) {
        await this.initialize()
      }

      // Prepare CSV data
      const headers = [
        'Customer ID', 'Customer Name', 'Date Received', 'Day of Week', 'Phone Number',
        'Has WhatsApp', 'WhatsApp Number', 'District', 'City', 'Address',
        'Latitude', 'Longitude', 'Has Removals', 'Removal Charge',
        'Has Additional Labour', 'Additional Labour Charge', 'Service Type',
        'Status', 'Quotation Number', 'Created At'
      ]

      const row = [
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

      // Create CSV content
      const csvContent = headers.join(',') + '\n' + row.join(',') + '\n'

      console.log('Data prepared for Google Sheets:', csvContent)

      // In a real implementation, you would use the Z-AI SDK to integrate with Google Sheets
      // For demonstration purposes, we'll log the data that would be sent
      console.log('Data would be sent to Google Sheets API')

      // TODO: Implement actual Google Sheets API integration using Z-AI SDK
      // This would involve:
      // 1. Authenticating with Google Sheets API
      // 2. Getting the spreadsheet ID
      // 3. Appending the data to the specified sheet
      // 4. Handling errors and retries

    } catch (error) {
      console.error('Error appending to Google Sheet:', error)
      throw error
    }
  }

  async createSpreadsheet(title: string): Promise<string> {
    try {
      if (!this.zai) {
        await this.initialize()
      }

      // TODO: Implement spreadsheet creation using Z-AI SDK
      console.log(`Would create spreadsheet with title: ${title}`)
      
      // Return a mock spreadsheet ID
      return `mock_spreadsheet_id_${Date.now()}`
      
    } catch (error) {
      console.error('Error creating spreadsheet:', error)
      throw error
    }
  }

  async getSpreadsheetUrl(spreadsheetId: string): Promise<string> {
    // Return a mock URL for demonstration
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
  }
}