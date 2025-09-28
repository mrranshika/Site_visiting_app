#!/bin/bash

# 🎓 FREE High School Project Setup Script
# Wedabime Pramukayo - Site Visitor Management System

echo "🎓 Wedabime Pramukayo - High School Diploma Project Setup"
echo "=========================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please download and install Node.js from https://nodejs.org/"
    echo "Choose the LTS version for stability."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    echo "Please install npm along with Node.js."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create environment file
echo "📝 Creating environment configuration..."
if [ ! -f .env.local ]; then
    cat > .env.local << EOF
# Google Sheets Configuration (will be updated later)
GOOGLE_SHEETS_WEB_APP_URL=

# Database Configuration
DATABASE_URL=file:./dev.db
EOF
    echo "✅ Environment file created at .env.local"
else
    echo "ℹ️  Environment file already exists"
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Project built successfully"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. 📊 Google Sheets Setup:"
echo "   • Create a new Google Sheet at https://sheets.google.com"
echo "   • Name it: 'Wedabime Pramukayo Data'"
echo "   • Go to Extensions → Apps Script"
echo "   • Copy the code from 'google-apps-script.js'"
echo "   • Deploy as Web App (Execute as: Me, Access: Anyone)"
echo "   • Copy the Web App URL"
echo ""
echo "2. 🌐 Web App Deployment:"
echo "   • Create GitHub account: https://github.com"
echo "   • Push your code to GitHub"
echo "   • Deploy to Vercel: https://vercel.com"
echo "   • Set environment variable: GOOGLE_SHEETS_WEB_APP_URL"
echo ""
echo "3. 📱 Mobile App Conversion:"
echo "   • Go to https://webintoapp.com"
echo "   • Enter your web app URL"
echo "   • Generate mobile app (FREE)"
echo "   • Download and install on your phone"
echo ""
echo "4. 📚 Documentation:"
echo "   • Read FREE_SETUP_GUIDE.md for detailed instructions"
echo "   • Read PROJECT_DOCUMENTATION.md for project information"
echo "   • Follow the setup guide step by step"
echo ""
echo "🚀 Quick Start Commands:"
echo "  • Development: npm run dev"
echo "  • Build:       npm run build"
echo "  • Start:       npm start"
echo "  • Lint:        npm run lint"
echo ""
echo "📞 Need Help?"
echo "  • Google Apps Script: https://developers.google.com/apps-script"
echo "  • Vercel Documentation: https://vercel.com/docs"
echo "  • Next.js Documentation: https://nextjs.org/docs"
echo "  • GitHub Support: https://github.com/features"
echo ""
echo "🎓 Good luck with your high school diploma project!"
echo "   This setup is completely free and will work forever!"
echo ""

# Ask if user wants to start development server
read -p "Would you like to start the development server now? (y/n): " start_server

if [ "$start_server" = "y" ] || [ "$start_server" = "Y" ]; then
    echo "🚀 Starting development server..."
    echo "📱 Open http://localhost:3000 in your browser"
    echo "⏹️  Press Ctrl+C to stop the server"
    echo ""
    npm run dev
else
    echo "👋 Setup complete! Run 'npm run dev' to start development server."
fi