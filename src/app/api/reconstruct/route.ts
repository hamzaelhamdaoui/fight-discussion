import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  ReconstructedTimelineSchema,
  ImageExtractionResultSchema,
} from "@/types";
import { z } from "zod";
import { generateId } from "@/lib/utils";

const RequestSchema = z.object({
  extractions: z.array(ImageExtractionResultSchema),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { extractions } = RequestSchema.parse(body);

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Combine all messages from all extractions
    const allMessages = extractions.flatMap((ext) =>
      ext.messages.map((msg, idx) => ({
        ...msg,
        sourceImageId: ext.imageId,
        originalIndex: idx,
      }))
    );

    const prompt = `You are given messages extracted from multiple chat screenshots. Your task is to reconstruct the correct chronological order of the conversation.

Here are the extracted messages:
${JSON.stringify(allMessages, null, 2)}

Reconstruct the timeline and return a JSON object in this exact format:
{
  "messages": [
    {
      "id": "unique_id",
      "speaker": "A" or "B",
      "text": "message content",
      "timestamp": "ISO timestamp string or null",
      "confidence": 0.95,
      "sourceImageId": "original image id"
    }
  ],
  "overallConfidence": 0.85,
  "explanationShort": "Brief explanation of how you ordered the messages",
  "gaps": [
    {
      "afterMessageId": "id of message before gap",
      "reason": "Why you think messages are missing",
      "estimatedMissingCount": 1
    }
  ],
  "language": "primary language code"
}

Guidelines:
1. If timestamps exist, use them as primary ordering
2. If no timestamps, use conversational context to determine order
3. Look for question-answer pairs, topic continuity, and emotional escalation
4. Identify any likely gaps where messages seem to be missing
5. Assign unique IDs to each message
6. Overall confidence should reflect how certain you are about the order

Only return valid JSON, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let reconstructedData;
    try {
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      reconstructedData = JSON.parse(cleanedText);
    } catch {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Ensure all messages have IDs
    const messagesWithIds = reconstructedData.messages.map(
      (msg: Record<string, unknown>, idx: number) => ({
        ...msg,
        id: msg.id || generateId() + idx,
      })
    );

    // Validate and return
    const validatedResult = ReconstructedTimelineSchema.parse({
      messages: messagesWithIds,
      overallConfidence: reconstructedData.overallConfidence || 0.8,
      explanationShort:
        reconstructedData.explanationShort || "Timeline reconstructed based on context",
      gaps: reconstructedData.gaps || [],
      language: reconstructedData.language || "en",
    });

    return NextResponse.json(validatedResult);
  } catch (error) {
    console.error("Reconstruct error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to reconstruct timeline" },
      { status: 500 }
    );
  }
}
