"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HelpCircle, Menu, X, Home, Info, Mail, Phone } from "lucide-react"

export default function BeautifulHeader({ onToggleGuidance, showGuidance }: { 
  onToggleGuidance: () => void
  showGuidance: boolean 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
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
      <nav className="relative z-10 glass-effect border-b border-white/20">
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-white/90 hover:text-white transition-colors flex items-center space-x-1">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </a>
              <a href="#" className="text-white/90 hover:text-white transition-colors flex items-center space-x-1">
                <Info className="w-4 h-4" />
                <span>About</span>
              </a>
              <a href="#" className="text-white/90 hover:text-white transition-colors flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>Contact</span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleGuidance}
                className="hidden sm:flex items-center space-x-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showGuidance ? 'Hide Guide' : 'Show Guide'}</span>
              </Button>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-white hover:bg-white/20"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/20">
              <div className="flex flex-col space-y-3">
                <a href="#" className="text-white/90 hover:text-white transition-colors flex items-center space-x-2 py-2">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </a>
                <a href="#" className="text-white/90 hover:text-white transition-colors flex items-center space-x-2 py-2">
                  <Info className="w-4 h-4" />
                  <span>About</span>
                </a>
                <a href="#" className="text-white/90 hover:text-white transition-colors flex items-center space-x-2 py-2">
                  <Phone className="w-4 h-4" />
                  <span>Contact</span>
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onToggleGuidance()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full justify-start bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  {showGuidance ? 'Hide Guide' : 'Show Guide'}
                </Button>
              </div>
            </div>
          )}
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
            <div className="glass-effect rounded-xl p-6 hover-scale">
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-white/80">Site Visits Managed</div>
            </div>
            <div className="glass-effect rounded-xl p-6 hover-scale">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80">Availability</div>
            </div>
            <div className="glass-effect rounded-xl p-6 hover-scale">
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
  )
}