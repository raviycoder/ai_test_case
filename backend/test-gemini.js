// Test script to verify Google GenAI integration
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const testGeminiIntegration = async () => {
  try {
    console.log('Testing Gemini AI integration...');
    
    const geminiAI = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY || ""
    });

    if (!process.env.GOOGLE_API_KEY) {
      console.error('❌ GOOGLE_API_KEY environment variable not set');
      return;
    }

    console.log('✅ API key found');

    // Test the new API syntax
    const response = await geminiAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello! Please respond with a simple JSON object containing a 'message' field.",
    });

    console.log('✅ API call successful');
    console.log('Response text:', response.text);
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(response.text || '{}');
      console.log('✅ JSON parsing successful:', parsed);
    } catch (parseError) {
      console.log('⚠️ Response is not valid JSON, but API call worked');
      console.log('Raw response:', response.text);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
};

// Run the test
testGeminiIntegration();
