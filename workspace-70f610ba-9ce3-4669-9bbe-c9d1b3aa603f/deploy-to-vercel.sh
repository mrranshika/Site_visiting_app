#!/bin/bash

# 🚀 Vercel Deployment Script for Wedabime Pramukayo

echo "🎓 Wedabime Pramukayo - Vercel Deployment Script"
echo "=================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "⚠️  Git repository not initialized. Initializing..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Check if we have a remote
if ! git remote | grep -q "origin"; then
    echo "⚠️  No git remote found. Please set up your GitHub repository first."
    echo "📋 Steps:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "3. Run: git push -u origin main"
    exit 1
fi

# Push latest changes
echo "📤 Pushing latest changes to GitHub..."
git add .
git commit -m "Update for Vercel deployment" || echo "✅ No changes to commit"
git push origin main

echo "🚀 Deploying to Vercel..."
echo "⚠️  Please select 'Next.js' when prompted for framework"
echo "⚠️  Use these settings:"
echo "   - Build Command: npm run build"
echo "   - Output Directory: .next"
echo "   - Install Command: npm install"
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "📋 Next steps:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Configure Google Sheets integration"
echo "3. Test your deployed application"
echo ""
echo "🎉 Your Wedabime Pramukayo project is now live!"