import { createTool } from '@mastra/core/tools';
import { Agent } from '@mastra/core/agent';
import { z } from 'zod';

const qualificationSchema = z.object({
  fitScore: z
    .number()
    .min(0)
    .max(10)
    .describe('Overall fit with our ICP, 0 (poor) to 10 (ideal)'),
  stage: z
    .enum(['cold', 'aware', 'interested', 'evaluating', 'ready-to-buy'])
    .describe('Where the lead is in the buying journey'),
  budgetSignal: z
    .enum(['unknown', 'none', 'small', 'mid', 'enterprise'])
    .describe('Inferred budget signal from the message'),
  timeline: z
    .enum(['unknown', 'immediate', 'this-quarter', 'this-year', 'long-term'])
    .describe('How soon they want to act'),
  painPoints: z
    .array(z.string())
    .describe('Specific problems or frustrations the lead mentions'),
  buyingSignals: z
    .array(z.string())
    .describe('Concrete phrases or facts that indicate intent to buy'),
  redFlags: z
    .array(z.string())
    .describe('Reasons this lead may NOT be a good fit'),
  nextStep: z
    .string()
    .describe('Single concrete next step the sales/BD team should take'),
  suggestedReply: z
    .string()
    .describe('Short, personalized reply draft that moves the conversation forward'),
});

const qualifierAgent = new Agent({
  id: 'mastraclaw-lead-qualifier',
  name: 'Lead Qualifier',
  model: 'openai/gpt-5.3-codex',
  instructions: `You are a pragmatic B2B sales qualifier. Read an inbound message from a prospect and return a structured qualification record.

- Never invent facts: if a field is unclear from the message, mark it as unknown / empty array / "not stated".
- fitScore: be honest. Generic tire-kickers < 4, warm qualified prospects 5–7, clear ICP fit with urgency 8–10.
- suggestedReply: 2–4 sentences, conversational, moves the conversation to a concrete next step. No marketing fluff.`,
});

export const qualifyLead = createTool({
  id: 'qualify-lead',
  description:
    'Analyzes an inbound prospect message (email, DM, form submission) and returns a structured lead-qualification record: fit score, buying stage, budget/timeline signals, pain points, red flags, a recommended next step, and a drafted reply. Use for any new inbound interest.',
  inputSchema: z.object({
    message: z
      .string()
      .describe('The raw inbound message from the prospect'),
    icpNotes: z
      .string()
      .optional()
      .describe('Optional notes on our ideal customer profile to bias the scoring'),
  }),
  outputSchema: qualificationSchema,
  execute: async ({ message, icpNotes }) => {
    const prompt = `Inbound message:
"""
${message}
"""

${icpNotes ? `Our ICP notes: ${icpNotes}\n` : ''}Return a qualification record matching the schema.`;

    const result = await qualifierAgent.generate(prompt, {
      structuredOutput: {
        schema: qualificationSchema,
      },
    });

    return result.object;
  },
});
