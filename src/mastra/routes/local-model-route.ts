import { registerApiRoute } from '@mastra/core/server';
import { modelSelectionInfo } from '../agents/mastraclaw-agent';

/**
 * GET /local-model-status
 *
 * Reports the model selected at startup along with what LM Studio detection
 * found. The selection itself is fixed for the process — to switch, the user
 * sets `MASTRA_PREFERRED_MODEL=<id>` (or removes it to re-auto-pick) and
 * restarts the dev server. The client surfaces this info in a model picker
 * so the user can see what's running and how to change it.
 */
export const localModelStatusRoute = registerApiRoute(
  '/local-model-status',
  {
    method: 'GET',
    handler: async (c) => {
      return c.json(modelSelectionInfo);
    },
  },
);
