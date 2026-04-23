import { Readable } from 'node:stream';
import { registerApiRoute } from '@mastra/core/server';

export const voiceSpeakRoute = registerApiRoute('/voice-speak/:agentId', {
  method: 'POST',
  handler: async (c) => {
    const agentId = c.req.param('agentId');
    const mastra = c.get('mastra');

    let body: { text?: string; speakerId?: string } = {};
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Request body must be JSON' }, 400);
    }

    const text = body.text?.trim();
    if (!text) return c.json({ error: 'text is required' }, 400);

    // Client sends the agent's declared `id` (e.g. `voice-agent`), not the
    // registry key (`voiceAgent`). `getAgent` looks up by registry key only;
    // `getAgentById` resolves the declared id.
    let agent;
    try {
      agent = mastra.getAgentById(agentId);
    } catch {
      return c.json({ error: `Unknown agent: ${agentId}` }, 404);
    }
    if (!agent) return c.json({ error: `Unknown agent: ${agentId}` }, 404);

    const voice = await agent.getVoice();
    if (!voice) return c.json({ error: 'Agent has no voice configured' }, 400);

    let audioStream;
    try {
      audioStream = await voice.speak(text, { speaker: body.speakerId });
    } catch (err: any) {
      console.error('[voice-speak] voice.speak failed:', err);
      return c.json(
        { error: `Speech generation failed: ${err?.message ?? String(err)}` },
        502,
      );
    }
    if (!audioStream) return c.json({ error: 'Failed to generate speech' }, 500);

    const webStream: ReadableStream<Uint8Array> =
      audioStream instanceof ReadableStream
        ? audioStream
        : (Readable.toWeb(audioStream as Readable) as unknown as ReadableStream<Uint8Array>);

    return new Response(webStream, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  },
});
