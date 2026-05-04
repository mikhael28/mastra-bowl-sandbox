import type { Dispatch, SetStateAction } from 'react';
import type { Chunk, TokenUsage } from './mastraClient';
import type { ToolCallState } from '../components/tool-cards/types';
import { type PrimitiveId, educationForChunk } from './education';
import { describeError, logError } from './errorLog';

export type StreamContext = {
  agentId?: string;
  threadId?: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  reasoning?: string;
  toolCalls: ToolCallState[];
  tripwire?: {
    reason: string;
    processorId?: string;
    rewritten?: string;
  };
  finished?: boolean;
  usage?: TokenUsage;
  runId?: string;
};

/**
 * Folds a streaming `Chunk` from the Mastra agent stream into the
 * matching assistant `Message` in the messages array. Used by both the
 * Chat tab and the Artifact tab so the parsing stays in lock-step.
 */
export function applyChunkToMessage(
  chunk: Chunk,
  assistantId: string,
  setMessages: Dispatch<SetStateAction<Message[]>>,
  onTeach: (id: PrimitiveId) => void,
  ctx?: StreamContext,
) {
  const type = chunk.type;
  const eduId = educationForChunk(type);
  if (eduId && (type === 'tool-call' || type === 'tripwire')) {
    void onTeach;
  }

  if (type === 'tool-error') {
    const e = describeError(chunk.payload?.error);
    logError({
      source: 'tool',
      message: e.message,
      detail: e.detail,
      agentId: ctx?.agentId,
      threadId: ctx?.threadId,
      runId: chunk.runId,
      toolName: chunk.payload?.toolName,
    });
  } else if (type === 'tool-result' && chunk.payload?.isError) {
    const e = describeError(chunk.payload?.result);
    logError({
      source: 'tool',
      message: `tool returned error: ${e.message}`,
      detail: e.detail,
      agentId: ctx?.agentId,
      threadId: ctx?.threadId,
      runId: chunk.runId,
      toolName: chunk.payload?.toolName,
    });
  } else if (type === 'error') {
    const e = describeError(chunk.payload?.error);
    logError({
      source: 'stream',
      message: e.message,
      detail: e.detail,
      agentId: ctx?.agentId,
      threadId: ctx?.threadId,
      runId: chunk.runId,
    });
  } else if (type === 'tripwire') {
    logError({
      source: 'mastra',
      message: `tripwire: ${chunk.payload?.reason ?? 'blocked'}`,
      detail: chunk.payload?.processorId
        ? `processor: ${chunk.payload.processorId}`
        : undefined,
      agentId: ctx?.agentId,
      threadId: ctx?.threadId,
      runId: chunk.runId,
    });
  }

  setMessages((msgs) =>
    msgs.map((msg) => {
      if (msg.id !== assistantId) return msg;

      switch (type) {
        case 'text-delta': {
          const delta = chunk.payload?.text ?? '';
          return { ...msg, text: msg.text + delta };
        }
        case 'reasoning-delta': {
          const delta = chunk.payload?.text ?? '';
          return { ...msg, reasoning: (msg.reasoning ?? '') + delta };
        }
        case 'tool-call': {
          const existing = msg.toolCalls.find(
            (t) => t.toolCallId === chunk.payload?.toolCallId,
          );
          if (existing) return msg;
          return {
            ...msg,
            toolCalls: [
              ...msg.toolCalls,
              {
                toolCallId: chunk.payload?.toolCallId ?? crypto.randomUUID(),
                toolName: chunk.payload?.toolName ?? 'unknown',
                args: chunk.payload?.args,
                status: 'calling',
              },
            ],
          };
        }
        case 'tool-call-approval':
        case 'data-tool-call-approval': {
          const toolCallId = chunk.payload?.toolCallId ?? chunk.data?.toolCallId;
          const toolName =
            chunk.payload?.toolName ?? chunk.data?.toolName ?? 'unknown';
          const args = chunk.payload?.args ?? chunk.data?.args;
          const existing = msg.toolCalls.find(
            (t) => t.toolCallId === toolCallId,
          );
          if (existing) {
            return {
              ...msg,
              toolCalls: msg.toolCalls.map((t) =>
                t.toolCallId === toolCallId
                  ? { ...t, status: 'awaiting-approval', args: t.args ?? args }
                  : t,
              ),
            };
          }
          return {
            ...msg,
            toolCalls: [
              ...msg.toolCalls,
              {
                toolCallId: toolCallId ?? crypto.randomUUID(),
                toolName,
                args,
                status: 'awaiting-approval',
              },
            ],
          };
        }
        case 'tool-result': {
          return {
            ...msg,
            toolCalls: msg.toolCalls.map((t) =>
              t.toolCallId === chunk.payload?.toolCallId
                ? {
                    ...t,
                    result: chunk.payload?.result,
                    isError: chunk.payload?.isError,
                    status: chunk.payload?.isError ? 'error' : 'done',
                  }
                : t,
            ),
          };
        }
        case 'tool-error': {
          return {
            ...msg,
            toolCalls: msg.toolCalls.map((t) =>
              t.toolCallId === chunk.payload?.toolCallId
                ? { ...t, result: chunk.payload?.error, status: 'error' }
                : t,
            ),
          };
        }
        case 'tripwire': {
          return {
            ...msg,
            tripwire: {
              reason: chunk.payload?.reason ?? 'blocked',
              processorId: chunk.payload?.processorId,
              rewritten:
                chunk.payload?.rewritten ??
                chunk.payload?.replacement ??
                undefined,
            },
          };
        }
        case 'finish': {
          // Newer Mastra streams emit the full TokenUsage shape at
          // `chunk.payload.output.usage`. Older variants use just
          // `chunk.payload.usage`. Accept both.
          const usage: TokenUsage | undefined =
            chunk.payload?.output?.usage ?? chunk.payload?.usage;
          return { ...msg, finished: true, usage };
        }
        case 'error': {
          const err = chunk.payload?.error;
          return {
            ...msg,
            text:
              msg.text +
              `\n\n*error: ${typeof err === 'string' ? err : JSON.stringify(err)}*`,
            finished: true,
          };
        }
        default:
          return msg;
      }
    }),
  );
}
