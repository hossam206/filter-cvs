import { GoogleGenerativeAI } from "@google/generative-ai";

async function testAPI() {
  const genAI = new GoogleGenerativeAI("AIzaSyABGvLHVmtmGaGLisTcZMDSz8BoHZc7eiY");
  
  console.log("Testing NEW API key with gemini-1.5-flash...");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  try {
    const result = await model.generateContent("Say hello in one word");
    console.log("✅ SUCCESS! API key works!");
    console.log("Response:", result.response.text());
  } catch (error: any) {
    console.log("❌ FAILED:", error.message);
  }
}

testAPI();
