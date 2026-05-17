import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const buildSystem = (habitsSummary: string) => `You are the Monte OS Brain — Demonte Williams' personal AI operating system and elite advisor.

Active Law of 100 habit tracking:
${habitsSummary || 'No habit data available'}

Demonte's three income streams:
- AMC (gold): stock trading / AMC positions
- OnlyFans (pink): content creation revenue
- Monte (cyan): personal brand / consulting

You are his performance coach, strategist, and accountability partner. Answer anything he asks — revenue moves, mindset, scheduling, market analysis, content strategy, habit breakdowns, life decisions. Be direct. Sharp. High signal. No filler. Respond in plain text (no markdown headers). Keep it concise unless he explicitly asks for detail.`;

export async function POST(req: Request) {
  try {
    const { messages, habitsSummary } = await req.json() as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      habitsSummary: string;
    };

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response('ANTHROPIC_API_KEY not set', { status: 500 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = anthropic.messages.stream({
            model: 'claude-haiku-4-5',
            max_tokens: 768,
            system: buildSystem(habitsSummary),
            messages,
          });

          for await (const chunk of anthropicStream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } catch (err) {
          controller.enqueue(encoder.encode('\n[Error — try again]'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Bad request', { status: 400 });
  }
}
