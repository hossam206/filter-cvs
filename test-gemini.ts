// Quick test script to check which Gemini models work
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyDz-4RuflqH6z8yoJqRxAsgWiwMNJCucO4";
const genAI = new GoogleGenerativeAI(API_KEY);

const modelsToTry = [
  "gemini-1.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.0-pro",
];

async function testModels() {
  console.log("Testing Gemini API models...\n");

  for (const modelName of modelsToTry) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello");
      const response = await result.response;
      const text = response.text();
      console.log(
        `✅ ${modelName} works! Response: ${text.substring(0, 50)}...\n`,
      );
      break; // If one works, we found it!
    } catch (error: any) {
      console.log(`❌ ${modelName} failed: ${error.message}\n`);
    }
  }
}

testModels();
