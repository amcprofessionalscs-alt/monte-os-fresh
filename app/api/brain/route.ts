import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Server-side Supabase client using the service role key so we can
// query ignitions without hitting RLS restrictions from the API route.
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

const SYSTEM_PROMPT = `You are the Monte OS Brain — a personal operating system intelligence built exclusively for Demonte Williams.

Your role: analyze Demonte's recent daily ignition data (energy, focus, mood, and goals) and deliver a sharp, personalized intelligence brief.

Demonte runs three main income streams tracked in the Law of 100:
- AMC (gold #fbbf24): stock trading / AMC positions
- OnlyFans (pink #ec4899): content creation revenue
- Monte (cyan #06b6d4): his personal brand / consulting

Tone: direct, motivating, no fluff. Think elite performance coach meets hedge fund analyst. Short sentences. High signal.

You MUST respond with valid JSON only — no markdown, no explanation outside the JSON. The JSON must have exactly these keys:
{
  "greeting": "string — punchy 1-line opener personalized to the time/mood/data",
  "analysis": "string — 2-3 sentences analyzing patterns in his recent ignition data",
  "roadmap": ["task 1", "task 2", "task 3"],
  "momentum": "string — one-word momentum score: LOCKED IN | BUILDING | DRIFTING | RESET NEEDED"
}`;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Fetch last 7 ignition records
    const { data: ignitions, error } = await supabase
      .from('ignitions')
      .select('energy, focus, mood, goal, created_at')
      .order('created_at', { ascending: false })
      .limit(7);

    if (error) throw new Error(`Supabase error: ${error.message}`);

    const hasData = ignitions && ignitions.length > 0;

    const userMessage = hasData
      ? `Here are my last ${ignitions.length} daily ignition records (most recent first):\n\n${JSON.stringify(ignitions, null, 2)}\n\nToday is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. Give me my Monte OS Brain brief.`
      : `No ignition records found yet. Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. Give me a first-day Monte OS Brain brief to get started.`;

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    // Extract the text block from the response
    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    // Parse the JSON Claude returned
    let brief: { greeting: string; analysis: string; roadmap: string[]; momentum: string };
    try {
      brief = JSON.parse(textBlock.text);
    } catch {
      throw new Error(`Claude returned invalid JSON: ${textBlock.text.slice(0, 200)}`);
    }

    return NextResponse.json({
      greeting: brief.greeting,
      analysis: brief.analysis,
      roadmap: Array.isArray(brief.roadmap) ? brief.roadmap.slice(0, 3) : [],
      momentum: brief.momentum,
    });
  } catch (err) {
    console.error('[/api/brain] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
