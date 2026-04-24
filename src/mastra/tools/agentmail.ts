import { createTool } from '@mastra/core/tools';
import { AgentMailClient } from 'agentmail';
import { z } from 'zod';

const getClient = () => {
  const apiKey = process.env.AGENT_MAIL_API_KEY;
  if (!apiKey) {
    throw new Error('AGENT_MAIL_API_KEY environment variable is not set');
  }
  return new AgentMailClient({ apiKey });
};

export const createInbox = createTool({
  id: 'agentmail-create-inbox',
  description:
    'Creates a new email inbox for the agent. Returns the inbox ID and email address. Use clientId for idempotent creation.',
  inputSchema: z.object({
    username: z.string().optional().describe('Username part of the email address (randomly generated if omitted)'),
    domain: z.string().optional().describe('Domain for the inbox (defaults to agentmail.to)'),
    displayName: z.string().optional().describe('Display name, e.g. "MastraClaw Agent"'),
    clientId: z.string().optional().describe('Client ID for idempotent inbox creation'),
  }),
  outputSchema: z.object({
    inboxId: z.string(),
    email: z.string(),
    displayName: z.string().optional(),
  }),
  execute: async ({ username, domain, displayName, clientId }) => {
    const client = getClient();
    const inbox = await client.inboxes.create({
      username,
      domain,
      displayName,
      clientId,
    });
    return {
      inboxId: inbox.inboxId,
      email: inbox.email,
      displayName: inbox.displayName,
    };
  },
});

export const listInboxes = createTool({
  id: 'agentmail-list-inboxes',
  description: 'Lists all email inboxes in the organization.',
  inputSchema: z.object({
    limit: z.number().optional().describe('Max number of inboxes to return'),
  }),
  outputSchema: z.object({
    inboxes: z.array(
      z.object({
        inboxId: z.string(),
        email: z.string(),
        displayName: z.string().optional(),
      }),
    ),
  }),
  execute: async ({ limit }) => {
    const client = getClient();
    const res = await client.inboxes.list({ limit });
    return {
      inboxes: (res.inboxes ?? []).map((i) => ({
        inboxId: i.inboxId,
        email: i.email,
        displayName: i.displayName,
      })),
    };
  },
});

export const sendEmail = createTool({
  id: 'agentmail-send-email',
  description:
    'Sends an email from an agent inbox. Supports plain text and HTML bodies, CC, BCC, and attachments.',
  requireApproval: true,
  inputSchema: z.object({
    inboxId: z.string().describe('The inbox ID to send from'),
    to: z
      .union([z.string(), z.array(z.string())])
      .describe('Recipient email address(es)'),
    subject: z.string().optional().describe('Email subject line'),
    text: z.string().optional().describe('Plain text email body'),
    html: z.string().optional().describe('HTML email body'),
    cc: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe('CC recipient(s)'),
    bcc: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe('BCC recipient(s)'),
    replyTo: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe('Reply-to address(es)'),
    labels: z.array(z.string()).optional().describe('Labels to apply to the message'),
  }),
  outputSchema: z.object({
    messageId: z.string(),
    threadId: z.string(),
  }),
  execute: async ({ inboxId, to, subject, text, html, cc, bcc, replyTo, labels }) => {
    const client = getClient();
    const res = await client.inboxes.messages.send(inboxId, {
      to,
      subject,
      text,
      html,
      cc,
      bcc,
      replyTo,
      labels,
    });
    return {
      messageId: res.messageId,
      threadId: res.threadId,
    };
  },
});

export const listMessages = createTool({
  id: 'agentmail-list-messages',
  description:
    'Lists messages in an inbox. Returns message previews ordered by timestamp descending.',
  inputSchema: z.object({
    inboxId: z.string().describe('The inbox ID to list messages from'),
    limit: z.number().optional().describe('Max number of messages to return'),
    labels: z.array(z.string()).optional().describe('Filter by labels'),
  }),
  outputSchema: z.object({
    count: z.number(),
    messages: z.array(
      z.object({
        messageId: z.string(),
        threadId: z.string(),
        from: z.string(),
        to: z.array(z.string()),
        subject: z.string().optional(),
        preview: z.string().optional(),
        labels: z.array(z.string()),
        timestamp: z.string(),
      }),
    ),
  }),
  execute: async ({ inboxId, limit, labels }) => {
    const client = getClient();
    const res = await client.inboxes.messages.list(inboxId, { limit, labels });
    return {
      count: res.count,
      messages: (res.messages ?? []).map((m) => ({
        messageId: m.messageId,
        threadId: m.threadId,
        from: m.from,
        to: m.to,
        subject: m.subject,
        preview: m.preview,
        labels: m.labels,
        timestamp: m.timestamp.toISOString(),
      })),
    };
  },
});

export const getMessage = createTool({
  id: 'agentmail-get-message',
  description:
    'Gets the full content of a specific email message, including extracted text (without quoted history).',
  inputSchema: z.object({
    inboxId: z.string().describe('The inbox ID'),
    messageId: z.string().describe('The message ID to retrieve'),
  }),
  outputSchema: z.object({
    messageId: z.string(),
    threadId: z.string(),
    from: z.string(),
    to: z.array(z.string()),
    cc: z.array(z.string()).optional(),
    subject: z.string().optional(),
    text: z.string().optional(),
    html: z.string().optional(),
    extractedText: z.string().optional(),
    extractedHtml: z.string().optional(),
    labels: z.array(z.string()),
    timestamp: z.string(),
    attachments: z
      .array(
        z.object({
          attachmentId: z.string(),
          filename: z.string().optional(),
          contentType: z.string().optional(),
          size: z.number(),
        }),
      )
      .optional(),
  }),
  execute: async ({ inboxId, messageId }) => {
    const client = getClient();
    const m = await client.inboxes.messages.get(inboxId, messageId);
    return {
      messageId: m.messageId,
      threadId: m.threadId,
      from: m.from,
      to: m.to,
      cc: m.cc,
      subject: m.subject,
      text: m.text,
      html: m.html,
      extractedText: m.extractedText,
      extractedHtml: m.extractedHtml,
      labels: m.labels,
      timestamp: m.timestamp.toISOString(),
      attachments: m.attachments?.map((a) => ({
        attachmentId: a.attachmentId,
        filename: a.filename,
        contentType: a.contentType,
        size: a.size,
      })),
    };
  },
});

export const replyToEmail = createTool({
  id: 'agentmail-reply',
  description:
    'Replies to an existing email message. Maintains the thread context automatically.',
  requireApproval: true,
  inputSchema: z.object({
    inboxId: z.string().describe('The inbox ID'),
    messageId: z.string().describe('The message ID to reply to'),
    text: z.string().optional().describe('Plain text reply body'),
    html: z.string().optional().describe('HTML reply body'),
    replyAll: z.boolean().optional().describe('Reply to all recipients (default: false)'),
  }),
  outputSchema: z.object({
    messageId: z.string(),
    threadId: z.string(),
  }),
  execute: async ({ inboxId, messageId, text, html, replyAll }) => {
    const client = getClient();
    const res = await client.inboxes.messages.reply(inboxId, messageId, {
      text,
      html,
      replyAll,
    });
    return {
      messageId: res.messageId,
      threadId: res.threadId,
    };
  },
});

export const listThreads = createTool({
  id: 'agentmail-list-threads',
  description:
    'Lists email threads (conversations) in an inbox or across the entire organization.',
  inputSchema: z.object({
    inboxId: z.string().optional().describe('Inbox ID to list threads from. Omit to list org-wide.'),
    limit: z.number().optional().describe('Max number of threads to return'),
    labels: z.array(z.string()).optional().describe('Filter by labels'),
  }),
  outputSchema: z.object({
    threads: z.array(
      z.object({
        threadId: z.string(),
        subject: z.string().optional(),
        messageCount: z.number().optional(),
        latestMessage: z
          .object({
            from: z.string(),
            preview: z.string().optional(),
            timestamp: z.string(),
          })
          .optional(),
      }),
    ),
  }),
  execute: async ({ inboxId, limit, labels }) => {
    const client = getClient();
    const res = inboxId
      ? await client.inboxes.threads.list(inboxId, { limit, labels })
      : await client.threads.list({ limit, labels });
    return {
      threads: (res.threads ?? []).map((t: any) => ({
        threadId: t.threadId,
        subject: t.subject,
        messageCount: t.messageCount,
        latestMessage: t.latestMessage
          ? {
              from: t.latestMessage.from,
              preview: t.latestMessage.preview,
              timestamp: t.latestMessage.timestamp?.toISOString?.() ?? String(t.latestMessage.timestamp),
            }
          : undefined,
      })),
    };
  },
});
