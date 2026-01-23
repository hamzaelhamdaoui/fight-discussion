import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  BattleResultSchema,
  AnalysisResultSchema,
  ReconstructedTimelineSchema,
} from "@/types";
import { z } from "zod";
import { generateId } from "@/lib/utils";

const RequestSchema = z.object({
  timeline: ReconstructedTimelineSchema,
  participantNames: z.object({
    A: z.string(),
    B: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timeline, participantNames } = RequestSchema.parse(body);

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

    const prompt = `Analyze this conversation as a debate/argument and generate battle data.

Participants:
- Person A: ${participantNames.A}
- Person B: ${participantNames.B}

Conversation:
${timeline.messages.map((m) => `[${m.speaker}]: ${m.text}`).join("\n")}

Generate battle analysis in this exact JSON format:
{
  "battleResult": {
    "winner": "A" or "B" or null (for draw),
    "finalHpA": number (0-100, starting HP is 100),
    "finalHpB": number (0-100, starting HP is 100),
    "attacks": [
      {
        "id": "unique_id",
        "messageId": "corresponding message id",
        "attacker": "A" or "B",
        "target": "A" or "B" (opposite of attacker),
        "damage": number (1-50, based on impact),
        "attackType": "logical_argument" | "emotional_appeal" | "sarcasm" | "deflection" | "insult" | "manipulation" | "support" | "resolution_attempt" | "escalation" | "passive_aggressive",
        "text": "the message text",
        "rationale": "why this causes damage",
        "isCritical": boolean (true for particularly impactful messages)
      }
    ],
    "stats": {
      "totalAttacksA": number,
      "totalAttacksB": number,
      "totalDamageDealtA": number,
      "totalDamageDealtB": number,
      "criticalHitsA": number,
      "criticalHitsB": number,
      "mostUsedTypeA": "attack type",
      "mostUsedTypeB": "attack type"
    }
  },
  "analysisResult": {
    "winner": "A" or "B" or null,
    "winnerReason": "explanation of why this person won (2-3 sentences)",
    "criteria": [
      {
        "name": "Clarity of Communication",
        "scoreA": 1-10,
        "scoreB": 1-10,
        "explanation": "brief explanation"
      },
      {
        "name": "Emotional Control",
        "scoreA": 1-10,
        "scoreB": 1-10,
        "explanation": "brief explanation"
      },
      {
        "name": "Use of Evidence",
        "scoreA": 1-10,
        "scoreB": 1-10,
        "explanation": "brief explanation"
      },
      {
        "name": "Resolution Focus",
        "scoreA": 1-10,
        "scoreB": 1-10,
        "explanation": "brief explanation"
      },
      {
        "name": "Respectful Tone",
        "scoreA": 1-10,
        "scoreB": 1-10,
        "explanation": "brief explanation"
      }
    ],
    "recommendations": [
      "Recommendation for Person A...",
      "Recommendation for Person B...",
      "General recommendation for both..."
    ],
    "keyMoments": [
      {
        "messageId": "id",
        "description": "what happened",
        "impact": "positive" | "negative" | "neutral"
      }
    ]
  }
}

Damage guidelines:
- 1-5: Minor jab, slight provocation
- 6-10: Solid point, mild escalation
- 11-20: Strong argument, emotional impact
- 21-30: Major blow, significant escalation
- 31-50: Critical hit, devastating point or serious offense

The winner is determined by who has more HP at the end, but also consider:
- Clarity of communication
- Use of evidence vs assumptions
- Emotional control
- Attempts to resolve vs escalate
- Respectful vs disrespectful tone

Penalize: insults, manipulation, gaslighting, personal attacks
Reward: evidence-based arguments, active listening, resolution attempts

Be fair and objective. This is for entertainment - be honest but not harsh.
Only return valid JSON, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let battleData;
    try {
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      battleData = JSON.parse(cleanedText);
    } catch {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Ensure attacks have IDs
    const attacksWithIds = battleData.battleResult.attacks.map(
      (atk: Record<string, unknown>, idx: number) => ({
        ...atk,
        id: atk.id || generateId() + idx,
      })
    );

    // Validate battle result
    const validatedBattleResult = BattleResultSchema.parse({
      ...battleData.battleResult,
      attacks: attacksWithIds,
    });

    // Validate analysis result
    const validatedAnalysisResult = AnalysisResultSchema.parse(
      battleData.analysisResult
    );

    return NextResponse.json({
      battleResult: validatedBattleResult,
      analysisResult: validatedAnalysisResult,
    });
  } catch (error) {
    console.error("Battle error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate battle" },
      { status: 500 }
    );
  }
}
