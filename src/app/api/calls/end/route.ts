import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth';
import { endCall, saveCallScore, getPersonaById } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getGenAI() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const genAI = getGenAI();
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { callId, personaId, transcript, durationSeconds, audioBlob } =
      await request.json();

    if (!callId) {
      return NextResponse.json(
        { error: 'Call ID is required' },
        { status: 400 }
      );
    }

    let recordingUrl: string | null = null;

    // Upload audio recording if provided
    if (audioBlob) {
      try {
        const buffer = Buffer.from(audioBlob, 'base64');
        const filename = `${callId}.webm`;

        const { error: uploadError } = await supabase.storage
          .from('recordings')
          .upload(filename, buffer, {
            contentType: 'audio/webm',
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('recordings')
            .getPublicUrl(filename);
          recordingUrl = urlData.publicUrl;
        }
      } catch (err) {
        console.error('Recording upload error:', err);
      }
    }

    // End the call
    const call = await endCall(callId, recordingUrl, transcript, durationSeconds);

    if (!call) {
      return NextResponse.json(
        { error: 'Failed to end call' },
        { status: 500 }
      );
    }

    // Score the call using Gemini
    let score = null;

    if (transcript && transcript.length > 0) {
      try {
        const persona = await getPersonaById(personaId);
        const conversationText = transcript
          .map(
            (t: { role: string; content: string }) =>
              `${t.role === 'user' ? 'Sales Rep' : persona?.name || 'Prospect'}: ${t.content}`
          )
          .join('\n');

        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        const prompt = `You are an expert sales coach evaluating a practice sales call. The sales representative was calling a simulated prospect (${persona?.name || 'a prospect'}) to pitch business lending products.

Evaluate the call based on these criteria:
1. Tone (0-100): Professional, confident, empathetic communication
2. Product Knowledge (0-100): Accurate information about lending products
3. Objection Handling (0-100): Effectively addressed concerns and objections
4. Rapport Building (0-100): Connected with prospect, active listening
5. Closing Technique (0-100): Asked for business, established next steps

Here is the call transcript:

${conversationText}

Respond in this exact JSON format:
{
  "tone_score": number,
  "product_knowledge_score": number,
  "objection_handling_score": number,
  "rapport_building_score": number,
  "closing_technique_score": number,
  "overall_score": number,
  "ai_feedback": "2-3 sentence summary of performance",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"]
}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const scoreData = JSON.parse(text);

        // Calculate weighted overall score if not provided
        if (!scoreData.overall_score) {
          scoreData.overall_score = Math.round(
            scoreData.tone_score * 0.2 +
              scoreData.product_knowledge_score * 0.2 +
              scoreData.objection_handling_score * 0.25 +
              scoreData.rapport_building_score * 0.15 +
              scoreData.closing_technique_score * 0.2
          );
        }

        score = await saveCallScore({
          call_id: callId,
          overall_score: scoreData.overall_score,
          tone_score: scoreData.tone_score,
          product_knowledge_score: scoreData.product_knowledge_score,
          objection_handling_score: scoreData.objection_handling_score,
          rapport_building_score: scoreData.rapport_building_score,
          closing_technique_score: scoreData.closing_technique_score,
          ai_feedback: scoreData.ai_feedback,
          strengths: scoreData.strengths || [],
          improvements: scoreData.improvements || [],
        });
      } catch (err) {
        console.error('Scoring error:', err);
      }
    }

    return NextResponse.json({
      call,
      score,
      recording_url: recordingUrl,
    });
  } catch (error) {
    console.error('End call error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
