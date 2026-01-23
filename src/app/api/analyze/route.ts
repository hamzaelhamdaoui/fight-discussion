import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ImageExtractionResultSchema } from "@/types";
import { z } from "zod";

const RequestSchema = z.object({
  imageBase64: z.string(),
  imageId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, imageId } = RequestSchema.parse(body);

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Extract the base64 data (remove data URL prefix if present)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `Analyze this chat/messaging screenshot and extract all messages.

For each message, identify:
1. The speaker (A = typically left side/outgoing, B = typically right side/incoming)
2. The exact text content
3. Any visible timestamp
4. Your confidence level (0-1) in the extraction accuracy

Return a JSON object in this exact format:
{
  "messages": [
    {
      "speaker": "A" or "B",
      "text": "message content",
      "timestamp": "HH:MM" or null if not visible,
      "confidence": 0.95,
      "position_in_image": 1
    }
  ],
  "language": "detected language code (en, es, etc.)",
  "platform": "detected platform (whatsapp, imessage, telegram, etc.) or unknown"
}

Important:
- Messages should be ordered from top to bottom as they appear in the image
- position_in_image is the order (1, 2, 3...) from top of screen
- Be accurate with the text - don't paraphrase
- Speaker A is usually on the left or in a different color than B
- If you can't determine the speaker, use your best judgment based on visual cues

Only return valid JSON, no markdown formatting.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/png",
          data: base64Data,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let extractedData;
    try {
      // Clean up the response (remove potential markdown code blocks)
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      extractedData = JSON.parse(cleanedText);
    } catch {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Validate and return
    const validatedResult = ImageExtractionResultSchema.parse({
      imageId,
      messages: extractedData.messages,
      language: extractedData.language,
      platform: extractedData.platform,
    });

    return NextResponse.json(validatedResult);
  } catch (error) {
    console.error("Analyze error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
