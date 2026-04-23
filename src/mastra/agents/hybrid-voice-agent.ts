import { Agent } from '@mastra/core/agent';
import { CompositeVoice } from '@mastra/core/voice';
import { ElevenLabsVoice } from '@mastra/voice-elevenlabs';
import { OpenAIVoice } from '@mastra/voice-openai';

const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

export const hybridVoiceAgent = new Agent({
  id: 'hybrid-voice-agent',
  name: 'Hybrid Voice Agent',
  instructions: `You are a conversational voice assistant. The user speaks to you and you reply in speech.

Your pipeline: OpenAI Whisper transcribes the user, you reason with text, and ElevenLabs speaks your reply.

Guidelines:
- Replies will be spoken aloud, so keep them short, natural, and free of markdown.
- If the transcription is ambiguous, ask a brief clarifying question before acting.
- Acknowledge what you heard in your own words when the user gives instructions.`,
  model: 'openai/gpt-5.1-codex',
  voice: new CompositeVoice({
    input: new OpenAIVoice({
      listeningModel: { name: 'whisper-1' },
    }),
    output: new ElevenLabsVoice({
      speechModel: {
        name: 'eleven_multilingual_v2',
        apiKey: elevenLabsApiKey,
      },
      speaker: 'JBFqnCBsd6RMkjVDRZzb',
    }),
  }),
});
