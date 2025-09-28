# FREE Google Sheets Integration Setup for High School Project

## 🎓 **Complete Free Setup Guide**

This guide will help you set up the Wedabime Pramukayo app with Google Sheets as a database, completely free of charge.

## 🚀 **Step 1: Set Up Google Sheets (FREE)**

### Create Google Sheet:
1. Go to [sheets.google.com](https://sheets.google.com)
2. Click "Create new spreadsheet"
3. Name it: "Wedabime Pramukayo Data"
4. Keep it blank for now

### Set Up Google Apps Script:
1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete any existing code
3. Copy the entire code from `google-apps-script.js`
4. Paste it into the Apps Script editor
5. Click **Save project** (give it a name like "Wedabime API")

### Deploy as Web App:
1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ and select **Web app**
3. Configure:
   - **Description**: "Wedabime Pramukayo API"
   - **Execute as**: "Me (your email)"
   - **Who has access**: "Anyone"
4. Click **Deploy**
5. **Authorize access** (click your account, allow permissions)
6. **Copy the Web app URL** (this is your API endpoint)

## 🌐 **Step 2: Deploy Web App (FREE)**

### Option A: Vercel (Recommended - Easiest)
1. **Create GitHub Account**: [github.com](https://github.com) (FREE)
2. **Push your code**:
   ```bash
   git init
   git add .
   git commit -m "Wedabime Pramukayo App"
   git branch -M main
   # Create repository on GitHub first, then:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
3. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub (FREE)
   - Click "New Project"
   - Select your repository
   - Click "Deploy"

### Option B: Netlify (Alternative)
1. **Sign Up**: [netlify.com](https://netlify.com) (FREE)
2. **Connect GitHub** and select your repository
3. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. **Deploy**

## 🔧 **Step 3: Configure Your App**

### Update Environment Variables:
In your hosting platform (Vercel/Netlify), add these environment variables:

```
GOOGLE_SHEETS_WEB_APP_URL=your-web-app-url-from-step-1
```

### Update Google Sheets Service:
Replace your Google Sheets service with the free version:

```typescript
// src/lib/google-sheets-free.ts
import { GoogleSheetsService } from './google-sheets-free';

// In your API route:
const googleSheetsService = GoogleSheetsService.getInstance();
googleSheetsService.setWebAppUrl(process.env.GOOGLE_SHEETS_WEB_APP_URL!);
```

## 📱 **Step 4: Convert to Mobile App (FREE)**

### Using WebIntoApp (FREE Platform):
1. **Go to WebIntoApp**: [webintoapp.com](https://webintoapp.com)
2. **Sign Up** (FREE account)
3. **Convert Your Web App**:
   - Enter your web app URL (from Vercel/Netlify)
   - Choose app name: "Wedabime Pramukayo"
   - Select platform (Android/iOS)
   - Customize icon and splash screen
4. **Generate App** (FREE)
5. **Download APK/IPA** file

### Alternative Free Options:

#### **PWA (Progressive Web App) - Completely Free:**
Add this to your `public/manifest.json`:
```json
{
  "name": "Wedabime Pramukayo",
  "short_name": "Wedabime",
  "description": "Site Visitor Management System",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add this to your `pages/_document.tsx`:
```tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4CAF50" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Wedabime Pramukayo" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

#### **Free App Builders:**
1. **AppGyver**: [appgyver.com](https://appgyver.com) (FREE tier)
2. **Adalo**: [adalo.com](https://adalo.com) (FREE tier)
3. **Bubble**: [bubble.io](https://bubble.io) (FREE tier)

## 📋 **Step 5: Complete Setup Checklist**

### ✅ **Google Sheets Setup:**
- [ ] Create Google Sheet
- [ ] Set up Google Apps Script
- [ ] Deploy as Web App
- [ ] Copy Web App URL
- [ ] Test Web App with sample data

### ✅ **Web App Setup:**
- [ ] Push code to GitHub
- [ ] Deploy to Vercel/Netlify
- [ ] Set environment variables
- [ ] Test web app functionality
- [ ] Verify data appears in Google Sheets

### ✅ **Mobile App Setup:**
- [ ] Convert web app to mobile app
- [ ] Test on mobile device
- [ ] Verify all features work
- [ ] Test location services on mobile

## 🎯 **Testing Your Setup**

### Test Google Sheets Integration:
```bash
# Test your web app URL
curl -X POST YOUR_WEB_APP_URL \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "TEST-001",
    "customerName": "Test User",
    "dateReceived": "2024-01-01",
    "dayOfWeek": "Monday",
    "phoneNumber": "+1234567890",
    "hasWhatsApp": true,
    "district": "Test District",
    "city": "Test City",
    "serviceType": "Ceiling",
    "status": "Pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }'
```

### Test Mobile App:
1. Install the app on your phone
2. Test all form fields
3. Test location detection
4. Test file uploads
5. Verify data appears in Google Sheets

## 🔧 **Troubleshooting**

### Common Issues:

#### **Google Apps Script Errors:**
- **Permission Denied**: Make sure you set "Who has access" to "Anyone"
- **Web App URL Not Working**: Redeploy the web app
- **Data Not Appearing**: Check the Google Sheet for error messages

#### **Web App Issues:**
- **Build Fails**: Check console for errors
- **Environment Variables**: Make sure they're set correctly
- **API Calls Failing**: Check the web app URL is correct

#### **Mobile App Issues:**
- **Location Not Working**: Enable location permissions
- **File Uploads**: Check file size limits
- **Form Submission**: Verify internet connection

## 💡 **Tips for Success**

### **Google Sheets Best Practices:**
- Keep your Google Sheet organized
- Regular backup your data
- Use data validation in Google Sheets
- Set up notifications for new entries

### **Web App Best Practices:**
- Test thoroughly before deploying
- Monitor your app usage
- Keep your code updated
- Use proper error handling

### **Mobile App Best Practices:**
- Test on different devices
- Optimize for mobile screens
- Ensure good performance
- Test offline functionality

## 🎓 **Project Documentation**

Since this is for your high school diploma, make sure to document:

### **Technical Documentation:**
- Architecture overview
- Database schema (Google Sheets structure)
- API endpoints and data flow
- Mobile app conversion process

### **User Documentation:**
- How to use the app
- Features and functionality
- Troubleshooting guide
- Screenshots and examples

### **Project Report:**
- Project objectives
- Technical challenges faced
- Solutions implemented
- Future improvements
- Learning outcomes

## 🚀 **Going Live**

Once everything is tested:

1. **Launch Your Web App**: Share the Vercel/Netlify URL
2. **Distribute Mobile App**: Share the APK/IPA file
3. **Monitor Usage**: Check Google Sheets regularly
4. **Gather Feedback**: Collect user feedback for improvements
5. **Maintain**: Keep the app updated and fix any issues

## 📞 **Free Support Resources**

### **Documentation:**
- Google Apps Script Documentation
- Vercel/Netlify Documentation
- Next.js Documentation
- Google Sheets Documentation

### **Communities:**
- Stack Overflow
- Reddit (r/webdev, r/nextjs)
- Discord communities
- GitHub discussions

### **Tools:**
- Google Colab (for testing)
- CodePen (for code snippets)
- GitHub (for version control)
- Figma (for design mockups)

This complete setup will give you a professional, fully functional web and mobile application for your high school diploma project, all completely free of charge! 🎉