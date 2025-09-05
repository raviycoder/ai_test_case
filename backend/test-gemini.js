// Test script to verify Google GenAI integration
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const testGeminiIntegration = async () => {
  try {
    
    const geminiAI = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY || ""
    });

    if (!process.env.GOOGLE_API_KEY) {
      console.error('❌ GOOGLE_API_KEY environment variable not set');
      return;
    }


    // Test the new API syntax
    const response = await geminiAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello! Please respond with a simple JSON object containing a 'message' field.",
    });
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(response.text || '{}');
    } catch (parseError) {
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
    }
  }
};

// Run the test
testGeminiIntegration();
