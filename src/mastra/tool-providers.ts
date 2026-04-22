import type { ToolAction } from '@mastra/core/tools';
import { ComposioToolProvider } from '@mastra/editor/composio';
import { ArcadeToolProvider } from '@mastra/editor/arcade';

export const composioProvider = process.env.COMPOSIO_API_KEY
  ? new ComposioToolProvider({ apiKey: process.env.COMPOSIO_API_KEY })
  : undefined;

export const arcadeProvider = process.env.ARCADE_API_KEY
  ? new ArcadeToolProvider({ apiKey: process.env.ARCADE_API_KEY })
  : undefined;

const DEFAULT_COMPOSIO_SLUGS = [
  'GMAIL_SEND_EMAIL',
  'GMAIL_FETCH_EMAILS',
  'NOTION_CREATE_PAGE',
  'LINEAR_CREATE_ISSUE',
  'SLACK_SEND_MESSAGE',
  'HUBSPOT_CREATE_CONTACT',
];

const DEFAULT_ARCADE_SLUGS = [
  'Slack.SendDmToUser',
  'Github.SearchRepositories',
  'Web.ScrapeUrl',
];

function parseSlugList(envVar: string | undefined, fallback: string[]): string[] {
  if (!envVar) return fallback;
  return envVar.split(',').map((s) => s.trim()).filter(Boolean);
}

export async function resolveIntegrationTools({
  userId,
}: {
  userId?: string;
}): Promise<Record<string, ToolAction<unknown, unknown>>> {
  const effectiveUserId = userId ?? process.env.COMPOSIO_USER_ID;
  const merged: Record<string, ToolAction<unknown, unknown>> = {};

  if (composioProvider && effectiveUserId) {
    const slugs = parseSlugList(process.env.COMPOSIO_TOOL_SLUGS, DEFAULT_COMPOSIO_SLUGS);
    try {
      const composioTools = await composioProvider.resolveTools(slugs, {}, {
        userId: effectiveUserId,
      });
      Object.assign(merged, composioTools);
    } catch (err) {
      console.warn('[tool-providers] Composio tool resolution failed:', err);
    }
  }

  if (arcadeProvider) {
    const slugs = parseSlugList(process.env.ARCADE_TOOL_SLUGS, DEFAULT_ARCADE_SLUGS);
    try {
      const arcadeTools = await arcadeProvider.resolveTools(slugs, {}, {
        userId: effectiveUserId,
      });
      Object.assign(merged, arcadeTools);
    } catch (err) {
      console.warn('[tool-providers] Arcade tool resolution failed:', err);
    }
  }

  return merged;
}
