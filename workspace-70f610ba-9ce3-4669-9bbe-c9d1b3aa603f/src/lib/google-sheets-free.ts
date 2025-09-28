// Simple Google Sheets integration using Web App
// This approach uses a Google Apps Script web app as a proxy

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
  private webAppUrl: string = ''

  private constructor() {}

  static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService()
    }
    return GoogleSheetsService.instance
  }

  setWebAppUrl(url: string) {
    this.webAppUrl = url
  }

  async appendToSheet(data: GoogleSheetData): Promise<void> {
    try {
      if (!this.webAppUrl) {
        throw new Error('Web App URL not set')
      }

      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Data appended to Google Sheets:', result)

    } catch (error) {
      console.error('Error appending to Google Sheet:', error)
      throw error
    }
  }

  // Alternative method using direct Google Sheets API with API key (limited)
  async appendWithApiKey(data: GoogleSheetData, apiKey: string, spreadsheetId: string): Promise<void> {
    try {
      const range = 'Sheet1!A:T'
      const values = [[
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
      ]]

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&key=${apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: values
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Data appended with API key:', result)

    } catch (error) {
      console.error('Error appending with API key:', error)
      throw error
    }
  }
}