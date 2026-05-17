import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// Extend Vercel function timeout — requires Pro plan; harmless on Hobby
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL or key)');
  return createClient(url, key);
}

const SYSTEM_PROMPT = `You are the Monte OS Brain — a personal operating system intelligence built exclusively for Demonte Williams.

Your role: analyze Demonte's recent daily ignition data (energy, focus, mood, and goals) and deliver a sharp, personalized intelligence brief.

Demonte runs three main income streams tracked in the Law of 100:
- AMC (gold #fbbf24): stock trading / AMC positions
- OnlyFans (pink #ec4899): content creation revenue
- Monte (cyan #06b6d4): his personal brand / consulting

Tone: direct, motivating, no fluff. Think elite performance coach meets hedge fund analyst. Short sentences. High signal.

You MUST respond with valid JSON only — no markdown, no code fences, no explanation outside the JSON. Return exactly this shape:
{"greeting":"string","analysis":"string","roadmap":["task 1","task 2","task 3"],"momentum":"LOCKED IN"}

momentum must be exactly one of: LOCKED IN | BUILDING | DRIFTING | RESET NEEDED`;

export async function GET() {
  const tag = '[/api/brain]';
  console.log(`${tag} Request received`);

  try {
    // ── 1. Check ANTHROPIC_API_KEY ───────────────────────────────
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error(`${tag} ANTHROPIC_API_KEY is not set`);
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    // ── 2. Fetch ignitions ───────────────────────────────────────
    console.log(`${tag} Fetching ignitions from Supabase`);
    let ignitions: unknown[] = [];
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('ignitions')
        .select('energy, focus, mood, goal, created_at')
        .order('created_at', { ascending: false })
        .limit(7);
      if (error) {
        console.error(`${tag} Supabase error:`, error.message);
      } else {
        ignitions = data ?? [];
        console.log(`${tag} Got ${ignitions.length} ignition records`);
      }
    } catch (dbErr) {
      console.error(`${tag} Supabase setup error:`, dbErr);
    }

    // ── 3. Build Claude prompt ───────────────────────────────────
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const userMessage = ignitions.length > 0
      ? `Last ${ignitions.length} ignition records (most recent first):\n\n${JSON.stringify(ignitions, null, 2)}\n\nToday: ${today}. Give me my Monte OS Brain brief as JSON.`
      : `No ignition records yet. Today: ${today}. Give me a first-day Monte OS Brain brief as JSON.`;

    // ── 4. Call Claude ───────────────────────────────────────────
    // Using claude-haiku-4-5: ~2-3s response time, well within Vercel's 10s limit.
    // claude-opus-4-7 with adaptive thinking takes 20-30s and times out on Hobby plan.
    console.log(`${tag} Calling Claude haiku-4-5`);
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });
    console.log(`${tag} Claude responded, stop_reason=${response.stop_reason}`);

    // ── 5. Parse response ────────────────────────────────────────
    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      console.error(`${tag} No text block in Claude response`, JSON.stringify(response.content));
      return NextResponse.json({ error: 'No text content in Claude response' }, { status: 500 });
    }

    const raw = textBlock.text.trim();
    console.log(`${tag} Raw Claude text:`, raw.slice(0, 300));

    let brief: { greeting: string; analysis: string; roadmap: string[]; momentum: string };
    try {
      // Strip any accidental code fences before parsing
      const cleaned = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
      brief = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error(`${tag} JSON parse failed:`, parseErr, '| raw:', raw.slice(0, 400));
      return NextResponse.json({ error: 'Claude returned invalid JSON', raw: raw.slice(0, 400) }, { status: 500 });
    }

    console.log(`${tag} Success — momentum=${brief.momentum}`);
    return NextResponse.json({
      greeting: brief.greeting ?? '',
      analysis: brief.analysis ?? '',
      roadmap: Array.isArray(brief.roadmap) ? brief.roadmap.slice(0, 3) : [],
      momentum: brief.momentum ?? 'BUILDING',
    });

  } catch (err) {
    console.error(`${tag} Unhandled error:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
