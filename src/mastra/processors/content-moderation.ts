import type {
  Processor,
  ProcessInputArgs,
  ProcessInputResult,
  ProcessOutputStepArgs,
  ProcessorMessageResult,
} from '@mastra/core/processors';

interface ModerationMetadata {
  flaggedTerms: string[];
  category: 'violence' | 'political' | 'both';
}

const VIOLENCE_PATTERNS = [
  /\b(kill|murder|assault|attack|bomb|shoot|stab|weapon|firearm|terror|massacre|genocide|torture|execute|slaughter)\b/i,
  /\b(how to (make|build|create) .*(bomb|weapon|explosive|poison))\b/i,
  /\b(violent|brutality|gore|bloodshed|carnage)\b/i,
];

const POLITICAL_PATTERNS = [
  /\b(propaganda|political smear|hate speech|extremis[tm]|radicali[sz]ation)\b/i,
  /\b(white supremac|neo-nazi|fascis[tm]|ethnic cleansing)\b/i,
  /\b(incite|insurrection|overthrow|sedition|instigate violence)\b/i,
];

function detectFlaggedContent(text: string): { flaggedTerms: string[]; category: ModerationMetadata['category'] | null } {
  const flaggedTerms: string[] = [];
  let hasViolence = false;
  let hasPolitical = false;

  for (const pattern of VIOLENCE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      flaggedTerms.push(match[0]);
      hasViolence = true;
    }
  }

  for (const pattern of POLITICAL_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      flaggedTerms.push(match[0]);
      hasPolitical = true;
    }
  }

  if (!hasViolence && !hasPolitical) return { flaggedTerms: [], category: null };

  const category: ModerationMetadata['category'] =
    hasViolence && hasPolitical ? 'both' : hasViolence ? 'violence' : 'political';

  return { flaggedTerms, category };
}

function extractTextFromMessages(messages: any[]): string {
  return messages
    .map((m) => {
      if (typeof m.content === 'string') return m.content;
      if (Array.isArray(m.content)) {
        return m.content
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join(' ');
      }
      return '';
    })
    .join(' ');
}

/**
 * Input processor that blocks requests involving violence or politically inappropriate topics.
 * Runs once before messages are sent to the LLM.
 */
export class ContentModerationInputProcessor
  implements Processor<'content-moderation-input', ModerationMetadata>
{
  readonly id = 'content-moderation-input' as const;
  readonly name = 'Content Moderation (Input)';
  readonly description =
    'Blocks input that requests content involving violence or politically inappropriate topics';

  async processInput({
    messages,
    abort,
  }: ProcessInputArgs<ModerationMetadata>): Promise<ProcessInputResult> {
    const text = extractTextFromMessages(messages);
    const { flaggedTerms, category } = detectFlaggedContent(text);

    if (category) {
      abort(
        `Request blocked: content involves ${category === 'both' ? 'violence and politically inappropriate' : category === 'violence' ? 'violent' : 'politically inappropriate'} topics. Flagged terms: ${flaggedTerms.join(', ')}`,
        {
          retry: false,
          metadata: { flaggedTerms, category },
        },
      );
    }

    return messages;
  }
}

/**
 * Output processor that checks generated content for violence or politically inappropriate material.
 * Runs after each LLM step; requests a retry if flagged content is detected.
 */
export class ContentModerationOutputProcessor
  implements Processor<'content-moderation-output', ModerationMetadata>
{
  readonly id = 'content-moderation-output' as const;
  readonly name = 'Content Moderation (Output)';
  readonly description =
    'Checks LLM output for violence or politically inappropriate content and requests a retry if found';

  processOutputStep({
    text,
    abort,
    retryCount,
  }: ProcessOutputStepArgs<ModerationMetadata>): ProcessorMessageResult {
    if (!text) return [];

    const { flaggedTerms, category } = detectFlaggedContent(text);

    if (category) {
      if (retryCount < 2) {
        abort(
          `Your response contained ${category === 'both' ? 'violent and politically inappropriate' : category === 'violence' ? 'violent' : 'politically inappropriate'} content (${flaggedTerms.join(', ')}). Please regenerate without any such content.`,
          {
            retry: true,
            metadata: { flaggedTerms, category },
          },
        );
      } else {
        // After 2 retries, hard block instead of looping
        abort(
          `Content moderation: unable to generate appropriate content after ${retryCount} retries. Flagged: ${flaggedTerms.join(', ')}`,
          {
            retry: false,
            metadata: { flaggedTerms, category },
          },
        );
      }
    }

    return [];
  }
}
