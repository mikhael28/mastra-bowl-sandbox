import { registerApiRoute } from '@mastra/core/server';

async function getAgentMemory(
  mastra: any,
  agentId: string,
): Promise<any | null> {
  let agent;
  try {
    agent = mastra.getAgentById(agentId);
  } catch {
    return null;
  }
  if (!agent) return null;
  try {
    return typeof (agent as any).getMemory === 'function'
      ? await (agent as any).getMemory()
      : (agent as any).memory ?? null;
  } catch {
    return null;
  }
}

/**
 * Custom route: GET /api/working-memory/:agentId?resourceId=...
 *
 * The Mastra server exposes thread storage at /api/memory/threads but does not
 * (as of this version) have a dedicated endpoint for resource-scoped working
 * memory. MastraClaw's memory config sets `workingMemory.scope: 'resource'` with
 * a markdown template — this route returns the resolved block so the UI can
 * render it in the "Working memory" panel alongside the rest of the education.
 *
 * Returns:
 *   { resourceId, template, workingMemory, updatedAt }
 * or `{ error, template }` if the agent has no working memory enabled.
 */
export const workingMemoryRoute = registerApiRoute('/working-memory/:agentId', {
  method: 'GET',
  handler: async (c) => {
    const agentId = c.req.param('agentId');
    const resourceId = c.req.query('resourceId') ?? undefined;
    const threadId = c.req.query('threadId') ?? undefined;
    const mastra = c.get('mastra');

    let agent;
    try {
      agent = mastra.getAgentById(agentId);
    } catch {
      return c.json({ error: `Unknown agent: ${agentId}` }, 404);
    }
    if (!agent) return c.json({ error: `Unknown agent: ${agentId}` }, 404);

    // Try both code paths the Memory API exposes across versions. Older builds
    // return the memory primitive via `agent.memory`; newer ones via getMemory().
    let memory: any = null;
    try {
      memory = typeof (agent as any).getMemory === 'function'
        ? await (agent as any).getMemory()
        : (agent as any).memory;
    } catch (err) {
      console.warn('[working-memory-route] getMemory failed', err);
    }
    if (!memory) {
      return c.json({
        error: 'Agent has no memory configured',
        template: null,
        workingMemory: null,
      });
    }

    // Expose the static template and any config the UI can teach against.
    const config = (memory.config ?? memory.options ?? {}) as any;
    const template: string | null =
      config?.workingMemory?.template ?? null;
    const scope: string | null = config?.workingMemory?.scope ?? null;
    const enabled: boolean = !!config?.workingMemory?.enabled;

    let workingMemory: string | null = null;
    let updatedAt: string | null = null;

    // getWorkingMemory is the canonical reader. Signature has changed across
    // versions so we try a couple of call shapes defensively.
    try {
      const wm =
        typeof memory.getWorkingMemory === 'function'
          ? await memory.getWorkingMemory({
              resourceId,
              threadId,
              agentId,
            })
          : null;
      if (wm && typeof wm === 'object') {
        workingMemory =
          typeof wm.content === 'string' ? wm.content : wm.text ?? null;
        updatedAt = wm.updatedAt ?? wm.updated_at ?? null;
      } else if (typeof wm === 'string') {
        workingMemory = wm;
      }
    } catch (err) {
      console.warn('[working-memory-route] getWorkingMemory failed', err);
    }

    return c.json({
      agentId,
      resourceId,
      threadId,
      template,
      scope,
      enabled,
      workingMemory,
      updatedAt,
    });
  },
});

/**
 * POST /api/working-memory/:agentId
 *
 * Body: { resourceId?, threadId?, workingMemory: string }
 *
 * Replaces the agent's working-memory block. The Memory class signature is
 * `updateWorkingMemory({ threadId, resourceId, workingMemory, memoryConfig })`,
 * but resource-scoped working memory only requires `resourceId`. We pass both
 * when present.
 */
export const updateWorkingMemoryRoute = registerApiRoute(
  '/working-memory/:agentId',
  {
    method: 'POST',
    handler: async (c) => {
      const agentId = c.req.param('agentId');
      let body: any = {};
      try {
        body = await c.req.json();
      } catch {
        return c.json({ error: 'Body must be JSON' }, 400);
      }
      const workingMemory = body?.workingMemory;
      if (typeof workingMemory !== 'string') {
        return c.json(
          { error: 'workingMemory (string) is required' },
          400,
        );
      }

      const mastra = c.get('mastra');
      const memory = await getAgentMemory(mastra, agentId);
      if (!memory) {
        return c.json({ error: `Unknown agent: ${agentId}` }, 404);
      }
      if (typeof memory.updateWorkingMemory !== 'function') {
        return c.json(
          { error: 'Memory does not support updateWorkingMemory' },
          400,
        );
      }
      try {
        await memory.updateWorkingMemory({
          resourceId: body.resourceId,
          threadId: body.threadId,
          workingMemory,
        });
        return c.json({ ok: true });
      } catch (err: any) {
        return c.json(
          { error: String(err?.message ?? err) },
          500,
        );
      }
    },
  },
);
