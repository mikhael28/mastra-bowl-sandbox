import { registerApiRoute } from '@mastra/core/server';

/**
 * Custom route: GET /api/working-memory/:agentId?resourceId=...
 *
 * The Mastra server exposes thread storage at /api/memory/threads but does not
 * (as of this version) have a dedicated endpoint for resource-scoped working
 * memory. OpenClaw's memory config sets `workingMemory.scope: 'resource'` with
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
