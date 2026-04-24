import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return a mock response if no API key is configured
      return NextResponse.json({
        extracted: {
          ticker: 'UNKNOWN',
          entryPrice: 0,
          exitPrice: null,
          rationale: text.slice(0, 200),
          confidence: 'low',
          notes: 'AI extraction requires a valid GEMINI_API_KEY in .env.local',
        },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a trade journal assistant. Extract structured trade data from the following rough trading notes.

Return a JSON object with these fields:
- ticker: string (the stock/asset symbol, uppercase)
- entryPrice: number (the entry/buy price)
- exitPrice: number | null (the exit/sell price if mentioned)
- rationale: string (the trading rationale/reasoning)
- confidence: "high" | "medium" | "low" (how confident you are in the extraction)
- notes: string (any additional observations)

Respond with ONLY valid JSON, no markdown fences or extra text.

Trading notes:
${text}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    // Try to parse JSON from the response
    let extracted;
    try {
      const cleaned = responseText.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
      extracted = JSON.parse(cleaned);
    } catch {
      extracted = {
        ticker: 'UNKNOWN',
        entryPrice: 0,
        exitPrice: null,
        rationale: responseText,
        confidence: 'low',
        notes: 'Could not parse AI response',
      };
    }

    return NextResponse.json({ extracted });
  } catch (error: any) {
    console.error('AI extraction error:', error);
    return NextResponse.json(
      { error: 'AI extraction failed', details: error.message },
      { status: 500 }
    );
  }
}
