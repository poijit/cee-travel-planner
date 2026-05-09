import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const itinerarySchema = z.object({
  title: z.string(),
  destination: z.string(),
  estimatedTotalCost: z.string(),
  days: z.array(z.object({
    dayNumber: z.number(),
    theme: z.string(),
    activities: z.array(z.object({
      time: z.string(),
      name: z.string(),
      description: z.string(),
      estimatedCost: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number()
      }).optional()
    }))
  }))
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destination, duration, budget, interests, provider = "gemini" } = body;

    console.log(`Generating itinerary for ${destination} using ${provider}...`);

    if (!destination || !duration || !budget) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const systemPrompt = `You are an expert travel planner. Create a detailed ${duration}-day itinerary for a trip to ${destination}. The budget level is: ${budget}. The traveler's interests are: ${interests}. You must return the coordinates for every activity to plot on a map.`;

    let model;
    if (provider === "groq") {
      const groq = createOpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY || "",
      });
      model = groq('llama-3.3-70b-versatile');
    } else {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
      });
      model = google('gemini-1.5-flash');
    }

    const result = await streamObject({
      model,
      schema: itinerarySchema,
      prompt: systemPrompt,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to generate itinerary.",
      details: error.stack
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
