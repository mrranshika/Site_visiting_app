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
import { Progress } from "@/components/ui/progress"
import { 
  CalendarIcon, 
  MapPin, 
  Upload, 
  Camera, 
  Video, 
  Plus, 
  Minus, 
  HelpCircle,
  User,
  Phone,
  MessageCircle,
  Home,
  Building,
  Calculator,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
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

const ceilingTypes = [
  "2 x 2 Eltoro Ceiling",
  "2 x 2 PVC Ceiling", 
  "Panel Flat Ceiling",
  "Panel Box Ceiling"
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
  const [activeTab, setActiveTab] = useState("basic")
  const [progress, setProgress] = useState(25)

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

  const updateProgress = (tabValue: string) => {
    const tabOrder = ["basic", "location", "media", "services"]
    const currentIndex = tabOrder.indexOf(tabValue)
    setProgress(((currentIndex + 1) / tabOrder.length) * 100)
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
      {/* Beautiful Header */}
      <header className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 animate-gradient-x"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-white/5 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
          <div className="absolute bottom-20 right-1/3 w-8 h-8 bg-white/5 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Wedabime</h1>
                  <p className="text-xs text-white/80">Pramukayo</p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGuidance(!showGuidance)}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {showGuidance ? 'Hide Guide' : 'Show Guide'}
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-shadow">
                Wedabime Pramukayo
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-6">
                Professional Site Visitor Management System
              </p>
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">Ready to streamline your site visits</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">500+</div>
                <div className="text-white/80">Site Visits Managed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-white/80">Availability</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-white/80">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative bg-white">
        {/* Guidance Section */}
        {showGuidance && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
              <Guidance />
            </div>
          </div>
        )}

        {/* Beautiful Form */}
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Progress Bar */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Form Progress</span>
                  <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            {/* Main Form Card */}
            <Card className="border-0 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <CardTitle className="text-2xl font-bold flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5" />
                  </div>
                  <span>Site Visit Registration</span>
                </CardTitle>
                <p className="text-blue-100 mt-2">Fill out the form below to register a new site visit</p>
              </CardHeader>
              
              <CardContent className="p-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
                    <Tabs value={activeTab} onValueChange={(value) => {
                      setActiveTab(value)
                      updateProgress(value)
                    }} className="w-full">
                      <TabsList className="grid w-full grid-cols-4 bg-gray-50 p-1 rounded-none border-b">
                        <TabsTrigger 
                          value="basic" 
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex flex-col space-y-1 py-3"
                        >
                          <User className="w-4 h-4" />
                          <span className="text-xs">Basic Info</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="location" 
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex flex-col space-y-1 py-3"
                        >
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs">Location</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="media" 
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex flex-col space-y-1 py-3"
                        >
                          <Camera className="w-4 h-4" />
                          <span className="text-xs">Media</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="services" 
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex flex-col space-y-1 py-3"
                        >
                          <Building className="w-4 h-4" />
                          <span className="text-xs">Services</span>
                        </TabsTrigger>
                      </TabsList>

                      {/* Basic Information Tab */}
                      <TabsContent value="basic" className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="customerId"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                  <span>Customer ID</span>
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="A-000a01" 
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                                    readOnly
                                    {...field} 
                                  />
                                </FormControl>
                                <p className="text-xs text-gray-500">
                                  Auto-generated unique identifier
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="dateReceived"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                  <CalendarIcon className="w-4 h-4 text-blue-500" />
                                  <span>Date Received</span>
                                </FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal border-gray-300 focus:border-blue-500 bg-gray-50",
                                          !field.value && "text-gray-500"
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
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                  <User className="w-4 h-4 text-blue-500" />
                                  <span>Customer Name</span>
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter customer name" 
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
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
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                  <Phone className="w-4 h-4 text-blue-500" />
                                  <span>Phone Number</span>
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="+94 XX XXX XXXX" 
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="district"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-semibold text-gray-700">District</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="border-gray-300 focus:border-blue-500 bg-gray-50">
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
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-semibold text-gray-700">City</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter city name" 
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormField
                            control={form.control}
                            name="hasWhatsApp"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="mt-1"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Has WhatsApp
                                  </FormLabel>
                                  <p className="text-xs text-gray-500">
                                    Customer uses WhatsApp
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="hasRemovals"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="mt-1"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Has Removals
                                  </FormLabel>
                                  <p className="text-xs text-gray-500">
                                    Removal work required
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="hasAdditionalLabour"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="mt-1"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Additional Labour
                                  </FormLabel>
                                  <p className="text-xs text-gray-500">
                                    Extra labour needed
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            type="button" 
                            onClick={() => setActiveTab("location")}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Next: Location
                            <MapPin className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </TabsContent>

                      {/* Location Tab */}
                      <TabsContent value="location" className="p-6 space-y-6">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                <Home className="w-4 h-4 text-blue-500" />
                                <span>Full Address</span>
                              </FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter complete address" 
                                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-900">Location Services</span>
                          </div>
                          <p className="text-sm text-blue-700 mb-3">
                            Get your current location automatically for accurate site visit coordinates.
                          </p>
                          <Button 
                            type="button"
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-100"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            {locationLoading ? 'Getting Location...' : 'Get Current Location'}
                          </Button>
                        </div>

                        <div className="flex justify-between">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setActiveTab("basic")}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Previous: Basic Info
                          </Button>
                          <Button 
                            type="button" 
                            onClick={() => setActiveTab("media")}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Next: Media
                            <Camera className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </TabsContent>

                      {/* Media Tab */}
                      <TabsContent value="media" className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Images Upload */}
                          <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                            <CardContent className="p-4 text-center">
                              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <h3 className="font-semibold text-gray-700 mb-2">Site Images</h3>
                              <p className="text-sm text-gray-500 mb-4">Upload site photos (max 20)</p>
                              <Input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleFileUpload('images', e.target.files!)}
                                className="hidden"
                                id="image-upload"
                              />
                              <Button 
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('image-upload')?.click()}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Images
                              </Button>
                              {selectedFiles.images.length > 0 && (
                                <div className="mt-3">
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    {selectedFiles.images.length} uploaded
                                  </Badge>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Drawings Upload */}
                          <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                            <CardContent className="p-4 text-center">
                              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <h3 className="font-semibold text-gray-700 mb-2">Site Drawings</h3>
                              <p className="text-sm text-gray-500 mb-4">Upload technical drawings (max 20)</p>
                              <Input
                                type="file"
                                multiple
                                accept=".pdf,.dwg,.dxf"
                                onChange={(e) => handleFileUpload('drawings', e.target.files!)}
                                className="hidden"
                                id="drawing-upload"
                              />
                              <Button 
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('drawing-upload')?.click()}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Drawings
                              </Button>
                              {selectedFiles.drawings.length > 0 && (
                                <div className="mt-3">
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    {selectedFiles.drawings.length} uploaded
                                  </Badge>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Videos Upload */}
                          <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                            <CardContent className="p-4 text-center">
                              <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <h3 className="font-semibold text-gray-700 mb-2">Site Videos</h3>
                              <p className="text-sm text-gray-500 mb-4">Upload site videos (max 2, 30s each)</p>
                              <Input
                                type="file"
                                multiple
                                accept="video/*"
                                onChange={(e) => handleFileUpload('videos', e.target.files!)}
                                className="hidden"
                                id="video-upload"
                              />
                              <Button 
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('video-upload')?.click()}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Videos
                              </Button>
                              {selectedFiles.videos.length > 0 && (
                                <div className="mt-3">
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                    {selectedFiles.videos.length} uploaded
                                  </Badge>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        <div className="flex justify-between">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setActiveTab("location")}
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Previous: Location
                          </Button>
                          <Button 
                            type="button" 
                            onClick={() => setActiveTab("services")}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Next: Services
                            <Building className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </TabsContent>

                      {/* Services Tab */}
                      <TabsContent value="services" className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="serviceType"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                  <Building className="w-4 h-4 text-blue-500" />
                                  <span>Service Type</span>
                                </FormLabel>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-1 gap-3"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Roof" id="roof" />
                                    <label htmlFor="roof" className="text-sm font-medium cursor-pointer">
                                      Roof Services
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Ceiling" id="ceiling" />
                                    <label htmlFor="ceiling" className="text-sm font-medium cursor-pointer">
                                      Ceiling Services
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Gutters" id="gutters" />
                                    <label htmlFor="gutters" className="text-sm font-medium cursor-pointer">
                                      Gutter Services
                                    </label>
                                  </div>
                                </RadioGroup>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-semibold text-gray-700">Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="border-gray-300 focus:border-blue-500 bg-gray-50">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Pending">
                                      <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4" />
                                        <span>Pending</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Running">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>Running</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Complete">
                                      <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Complete</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Cancel">
                                      <div className="flex items-center space-x-2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        <span>Cancel</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Ceiling Specific Fields */}
                        {serviceType === "Ceiling" && (
                          <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="p-4 space-y-4">
                              <h3 className="font-semibold text-blue-900 flex items-center space-x-2">
                                <Calculator className="w-5 h-5" />
                                <span>Ceiling Calculation</span>
                              </h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="ceilingType"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-sm font-medium text-blue-900">Ceiling Type</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="border-blue-300 bg-white">
                                            <SelectValue placeholder="Select ceiling type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {ceilingTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                              {type}
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
                                  name="pricePerSquareFeet"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-sm font-medium text-blue-900">Price per sq.ft</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number"
                                          placeholder="0.00"
                                          className="border-blue-300 bg-white"
                                          {...field}
                                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        />
                                      </FormControl>
                                      <p className="text-xs text-blue-700">
                                        Auto-calculated based on type
                                      </p>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Ceiling Areas */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-blue-900">Area Measurements</h4>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendCeilingArea({ length: 0, width: 0 })}
                                    className="border-blue-300 text-blue-700"
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Area
                                  </Button>
                                </div>

                                {ceilingFields.map((field, index) => (
                                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                    <FormField
                                      control={form.control}
                                      name={`ceilingAreas.${index}.length`}
                                      render={({ field }) => (
                                        <FormItem className="space-y-1">
                                          <FormLabel className="text-xs font-medium text-blue-900">Length (ft)</FormLabel>
                                          <FormControl>
                                            <Input 
                                              type="number"
                                              placeholder="0"
                                              className="border-blue-300 bg-white"
                                              {...field}
                                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                                        <FormItem className="space-y-1">
                                          <FormLabel className="text-xs font-medium text-blue-900">Width (ft)</FormLabel>
                                          <FormControl>
                                            <Input 
                                              type="number"
                                              placeholder="0"
                                              className="border-blue-300 bg-white"
                                              {...field}
                                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeCeilingArea(index)}
                                      className="border-red-300 text-red-700 hover:bg-red-50"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}

                                {/* Calculation Summary */}
                                <div className="bg-white rounded-lg p-3 border border-blue-200">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-blue-700">Total Area:</span>
                                      <div className="font-semibold text-blue-900">
                                        {calculateTotalArea().toFixed(2)} sq.ft
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-blue-700">Total Price:</span>
                                      <div className="font-semibold text-blue-900">
                                        Rs. {calculateTotalPrice().toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <div className="flex justify-between">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setActiveTab("media")}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Previous: Media
                          </Button>
                          <Button 
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 px-8"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Submit Form
                              </>
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Beautiful Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Wedabime Pramukayo</h3>
              <p className="text-gray-400 text-sm">
                Professional site visitor management system for construction and renovation services.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Roof Installation</li>
                <li>Ceiling Services</li>
                <li>Gutter Installation</li>
                <li>Site Consultation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>📧 info@wedabime.com</li>
                <li>📞 +94 11 234 5678</li>
                <li>📍 Colombo, Sri Lanka</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Wedabime Pramukayo. All rights reserved.</p>
            <p className="mt-2">High School Diploma Project</p>
          </div>
        </div>
      </footer>
    </div>
  )
}