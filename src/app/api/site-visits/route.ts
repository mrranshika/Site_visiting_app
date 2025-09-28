import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { GoogleSheetsService, GoogleSheetData } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const data = JSON.parse(formData.get('data') as string)
    const files = formData.getAll('files') as File[]

    // Create site visit record
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

    // Handle service-specific details
    if (data.serviceType === 'Ceiling' && data.ceilingType) {
      await db.ceilingDetails.create({
        data: {
          siteVisitId: siteVisit.id,
          ceilingType: data.ceilingType,
          hasMacfoil: data.hasMacfoil,
          pricePerSquareFeet: data.pricePerSquareFeet,
          totalArea: data.totalArea,
          totalPrice: data.totalPrice,
          areas: {
            create: data.ceilingAreas?.map((area: any) => ({
              length: area.length,
              width: area.width,
              area: area.length * area.width,
            })) || []
          }
        }
      })
    }

    if (data.serviceType === 'Gutters') {
      await db.gutterDetails.create({
        data: {
          siteVisitId: siteVisit.id,
          guttersValanceB: data.guttersValanceB,
          bFlashingValanceB: data.bFlashingValanceB,
          gutters: data.gutters,
          valanceB: data.valanceB,
          bFlashing: data.bFlashing,
          dPipes: data.dPipes,
          nozzels: data.nozzels,
          endCaps: data.endCaps,
          chainPackets: data.chainPackets,
          wallFSize: data.wallFSize,
          wallF: data.wallF,
          blindWallFlashingSize: data.blindWallFlashingSize,
          blindWallFlashing: data.blindWallFlashing,
          ridgeCover: data.ridgeCover,
          ratGuard: data.ratGuard,
          customDesignNote: data.customDesignNote,
        }
      })
    }

    if (data.serviceType === 'Roof') {
      await db.roofDetails.create({
        data: {
          siteVisitId: siteVisit.id,
          roofType: data.roofType,
          structureType: data.structureType,
          finishType: data.finishType,
          materialType: data.materialType,
          color: data.color,
          subType: data.subType,
        }
      })
    }

    // Handle file uploads (in a real app, you'd upload to cloud storage)
    // For now, we'll just simulate the file handling
    console.log('Files received:', files.length)

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

export async function GET() {
  try {
    const siteVisits = await db.siteVisit.findMany({
      include: {
        ceilingDetails: {
          include: {
            areas: true
          }
        },
        gutterDetails: true,
        roofDetails: true,
        siteImages: true,
        siteDrawings: true,
        siteVideos: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(siteVisits)
  } catch (error) {
    console.error('Error fetching site visits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site visits' },
      { status: 500 }
    )
  }
}