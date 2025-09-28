#!/bin/bash

# Wedabime Pramukayo Deployment Script
# This script helps deploy the app and set up Google Sheets integration

echo "🚀 Wedabime Pramukayo Deployment Script"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cat > .env.local << EOF
# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./credentials.json

# Database Configuration
DATABASE_URL=file:./dev.db
EOF
    echo "✅ Environment file created at .env.local"
    echo "⚠️  Please edit .env.local and add your Google Sheets configuration"
else
    echo "✅ Environment file already exists"
fi

# Check if credentials.json exists
if [ ! -f credentials.json ]; then
    echo "⚠️  credentials.json not found"
    echo "Please download your Google Cloud service account credentials and save as credentials.json"
    echo "You can get this from Google Cloud Console → IAM & Admin → Service Accounts"
else
    echo "✅ credentials.json found"
fi

# Ask about deployment method
echo ""
echo "🌐 Choose deployment method:"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) Local development"
echo "4) Exit"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        echo "Please make sure you have:"
        echo "- Vercel account (https://vercel.com)"
        echo "- Project connected to Git repository"
        echo "- Environment variables set in Vercel dashboard"
        echo ""
        echo "Steps to deploy to Vercel:"
        echo "1. Push your code to Git repository"
        echo "2. Go to Vercel dashboard"
        echo "3. Import your repository"
        echo "4. Set environment variables in Vercel settings"
        echo "5. Deploy"
        ;;
    2)
        echo "🚀 Deploying to Netlify..."
        echo "Please make sure you have:"
        echo "- Netlify account (https://netlify.com)"
        echo "- Project connected to Git repository"
        echo ""
        echo "Steps to deploy to Netlify:"
        echo "1. Push your code to Git repository"
        echo "2. Go to Netlify dashboard"
        echo "3. Connect your repository"
        echo "4. Set build command: npm run build"
        echo "5. Set publish directory: .next"
        echo "6. Set environment variables"
        echo "7. Deploy"
        ;;
    3)
        echo "🚀 Starting local development..."
        npm run dev
        ;;
    4)
        echo "👋 Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up Google Cloud Console and create service account"
echo "2. Create Google Sheet and share with service account"
echo "3. Update environment variables with your configuration"
echo "4. Test the application"
echo "5. Deploy to your chosen platform"
echo ""
echo "For detailed instructions, see GOOGLE_SHEETS_SETUP.md"