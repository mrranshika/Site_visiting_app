# 🎓 High School Diploma Project: Wedabime Pramukayo

## Project Overview
This is a comprehensive site visitor management system called "Wedabime Pramukayo" developed for a high school diploma project. The application helps manage site visits for construction and renovation services, with complete customer information tracking, location services, and Google Sheets integration.

## Features Implemented

### ✅ Core Features
- **Customer Management**: Auto-generated customer IDs starting from A-000a01
- **Location Services**: GPS location detection and Google Maps integration
- **Service Types**: Ceiling, Gutters, and Roof services with detailed specifications
- **File Management**: Image, drawing, and video uploads for site documentation
- **Status Tracking**: Pending, Running, Complete, and Cancel status management
- **Quotation System**: Quotation numbering and PDF attachment support

### ✅ Technical Features
- **Web Application**: Responsive Next.js application with modern UI
- **Mobile App**: Convertible to mobile app using WebIntoApp
- **Database**: Google Sheets as a free database solution
- **API Integration**: RESTful API with Google Apps Script
- **Form Validation**: Comprehensive form validation with error handling
- **Real-time Calculations**: Automatic area and price calculations

## Technology Stack

### Frontend
- **Next.js 15**: React framework with server-side rendering
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **React Hook Form**: Form management with validation
- **Zod**: Schema validation

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Google Apps Script**: Free API proxy for Google Sheets
- **Prisma**: Database ORM (SQLite for local development)
- **Z-AI SDK**: AI integration capabilities

### Database
- **Google Sheets**: Primary database (free)
- **SQLite**: Local development database

### Deployment
- **Vercel**: Free hosting platform
- **WebIntoApp**: Free mobile app conversion
- **GitHub**: Version control and CI/CD

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── site-visits/
│   │       └── route.ts          # API endpoint
│   ├── page.tsx                  # Main application
│   ├── layout.tsx               # App layout
│   └── globals.css              # Global styles
├── components/
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── customer-id.ts           # Customer ID generation
│   ├── google-sheets-free.ts    # Google Sheets integration
│   ├── google-sheets.ts         # Google Sheets service
│   ├── db.ts                    # Database connection
│   └── utils.ts                 # Utility functions
├── prisma/
│   └── schema.prisma            # Database schema
└── public/
    └── ...                      # Static assets
```

## Setup Instructions

### Prerequisites
- Node.js 16+ installed
- Google account for Google Sheets
- GitHub account for deployment

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/wedabime-pramukayo.git
   cd wedabime-pramukayo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Google Sheets**
   - Create a new Google Sheet
   - Set up Google Apps Script with the provided code
   - Deploy as web app and copy the URL

4. **Configure environment variables**
   ```bash
   # .env.local
   GOOGLE_SHEETS_WEB_APP_URL=your-web-app-url
   DATABASE_URL=file:./dev.db
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

### Deployment

#### Web Application
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect GitHub repository to Vercel
   - Set environment variables
   - Deploy automatically

#### Mobile Application
1. **Convert to mobile app**
   - Go to WebIntoApp.com
   - Enter your web app URL
   - Generate APK/IPA file
   - Install on mobile device

## Usage Guide

### For Site Visitors

1. **Customer Information**
   - Customer ID is auto-generated
   - Enter customer details and contact information
   - Specify WhatsApp availability

2. **Location Details**
   - Enter district and city
   - Use current location button for GPS coordinates
   - Optionally enter full address

3. **Media Upload**
   - Upload site images (up to 20)
   - Upload site drawings (up to 20)
   - Upload site videos (up to 2, 30 seconds each)

4. **Service Selection**
   - Choose service type (Ceiling, Gutters, or Roof)
   - Fill in service-specific details
   - Automatic calculations for pricing

5. **Submission**
   - Review all information
   - Submit form
   - Data saved to Google Sheets

### For Administrators

1. **Monitor Submissions**
   - Check Google Sheets for new entries
   - Track status of each site visit
   - Generate reports from the data

2. **Manage Data**
   - Export data from Google Sheets
   - Create backups regularly
   - Analyze trends and patterns

## Project Documentation

### Technical Documentation
- **API Documentation**: RESTful API endpoints and data structures
- **Database Schema**: Google Sheets structure and relationships
- **Architecture Overview**: System design and data flow
- **Integration Guide**: Third-party service integrations

### User Documentation
- **User Manual**: Step-by-step user guide
- **Administrator Guide**: Management and monitoring
- **Troubleshooting**: Common issues and solutions
- **FAQ**: Frequently asked questions

## Learning Outcomes

### Technical Skills
- **Web Development**: Next.js, React, TypeScript
- **Database Management**: Google Sheets, Prisma ORM
- **API Development**: RESTful APIs, Google Apps Script
- **Mobile Development**: Web-to-app conversion
- **Deployment**: Vercel, CI/CD pipelines

### Soft Skills
- **Project Management**: Complete project lifecycle
- **Problem Solving**: Technical challenges and solutions
- **Documentation**: Technical and user documentation
- **Presentation**: Project demonstration and explanation

### Business Skills
- **Requirements Analysis**: Understanding user needs
- **System Design**: Architecture and planning
- **Quality Assurance**: Testing and validation
- **User Experience**: Interface design and usability

## Future Enhancements

### Planned Features
- **User Authentication**: Multi-user support with roles
- **Advanced Reporting**: Charts and analytics dashboard
- **Notification System**: Email/SMS notifications
- **Offline Mode**: Mobile app offline functionality
- **Integration**: Accounting software integration

### Technical Improvements
- **Performance**: Optimization and caching
- **Security**: Enhanced security measures
- **Scalability**: Handle increased user load
- **Monitoring**: Application performance monitoring
- **Backup**: Automated backup systems

## Challenges and Solutions

### Technical Challenges
1. **Google Sheets Integration**
   - Challenge: Limited API capabilities
   - Solution: Google Apps Script as proxy

2. **Mobile App Conversion**
   - Challenge: Native mobile features
   - Solution: WebIntoApp platform

3. **Location Services**
   - Challenge: GPS accuracy and permissions
   - Solution: HTML5 Geolocation API with fallback

### Project Management Challenges
1. **Timeline Management**
   - Challenge: Completing within academic timeline
   - Solution: Agile development with regular milestones

2. **Resource Constraints**
   - Challenge: Free tools and services
   - Solution: Careful selection of free alternatives

3. **Testing and Validation**
   - Challenge: Comprehensive testing
   - Solution: User testing and feedback collection

## Conclusion

This project demonstrates the successful development of a comprehensive site visitor management system using modern web technologies. The application provides a complete solution for managing site visits, from customer information collection to service delivery tracking.

The project showcases the ability to:
- Design and develop a full-stack web application
- Integrate with third-party services (Google Sheets)
- Convert web applications to mobile apps
- Implement complex business logic and calculations
- Create user-friendly interfaces with modern UI/UX

This high school diploma project serves as a testament to the power of modern web technologies and their ability to solve real-world problems effectively and efficiently.

---

**Project Duration**: [Your project duration]
**Technologies Used**: Next.js, TypeScript, Google Sheets, Vercel, WebIntoApp
**Status**: Completed and Deployed
**Grade**: [Your grade]

*This project was completed as part of the high school diploma requirements and demonstrates proficiency in modern web development, database management, and mobile application deployment.*