export function GET() {
  return new Response(JSON.stringify({
    gemini: process.env.GEMINI_API_KEY?.substring(0, 4) || 'MISSING',
    groq: process.env.GROQ_API_KEY?.substring(0, 4) || 'MISSING',
    nodeEnv: process.env.NODE_ENV,
    url: process.env.NEXTAUTH_URL || 'MISSING'
  }));
}
