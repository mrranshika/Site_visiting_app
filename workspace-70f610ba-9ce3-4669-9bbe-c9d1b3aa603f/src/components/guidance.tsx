"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  HelpCircle, 
  User, 
  MapPin, 
  Camera, 
  Home, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Clock,
  Phone,
  MessageSquare
} from "lucide-react"

export default function Guidance() {
  const [activeTab, setActiveTab] = useState("overview")

  const steps = [
    {
      icon: User,
      title: "Customer Information",
      description: "Enter customer details and contact information",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: MapPin,
      title: "Location Details",
      description: "Add location using GPS or manual entry",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Camera,
      title: "Media Upload",
      description: "Upload site photos, drawings, and videos",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Home,
      title: "Service Selection",
      description: "Choose service type and enter specifications",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: CheckCircle,
      title: "Submit Form",
      description: "Review and submit the site visit form",
      color: "bg-emerald-100 text-emerald-600"
    }
  ]

  const faqs = [
    {
      question: "How do I get the current location?",
      answer: "Click the 'Get Current Location' button in the Location tab. Make sure to allow location access when prompted."
    },
    {
      question: "What file types can I upload?",
      answer: "You can upload images (JPG, PNG), drawings (PDF, DWG), and videos (MP4, MOV). Maximum 20 images, 20 drawings, and 2 videos (30 seconds each)."
    },
    {
      question: "How is the Customer ID generated?",
      answer: "Customer IDs are auto-generated starting from A-000a01. Each new submission gets the next ID in sequence."
    },
    {
      question: "Can I save a partially completed form?",
      answer: "Currently, the form must be completed in one session. Make sure to have all information ready before starting."
    },
    {
      question: "How do I calculate ceiling prices?",
      answer: "Select the ceiling type and price per square foot. The system automatically calculates total area and price based on the dimensions you enter."
    }
  ]

  const tips = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Have all customer information ready before starting the form"
    },
    {
      icon: Phone,
      title: "Contact Information",
      description: "Double-check phone numbers and WhatsApp availability"
    },
    {
      icon: MessageSquare,
      title: "Clear Communication",
      description: "Take clear photos and videos to show site conditions"
    },
    {
      icon: MapPin,
      title: "Accurate Location",
      description: "Use GPS location for precise site coordinates"
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Wedabime Pramukayo Guide</h1>
        <p className="text-gray-600">Everything you need to know about using the Site Visit Management System</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="steps">Step by Step</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Wedabime Pramukayo is a comprehensive site visitor management system designed for construction and renovation services. 
                It helps you efficiently manage site visits, track customer information, and document site conditions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Key Features</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Auto-generated customer IDs</li>
                    <li>• GPS location tracking</li>
                    <li>• Media upload capabilities</li>
                    <li>• Service-specific forms</li>
                    <li>• Real-time calculations</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Service Types</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Ceiling</Badge>
                    <Badge variant="secondary">Gutters</Badge>
                    <Badge variant="secondary">Roof</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${step.color}`}>
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-gray-400 mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Helpful Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <tip.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{tip.title}</h3>
                      <p className="text-gray-600 text-sm">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800">Location Not Working</h4>
                  <p className="text-yellow-700 text-sm">Make sure location services are enabled and you've granted permission to the browser.</p>
                </div>
                
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800">File Upload Failed</h4>
                  <p className="text-red-700 text-sm">Check file size limits and supported formats. Ensure files are not corrupted.</p>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Form Not Submitting</h4>
                  <p className="text-blue-700 text-sm">Ensure all required fields are filled. Check for validation errors marked in red.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1" variant="outline">
              Contact Support
            </Button>
            <Button className="flex-1" variant="outline">
              View Documentation
            </Button>
            <Button className="flex-1">
              Start Using System
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}