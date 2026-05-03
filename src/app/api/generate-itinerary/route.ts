import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// The shared prompt template that both AI providers will use
function buildPrompt(destination: string, duration: string, budget: string, interests: string) {
  return `
    You are an expert travel planner. Create a detailed ${duration}-day itinerary for a trip to ${destination}.
    The budget level is: ${budget}.
    The traveler's interests are: ${interests}.

    You MUST respond with valid, parseable JSON and nothing else. No markdown formatting, no backticks, no introduction.
    
    The JSON must follow this exact structure:
    {
      "title": "A catchy title for the trip",
      "destination": "${destination}",
      "estimatedTotalCost": "e.g. $1200",
      "days": [
        {
          "dayNumber": 1,
          "theme": "Theme for the day",
          "activities": [
            {
              "time": "Morning/Afternoon/Evening",
              "name": "Name of place or activity",
              "description": "Brief description",
              "estimatedCost": "e.g. $20"
            }
          ]
        }
      ]
    }
  `;
}

// Clean up AI response text (sometimes they wrap JSON in markdown backticks)
function cleanJsonResponse(text: string): string {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

// --- Provider: Google Gemini ---
async function generateWithGemini(prompt: string) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("Gemini API key not configured. Add NEXT_PUBLIC_GEMINI_API_KEY to .env.local");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return cleanJsonResponse(response.text());
}

// --- Provider: Groq (Llama 3) ---
async function generateWithGroq(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    throw new Error("Groq API key not configured. Add GROQ_API_KEY to .env.local");
  }

  const groq = new Groq({ apiKey });
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are an expert travel planner. You always respond in valid JSON only, with no extra text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const text = chatCompletion.choices[0]?.message?.content || "";
  return cleanJsonResponse(text);
}

// --- Main API Route ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destination, duration, budget, interests, provider = "gemini" } = body;

    if (!destination || !duration || !budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(destination, duration, budget, interests);

    let rawJson: string;

    switch (provider) {
      case "groq":
        rawJson = await generateWithGroq(prompt);
        break;
      case "gemini":
      default:
        rawJson = await generateWithGemini(prompt);
        break;
    }

    // Parse the JSON to ensure it's valid before sending to the frontend
    const itineraryData = JSON.parse(rawJson);

    return NextResponse.json(itineraryData);
  } catch (error: any) {
    console.error("Error generating itinerary:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate itinerary." },
      { status: 500 }
    );
  }
}
