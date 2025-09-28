"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MapPin, Upload, Camera, Video, Plus, Minus, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateCustomerId, validateCustomerId } from "@/lib/customer-id"
import Guidance from "@/components/guidance"

// Form validation schema
const siteVisitSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required")
    .refine((val) => validateCustomerId(val), "Invalid Customer ID format"),
  dateReceived: z.date(),
  customerName: z.string().min(1, "Customer name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  hasWhatsApp: z.boolean(),
  hasWhatsAppNumber: z.boolean().optional(),
  whatsappNumber: z.string().optional(),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  hasRemovals: z.boolean(),
  removalCharge: z.number().optional(),
  hasAdditionalLabour: z.boolean(),
  additionalLabourCharge: z.number().optional(),
  serviceType: z.enum(["Roof", "Ceiling", "Gutters"]),
  status: z.enum(["Pending", "Running", "Complete", "Cancel"]),
  quotationNumber: z.string().optional(),
  quotationAttachment: z.string().optional(),
  // Ceiling specific fields
  ceilingType: z.string().optional(),
  hasMacfoil: z.boolean().optional(),
  pricePerSquareFeet: z.number().optional(),
  ceilingAreas: z.array(z.object({
    length: z.number(),
    width: z.number(),
  })).optional(),
  // Gutter specific fields
  guttersValanceB: z.string().optional(),
  bFlashingValanceB: z.string().optional(),
  gutters: z.string().optional(),
  valanceB: z.string().optional(),
  bFlashing: z.string().optional(),
  dPipes: z.string().optional(),
  nozzels: z.number().optional(),
  endCaps: z.number().optional(),
  chainPackets: z.number().optional(),
  wallFSize: z.string().optional(),
  wallF: z.string().optional(),
  blindWallFlashingSize: z.string().optional(),
  blindWallFlashing: z.string().optional(),
  ridgeCover: z.string().optional(),
  ratGuard: z.string().optional(),
  customDesignNote: z.string().optional(),
  // Roof specific fields
  roofType: z.string().optional(),
  structureType: z.string().optional(),
  finishType: z.string().optional(),
  materialType: z.string().optional(),
  color: z.string().optional(),
  subType: z.string().optional(),
})

type SiteVisitForm = z.infer<typeof siteVisitSchema>

const districts = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle"
]

export default function WedabimePramukayo() {
  const [selectedFiles, setSelectedFiles] = useState<{
    images: File[]
    drawings: File[]
    videos: File[]
  }>({
    images: [],
    drawings: [],
    videos: []
  })

  const [currentCustomerId, setCurrentCustomerId] = useState('A-000a01')
  const [isLoading, setIsLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [showGuidance, setShowGuidance] = useState(false)

  const form = useForm<SiteVisitForm>({
    resolver: zodResolver(siteVisitSchema),
    defaultValues: {
      customerId: 'A-000a01',
      hasWhatsApp: false,
      hasRemovals: false,
      hasAdditionalLabour: false,
      serviceType: "Roof",
      status: "Pending",
      ceilingAreas: [],
    }
  })

  const { fields: ceilingFields, append: appendCeilingArea, remove: removeCeilingArea } = useFieldArray({
    control: form.control,
    name: "ceilingAreas"
  })

  const serviceType = form.watch("serviceType")
  const hasWhatsApp = form.watch("hasWhatsApp")
  const hasWhatsAppNumber = form.watch("hasWhatsAppNumber")
  const hasRemovals = form.watch("hasRemovals")
  const hasAdditionalLabour = form.watch("hasAdditionalLabour")
  const ceilingType = form.watch("ceilingType")

  const handleFileUpload = (type: 'images' | 'drawings' | 'videos', files: FileList) => {
    const newFiles = Array.from(files)
    setSelectedFiles(prev => ({
      ...prev,
      [type]: [...prev[type], ...newFiles].slice(0, 20)
    }))
  }

  const removeFile = (type: 'images' | 'drawings' | 'videos', index: number) => {
    setSelectedFiles(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const onSubmit = async (data: SiteVisitForm) => {
    try {
      setIsLoading(true)
      
      // Calculate ceiling totals if applicable
      let totalArea = 0
      let totalPrice = 0
      
      if (data.serviceType === "Ceiling" && data.ceilingAreas) {
        totalArea = data.ceilingAreas.reduce((sum, area) => sum + (area.length * area.width), 0)
        totalPrice = totalArea * (data.pricePerSquareFeet || 0)
      }

      const formData = new FormData()
      
      // Add form data
      const submissionData = {
        ...data,
        totalArea,
        totalPrice,
        dateReceived: data.dateReceived.toISOString(),
      }
      
      formData.append('data', JSON.stringify(submissionData))
      
      // Add files
      selectedFiles.images.forEach((file) => {
        formData.append('files', file)
      })
      
      selectedFiles.drawings.forEach((file) => {
        formData.append('files', file)
      })
      
      selectedFiles.videos.forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch('/api/site-visits', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        
        // Generate next customer ID
        const nextCustomerId = generateCustomerId(data.customerId)
        setCurrentCustomerId(nextCustomerId)
        
        // Reset form with new customer ID
        form.reset({
          customerId: nextCustomerId,
          hasWhatsApp: false,
          hasRemovals: false,
          hasAdditionalLabour: false,
          serviceType: "Roof",
          status: "Pending",
          ceilingAreas: [],
        })
        
        // Clear files
        setSelectedFiles({ images: [], drawings: [], videos: [] })
        
        alert('Site visit created successfully!')
      } else {
        const error = await response.json()
        alert('Failed to create site visit: ' + error.error)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Failed to submit form. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getCeilingPrice = (type: string) => {
    switch (type) {
      case "2 x 2 Eltoro Ceiling": return 180
      case "2 x 2 PVC Ceiling": return 250
      case "Panel Flat Ceiling": return 360
      case "Panel Box Ceiling": return 430
      default: return 0
    }
  }

  const calculateTotalArea = () => {
    const areas = form.watch("ceilingAreas") || []
    return areas.reduce((total, area) => total + (area.length * area.width), 0)
  }

  const calculateTotalPrice = () => {
    const totalArea = calculateTotalArea()
    const pricePerSqFt = form.watch("pricePerSquareFeet") || 0
    return totalArea * pricePerSqFt
  }

  // Location functions
  const getCurrentLocation = () => {
    setLocationLoading(true)
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setMapCenter({ lat: latitude, lng: longitude })
        setMarkerPosition({ lat: latitude, lng: longitude })
        
        // Update form fields
        form.setValue('latitude', latitude)
        form.setValue('longitude', longitude)
        
        setLocationLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location. Please enable location services and try again.')
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleMapClick = (event: any) => {
    if (event && event.latlng) {
      const { lat, lng } = event.latlng
      setMarkerPosition({ lat, lng })
      form.setValue('latitude', lat)
      form.setValue('longitude', lng)
    }
  }

  // Fetch the last customer ID when component mounts
  useEffect(() => {
    const fetchLastCustomerId = async () => {
      try {
        const response = await fetch('/api/site-visits')
        if (response.ok) {
          const siteVisits = await response.json()
          if (siteVisits.length > 0) {
            const lastCustomerId = siteVisits[0].customerId
            const newCustomerId = generateCustomerId(lastCustomerId)
            setCurrentCustomerId(newCustomerId)
            form.setValue('customerId', newCustomerId)
          }
        }
      } catch (error) {
        console.error('Error fetching last customer ID:', error)
      }
    }

    fetchLastCustomerId()
  }, [form])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-green-800 mb-2">Wedabime Pramukayo</h1>
              <p className="text-lg text-blue-700">Site Visitor Management System</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGuidance(!showGuidance)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              {showGuidance ? 'Hide Guide' : 'Show Guide'}
            </Button>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardTitle className="text-2xl">Site Visit Form</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                  </TabsList>

                  {/* Basic Information Tab */}
                  <TabsContent value="basic" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-green-700 font-semibold">Customer ID</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="A-000a01" 
                                className="border-green-300 focus:border-green-500 bg-gray-50"
                                readOnly
                                {...field} 
                              />
                            </FormControl>
                            <p className="text-sm text-gray-500 mt-1">
                              Auto-generated starting from A-000a01
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateReceived"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-green-700 font-semibold">Date Received</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal border-green-300 focus:border-green-500",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "yyyy/MM/dd [EEEE]")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-green-700 font-semibold">Customer Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter customer name" 
                                className="border-green-300 focus:border-green-500"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-green-700 font-semibold">Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="+94 XX XXX XXXX" 
                                className="border-green-300 focus:border-green-500"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hasWhatsApp"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-green-600"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-green-700 font-semibold">
                                Available on WhatsApp
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {!hasWhatsApp && (
                        <FormField
                          control={form.control}
                          name="hasWhatsAppNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-green-700 font-semibold">Has WhatsApp Number?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={(value) => field.onChange(value === "true")}
                                  value={field.value?.toString()}
                                  className="flex space-x-6"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="true" id="whatsapp-yes" className="text-green-600" />
                                    <Label htmlFor="whatsapp-yes" className="text-green-700">Yes</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="false" id="whatsapp-no" className="text-green-600" />
                                    <Label htmlFor="whatsapp-no" className="text-green-700">No</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {hasWhatsAppNumber && (
                        <FormField
                          control={form.control}
                          name="whatsappNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-green-700 font-semibold">WhatsApp Number</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="+94 XX XXX XXXX" 
                                  className="border-green-300 focus:border-green-500"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-green-700 font-semibold">District</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-green-300 focus:border-green-500">
                                  <SelectValue placeholder="Select district" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {districts.map((district) => (
                                  <SelectItem key={district} value={district}>
                                    {district}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-green-700 font-semibold">City</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter city" 
                                className="border-green-300 focus:border-green-500"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-700 font-semibold">Address (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter complete address" 
                              className="border-green-300 focus:border-green-500"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="hasRemovals"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-green-600"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-green-700 font-semibold">
                                Has Removals
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {hasRemovals && (
                        <FormField
                          control={form.control}
                          name="removalCharge"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-green-700 font-semibold">Removal Charge (Rs.)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="0.00" 
                                  className="border-green-300 focus:border-green-500"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="hasAdditionalLabour"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-green-600"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-green-700 font-semibold">
                                Additional Labour Charge
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {hasAdditionalLabour && (
                        <FormField
                          control={form.control}
                          name="additionalLabourCharge"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-green-700 font-semibold">Additional Labour Charge (Rs.)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="0.00" 
                                  className="border-green-300 focus:border-green-500"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-700 font-semibold">Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-green-300 focus:border-green-500">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Running">Running</SelectItem>
                              <SelectItem value="Complete">Complete</SelectItem>
                              <SelectItem value="Cancel">Cancel</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* Location Tab */}
                  <TabsContent value="location" className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="text-blue-600" />
                          <h3 className="text-lg font-semibold text-blue-800">Google Maps Location</h3>
                        </div>
                        <Button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={locationLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {locationLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Getting Location...
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4 mr-2" />
                              Use Current Location
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name="latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-700 font-semibold">Latitude</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  step="any"
                                  placeholder="6.9271" 
                                  className="border-blue-300 focus:border-blue-500"
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value)
                                    field.onChange(value || undefined)
                                    if (value && markerPosition) {
                                      setMarkerPosition({ lat: value, lng: markerPosition.lng })
                                    } else if (value) {
                                      setMarkerPosition({ lat: value, lng: 79.8612 })
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="longitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-700 font-semibold">Longitude</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  step="any"
                                  placeholder="79.8612" 
                                  className="border-blue-300 focus:border-blue-500"
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value)
                                    field.onChange(value || undefined)
                                    if (value && markerPosition) {
                                      setMarkerPosition({ lat: markerPosition.lat, lng: value })
                                    } else if (value) {
                                      setMarkerPosition({ lat: 6.9271, lng: value })
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Google Maps Container */}
                      <div className="mt-4">
                        <div className="h-96 w-full bg-gray-100 rounded-lg overflow-hidden relative">
                          {mapCenter ? (
                            <div className="w-full h-full flex items-center justify-center bg-blue-50">
                              <div className="text-center">
                                <div className="mb-4">
                                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                                    <MapPin className="h-8 w-8 text-white" />
                                  </div>
                                </div>
                                <p className="text-blue-800 font-semibold">
                                  Location Selected
                                </p>
                                <p className="text-blue-600 text-sm">
                                  {markerPosition?.lat?.toFixed(6)}, {markerPosition?.lng?.toFixed(6)}
                                </p>
                                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                  <p className="text-blue-700 text-xs">
                                    📍 Google Maps integration ready. In production, this would show an interactive map.
                                  </p>
                                  <p className="text-blue-700 text-xs mt-1">
                                    🎯 Click "Use Current Location" to auto-detect your position.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <div className="text-center">
                                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 font-semibold mb-2">
                                  No Location Selected
                                </p>
                                <p className="text-gray-400 text-sm mb-4">
                                  Click "Use Current Location" to detect your position
                                </p>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-center space-x-2 text-blue-600">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                    <span className="text-sm">Location services ready</span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    📱 Requires location permission
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location Info */}
                      {markerPosition && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                            <h4 className="text-green-800 font-semibold">Location Details</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-green-600 font-medium">Latitude:</span>
                              <span className="text-green-800 ml-2">{markerPosition.lat?.toFixed(6)}</span>
                            </div>
                            <div>
                              <span className="text-green-600 font-medium">Longitude:</span>
                              <span className="text-green-800 ml-2">{markerPosition.lng?.toFixed(6)}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-green-600">
                            📍 Location coordinates saved and will be included in the site visit report
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Media Tab */}
                  <TabsContent value="media" className="space-y-6">
                    {/* Images Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Camera className="text-green-600" />
                        <h3 className="text-lg font-semibold text-green-800">Site Images ({selectedFiles.images.length}/20)</h3>
                      </div>
                      <div className="border-2 border-dashed border-green-300 rounded-lg p-6">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileUpload('images', e.target.files)}
                          className="mb-4"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {selectedFiles.images.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index}`}
                                className="w-full h-24 object-cover rounded"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1"
                                onClick={() => removeFile('images', index)}
                              >
                                ×
                              </Button>
                              <p className="text-xs mt-1 truncate">{file.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Drawings Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Upload className="text-blue-600" />
                        <h3 className="text-lg font-semibold text-blue-800">Site Drawings ({selectedFiles.drawings.length}/20)</h3>
                      </div>
                      <div className="border-2 border-dashed border-blue-300 rounded-lg p-6">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileUpload('drawings', e.target.files)}
                          className="mb-4"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {selectedFiles.drawings.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Drawing ${index}`}
                                className="w-full h-24 object-cover rounded"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1"
                                onClick={() => removeFile('drawings', index)}
                              >
                                ×
                              </Button>
                              <p className="text-xs mt-1 truncate">{file.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Videos Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Video className="text-purple-600" />
                        <h3 className="text-lg font-semibold text-purple-800">Site Videos ({selectedFiles.videos.length}/2)</h3>
                      </div>
                      <div className="border-2 border-dashed border-purple-300 rounded-lg p-6">
                        <Input
                          type="file"
                          accept="video/*"
                          multiple
                          onChange={(e) => handleFileUpload('videos', e.target.files)}
                          className="mb-4"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedFiles.videos.map((file, index) => (
                            <div key={index} className="relative">
                              <video
                                src={URL.createObjectURL(file)}
                                className="w-full h-24 object-cover rounded"
                                controls={false}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1"
                                onClick={() => removeFile('videos', index)}
                              >
                                ×
                              </Button>
                              <p className="text-xs mt-1 truncate">{file.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Services Tab */}
                  <TabsContent value="services" className="space-y-6">
                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-700 font-semibold">Service Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-green-300 focus:border-green-500">
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Roof">Roof</SelectItem>
                              <SelectItem value="Ceiling">Ceiling</SelectItem>
                              <SelectItem value="Gutters">Gutters</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    {/* Ceiling Services */}
                    {serviceType === "Ceiling" && (
                      <div className="space-y-6 bg-green-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-800">Ceiling Services</h3>
                        
                        <FormField
                          control={form.control}
                          name="ceilingType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-green-700 font-semibold">Ceiling Type</FormLabel>
                              <Select onValueChange={(value) => {
                                field.onChange(value)
                                form.setValue("pricePerSquareFeet", getCeilingPrice(value))
                              }} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-green-300 focus:border-green-500">
                                    <SelectValue placeholder="Select ceiling type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="2 x 2 Eltoro Ceiling">2 x 2 Eltoro Ceiling</SelectItem>
                                  <SelectItem value="2 x 2 PVC Ceiling">2 x 2 PVC Ceiling</SelectItem>
                                  <SelectItem value="Panel Flat Ceiling">Panel Flat Ceiling</SelectItem>
                                  <SelectItem value="Panel Box Ceiling">Panel Box Ceiling</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {ceilingType === "2 x 2 Eltoro Ceiling" && (
                          <FormField
                            control={form.control}
                            name="hasMacfoil"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-green-600"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-green-700 font-semibold">
                                    Macfoil
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="pricePerSquareFeet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-green-700 font-semibold">Price per Square Feet (Rs.)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="180" 
                                  className="border-green-300 focus:border-green-500"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-green-700 font-semibold">Areas</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => appendCeilingArea({ length: 0, width: 0 })}
                              className="border-green-300 text-green-700 hover:bg-green-50"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Area
                            </Button>
                          </div>

                          {ceilingFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                              <FormField
                                control={form.control}
                                name={`ceilingAreas.${index}.length`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-green-700">Length (feet)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        placeholder="10" 
                                        className="border-green-300 focus:border-green-500"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`ceilingAreas.${index}.width`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-green-700">Width (feet)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        placeholder="10" 
                                        className="border-green-300 focus:border-green-500"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeCeilingArea(index)}
                                disabled={ceilingFields.length === 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <div className="bg-green-100 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-green-700 font-semibold">Total Area: {calculateTotalArea().toFixed(2)} sq.ft</p>
                            </div>
                            <div>
                              <p className="text-green-700 font-semibold">Total Price: Rs. {calculateTotalPrice().toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="quotationNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-green-700 font-semibold">Quotation Number</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Q-001" 
                                    className="border-green-300 focus:border-green-500"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="quotationAttachment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-green-700 font-semibold">Quotation Attachment (PDF)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="file"
                                    accept=".pdf"
                                    className="border-green-300 focus:border-green-500"
                                    onChange={(e) => field.onChange(e.target.files?.[0]?.name || "")}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Gutters Services */}
                    {serviceType === "Gutters" && (
                      <div className="space-y-6 bg-blue-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800">Gutters Services</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            { name: "guttersValanceB", label: "Gutters & Valance/B" },
                            { name: "bFlashingValanceB", label: "B/Flashing & Valance/B" },
                            { name: "gutters", label: "Gutters" },
                            { name: "valanceB", label: "Valance/B" },
                            { name: "bFlashing", label: "B/Flashing" },
                            { name: "dPipes", label: "D/Pipes" },
                          ].map((item) => (
                            <FormField
                              key={item.name}
                              control={form.control}
                              name={item.name as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-blue-700 font-semibold">{item.label}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="5' + 6' + 3'" 
                                      className="border-blue-300 focus:border-blue-500"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            { name: "nozzels", label: "Nozzels" },
                            { name: "endCaps", label: "End Caps" },
                            { name: "chainPackets", label: "Chain Packets" },
                          ].map((item) => (
                            <FormField
                              key={item.name}
                              control={form.control}
                              name={item.name as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-blue-700 font-semibold">{item.label}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number"
                                      placeholder="0" 
                                      className="border-blue-300 focus:border-blue-500"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="wallFSize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-blue-700 font-semibold">Wall/F Size</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="border-blue-300 focus:border-blue-500">
                                        <SelectValue placeholder="Select size" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="9">9"</SelectItem>
                                      <SelectItem value="12">12"</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="wallF"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-blue-700 font-semibold">Wall/F</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="5' + 6' + 3'" 
                                      className="border-blue-300 focus:border-blue-500"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="blindWallFlashingSize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-blue-700 font-semibold">Blind Wall Flashing Size</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="border-blue-300 focus:border-blue-500">
                                        <SelectValue placeholder="Select size" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="9">9"</SelectItem>
                                      <SelectItem value="12">12"</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="blindWallFlashing"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-blue-700 font-semibold">Blind Wall Flashing</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="5' + 6' + 3'" 
                                      className="border-blue-300 focus:border-blue-500"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            { name: "ridgeCover", label: "Ridge Cover" },
                            { name: "ratGuard", label: "Rat Guard" },
                          ].map((item) => (
                            <FormField
                              key={item.name}
                              control={form.control}
                              name={item.name as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-blue-700 font-semibold">{item.label}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="5' + 6' + 3'" 
                                      className="border-blue-300 focus:border-blue-500"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>

                        <FormField
                          control={form.control}
                          name="customDesignNote"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-700 font-semibold">Custom Design Note</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter custom design notes" 
                                  className="border-blue-300 focus:border-blue-500"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="quotationNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-blue-700 font-semibold">Quotation Number</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Q-001" 
                                    className="border-blue-300 focus:border-blue-500"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="quotationAttachment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-blue-700 font-semibold">Quotation Attachment (PDF)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="file"
                                    accept=".pdf"
                                    className="border-blue-300 focus:border-blue-500"
                                    onChange={(e) => field.onChange(e.target.files?.[0]?.name || "")}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Roof Services */}
                    {serviceType === "Roof" && (
                      <div className="space-y-6 bg-orange-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-orange-800">Roof Services</h3>
                        
                        <FormField
                          control={form.control}
                          name="roofType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-orange-700 font-semibold">Roof Type</FormLabel>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex space-x-6"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="New Roof" id="new-roof" className="text-orange-600" />
                                  <Label htmlFor="new-roof" className="text-orange-700">New Roof</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Repair Roof" id="repair-roof" className="text-orange-600" />
                                  <Label htmlFor="repair-roof" className="text-orange-700">Repair Roof</Label>
                                </div>
                              </RadioGroup>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="structureType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-orange-700 font-semibold">Structure Type</FormLabel>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex space-x-6"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Wood Roof" id="wood-roof" className="text-orange-600" />
                                  <Label htmlFor="wood-roof" className="text-orange-700">Wood Roof</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Steel Roof" id="steel-roof" className="text-orange-600" />
                                  <Label htmlFor="steel-roof" className="text-orange-700">Steel Roof</Label>
                                </div>
                              </RadioGroup>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="finishType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-orange-700 font-semibold">Finish Type</FormLabel>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex space-x-6"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Normal Roof" id="normal-roof" className="text-orange-600" />
                                  <Label htmlFor="normal-roof" className="text-orange-700">Normal Roof</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Finishing Roof" id="finishing-roof" className="text-orange-600" />
                                  <Label htmlFor="finishing-roof" className="text-orange-700">Finishing Roof</Label>
                                </div>
                              </RadioGroup>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="materialType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-orange-700 font-semibold">Material Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-orange-300 focus:border-orange-500">
                                    <SelectValue placeholder="Select material type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Asbestos (Non Color)">Asbestos (Non Color)</SelectItem>
                                  <SelectItem value="Asbestos (Color)">Asbestos (Color)</SelectItem>
                                  <SelectItem value="Tile (Ulu)">Tile (Ulu)</SelectItem>
                                  <SelectItem value="Amano Normal">Amano Normal</SelectItem>
                                  <SelectItem value="Amano Curve Roof">Amano Curve Roof</SelectItem>
                                  <SelectItem value="Amano Tile Roof">Amano Tile Roof</SelectItem>
                                  <SelectItem value="UPVC Sheet">UPVC Sheet</SelectItem>
                                  <SelectItem value="Transparent Roofing Sheet">Transparent Roofing Sheet</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch("materialType") === "Asbestos (Color)" && (
                          <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-orange-700 font-semibold">Color</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="border-orange-300 focus:border-orange-500">
                                      <SelectValue placeholder="Select color" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Tile Red">Tile Red</SelectItem>
                                    <SelectItem value="Green">Green</SelectItem>
                                    <SelectItem value="Brown">Brown</SelectItem>
                                    <SelectItem value="Ash">Ash</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {form.watch("materialType") === "Amano Curve Roof" && (
                          <FormField
                            control={form.control}
                            name="subType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-orange-700 font-semibold">Curve Type</FormLabel>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="flex space-x-6"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Full Curve Roof" id="full-curve" className="text-orange-600" />
                                    <Label htmlFor="full-curve" className="text-orange-700">Full Curve Roof</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Half Curve Roof" id="half-curve" className="text-orange-600" />
                                    <Label htmlFor="half-curve" className="text-orange-700">Half Curve Roof</Label>
                                  </div>
                                </RadioGroup>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {form.watch("materialType") === "UPVC Sheet" && (
                          <FormField
                            control={form.control}
                            name="subType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-orange-700 font-semibold">UPVC Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="border-orange-300 focus:border-orange-500">
                                      <SelectValue placeholder="Select UPVC type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="J/L Roofing Sheet">J/L Roofing Sheet</SelectItem>
                                    <SelectItem value="I Roof Roofing Sheet">I Roof Roofing Sheet</SelectItem>
                                    <SelectItem value="Anton Roofing Sheet">Anton Roofing Sheet</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="quotationNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-orange-700 font-semibold">Quotation Number</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Q-001" 
                                    className="border-orange-300 focus:border-orange-500"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="quotationAttachment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-orange-700 font-semibold">Quotation Attachment (PDF)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="file"
                                    accept=".pdf"
                                    className="border-orange-300 focus:border-orange-500"
                                    onChange={(e) => field.onChange(e.target.files?.[0]?.name || "")}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button type="button" variant="outline" className="border-gray-300">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Submit Form'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {showGuidance && (
          <div className="mt-6">
            <Guidance />
          </div>
        )}
      </div>
    </div>
  )
}

function Label({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  )
}