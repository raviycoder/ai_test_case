#!/bin/bash

# Vercel Deployment Setup Script for Backend

echo "🚀 Setting up Vercel deployment for AI Test Gen Backend..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Environment variables that need to be set in Vercel
echo "📝 Required environment variables for Vercel deployment:"
echo ""
echo "MONGODB_URI=your_mongodb_connection_string"
echo "DB_NAME=ai_test_git"
echo "GITHUB_CLIENT_ID=your_github_client_id"
echo "GITHUB_CLIENT_SECRET=your_github_client_secret"
echo "BETTER_AUTH_SECRET=your_auth_secret"
echo "BETTER_AUTH_URL=your_vercel_backend_url"
echo "FRONTEND_URL=your_frontend_vercel_url"
echo "GOOGLE_GEMINI_API_KEY=your_gemini_api_key"
echo "INNGEST_EVENT_KEY=your_inngest_event_key"
echo "INNGEST_SIGNING_KEY=your_inngest_signing_key"
echo ""
echo "💡 Set these variables using:"
echo "vercel env add VARIABLE_NAME"
echo ""
echo "🔧 To deploy:"
echo "1. Run: vercel"
echo "2. Follow the prompts"
echo "3. Your API will be available at: https://your-project.vercel.app"
echo ""
echo "✅ Setup complete! Your backend is ready for Vercel deployment."
