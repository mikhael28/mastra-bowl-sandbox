import { Agent } from '@mastra/core/agent';
import { ElevenLabsVoice } from '@mastra/voice-elevenlabs';

const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

export const voiceAgent = new Agent({
  id: 'voice-agent',
  name: 'ElevenLabs Voice Agent',
  instructions: `You are a warm, conversational assistant whose responses will be spoken aloud via ElevenLabs text-to-speech.

Guidelines:
- Keep responses concise and natural — they will be heard, not read.
- Prefer short sentences and everyday phrasing over formal prose.
- Avoid markdown, lists, code blocks, or symbols that do not read well aloud.
- Spell out numbers and acronyms only when clarity would suffer otherwise.
- When the user asks a question, answer directly before adding context.`,
  model: 'openai/gpt-5.3-codex',
  voice: new ElevenLabsVoice({
    speechModel: {
      name: 'eleven_multilingual_v2',
      apiKey: elevenLabsApiKey,
    },
    listeningModel: {
      name: 'scribe_v1',
      apiKey: elevenLabsApiKey,
    },
    speaker: 'JBFqnCBsd6RMkjVDRZzb',
  }),
});
