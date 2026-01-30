import { GoogleGenerativeAI } from "@google/generative-ai";

async function testAPI() {
  const genAI = new GoogleGenerativeAI(
    "AIzaSyB_ZKaKSD8scFxP4NLMRoVjus3QAm2Hxrw",
  );

  console.log("Testing gemini-1.5-flash model...");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent("Say hello in one word");
    console.log("✅ SUCCESS! Response:", result.response.text());
  } catch (error: any) {
    console.log("❌ FAILED:", error.message);
  }
}

testAPI();
