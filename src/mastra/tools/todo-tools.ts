import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const TODO_PATH = resolve(process.cwd(), 'workspace', 'todo.json');

const todoSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
});

type Todo = z.infer<typeof todoSchema>;

async function readTodos(): Promise<Todo[]> {
  try {
    const raw = await readFile(TODO_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err: any) {
    if (err?.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeTodos(todos: Todo[]): Promise<void> {
  await mkdir(dirname(TODO_PATH), { recursive: true });
  await writeFile(TODO_PATH, JSON.stringify(todos, null, 2), 'utf8');
}

export const todoAdd = createTool({
  id: 'todo-add',
  description:
    'Add a new todo item to the workspace todo.json list. Returns the created todo.',
  inputSchema: z.object({
    text: z.string().describe('The todo item text/description'),
  }),
  outputSchema: z.object({
    todo: todoSchema,
    total: z.number(),
  }),
  execute: async ({ text }) => {
    const todos = await readTodos();
    const todo: Todo = {
      id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    todos.push(todo);
    await writeTodos(todos);
    return { todo, total: todos.length };
  },
});

export const todoList = createTool({
  id: 'todo-list',
  description:
    'List todos from the workspace todo.json. Optionally filter by status (all, pending, completed).',
  inputSchema: z.object({
    filter: z
      .enum(['all', 'pending', 'completed'])
      .optional()
      .default('all')
      .describe('Which todos to return'),
  }),
  outputSchema: z.object({
    todos: z.array(todoSchema),
    counts: z.object({
      total: z.number(),
      pending: z.number(),
      completed: z.number(),
    }),
  }),
  execute: async ({ filter = 'all' }) => {
    const todos = await readTodos();
    const filtered =
      filter === 'pending'
        ? todos.filter((t) => !t.completed)
        : filter === 'completed'
          ? todos.filter((t) => t.completed)
          : todos;
    return {
      todos: filtered,
      counts: {
        total: todos.length,
        pending: todos.filter((t) => !t.completed).length,
        completed: todos.filter((t) => t.completed).length,
      },
    };
  },
});

export const todoComplete = createTool({
  id: 'todo-complete',
  description:
    'Mark a todo as complete by its id. Returns the updated todo, or null if not found.',
  inputSchema: z.object({
    id: z.string().describe('The id of the todo to mark complete'),
  }),
  outputSchema: z.object({
    todo: todoSchema.nullable(),
  }),
  execute: async ({ id }) => {
    const todos = await readTodos();
    const match = todos.find((t) => t.id === id);
    if (!match) return { todo: null };
    match.completed = true;
    match.completedAt = new Date().toISOString();
    await writeTodos(todos);
    return { todo: match };
  },
});
