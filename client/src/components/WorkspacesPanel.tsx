import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import {
  AgentSummary,
  WorkspaceEntry,
  createWorkspaceDirectory,
  listWorkspace,
  readWorkspaceFile,
  writeWorkspaceFile,
} from '../lib/mastraClient';
import { PrimitiveBadge } from './PrimitiveBadge';
import { PrimitiveId } from '../lib/education';

interface Props {
  agent: AgentSummary | null;
  onTeach: (id: PrimitiveId) => void;
}

type TreeNode = {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
  loaded?: boolean;
  expanded?: boolean;
  size?: number;
};

type OpenTab = {
  path: string;
  name: string;
  content: string;
  dirty: boolean;
  saving: boolean;
};

const ROOT_PATH = 'workspace';

/**
 * Workspaces tab — full-screen, VS-Code-like file browser + Monaco editor for
 * the agent's `./workspace` directory. Reads & writes go through the same
 * MCP filesystem tools the agent uses (`fs_list_directory_with_sizes`,
 * `fs_read_text_file`, `fs_write_file`, `fs_create_directory`), so what
 * you see — and edit — is exactly what the agent sees.
 */
export function WorkspacesPanel({ agent, onTeach }: Props) {
  const [tree, setTree] = useState<TreeNode>(() => makeRootNode());
  const [tabs, setTabs] = useState<OpenTab[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const agentId = agent?.id ?? null;

  const loadDir = useCallback(
    async (path: string): Promise<WorkspaceEntry[]> => {
      if (!agentId) return [];
      return listWorkspace(agentId, path);
    },
    [agentId],
  );

  // Initial tree load.
  useEffect(() => {
    if (!agentId) return;
    let alive = true;
    loadDir(ROOT_PATH).then((entries) => {
      if (!alive) return;
      setTree({
        ...makeRootNode(),
        loaded: true,
        children: entries.map(toNode),
      });
    });
    return () => {
      alive = false;
    };
  }, [agentId, loadDir]);

  const refreshTree = useCallback(async () => {
    if (!agentId) return;
    const entries = await loadDir(ROOT_PATH);
    setTree({
      ...makeRootNode(),
      loaded: true,
      children: entries.map(toNode),
    });
  }, [agentId, loadDir]);

  async function toggleDir(path: string) {
    const updated = await expandPath(tree, path, loadDir);
    setTree({ ...updated });
  }

  async function openFile(path: string) {
    if (!agentId) return;
    const existing = tabs.find((t) => t.path === path);
    if (existing) {
      setActivePath(path);
      return;
    }
    const file = await readWorkspaceFile(agentId, path);
    const content = file?.content ?? '';
    setTabs((prev) => [
      ...prev,
      {
        path,
        name: basename(path),
        content,
        dirty: false,
        saving: false,
      },
    ]);
    setActivePath(path);
  }

  function closeTab(path: string) {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.path === path);
      if (idx < 0) return prev;
      const t = prev[idx];
      if (t.dirty && !confirm(`Discard unsaved changes to ${t.name}?`)) return prev;
      const next = prev.filter((x) => x.path !== path);
      // Move active tab if needed.
      if (path === activePath) {
        const fallback = next[idx] ?? next[idx - 1] ?? null;
        setActivePath(fallback?.path ?? null);
      }
      return next;
    });
  }

  function onChange(value: string | undefined) {
    if (!activePath) return;
    setTabs((prev) =>
      prev.map((t) =>
        t.path === activePath
          ? {
              ...t,
              content: value ?? '',
              dirty: (value ?? '') !== t.content || t.dirty,
            }
          : t,
      ),
    );
  }

  // Mark dirty correctly: only dirty when value differs from last saved state.
  // We track last-saved by storing the content snapshot at save time.
  const savedSnapshotsRef = useRef<Map<string, string>>(new Map());

  // Initialise saved snapshots when tabs open.
  useEffect(() => {
    for (const t of tabs) {
      if (!savedSnapshotsRef.current.has(t.path)) {
        savedSnapshotsRef.current.set(t.path, t.content);
      }
    }
  }, [tabs]);

  // Re-derive dirty: compare content to last-saved.
  const tabsView = useMemo(
    () =>
      tabs.map((t) => ({
        ...t,
        dirty: (savedSnapshotsRef.current.get(t.path) ?? t.content) !== t.content,
      })),
    [tabs],
  );

  async function saveActive() {
    if (!agentId) return;
    const tab = tabs.find((t) => t.path === activePath);
    if (!tab) return;
    setTabs((prev) =>
      prev.map((t) => (t.path === tab.path ? { ...t, saving: true } : t)),
    );
    const ok = await writeWorkspaceFile(agentId, tab.path, tab.content);
    if (ok) {
      savedSnapshotsRef.current.set(tab.path, tab.content);
      setBannerMsg(`saved ${tab.path}`);
      setTimeout(() => setBannerMsg(null), 2000);
    } else {
      setBannerMsg(`failed to save ${tab.path}`);
      setTimeout(() => setBannerMsg(null), 3000);
    }
    setTabs((prev) =>
      prev.map((t) => (t.path === tab.path ? { ...t, saving: false } : t)),
    );
  }

  // Cmd/Ctrl+S binding.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        void saveActive();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activePath, tabs]);

  async function newFilePrompt(parentPath: string) {
    const name = prompt(`New file in ${parentPath}/:`);
    if (!name) return;
    if (!agentId) return;
    const path = `${parentPath}/${name}`;
    const ok = await writeWorkspaceFile(agentId, path, '');
    if (!ok) {
      setBannerMsg(`failed to create ${path}`);
      setTimeout(() => setBannerMsg(null), 3000);
      return;
    }
    await refreshTree();
    await openFile(path);
  }

  async function newDirPrompt(parentPath: string) {
    const name = prompt(`New directory in ${parentPath}/:`);
    if (!name) return;
    if (!agentId) return;
    const ok = await createWorkspaceDirectory(agentId, `${parentPath}/${name}`);
    if (!ok) {
      setBannerMsg(`failed to create dir`);
      setTimeout(() => setBannerMsg(null), 3000);
      return;
    }
    await refreshTree();
  }

  const activeTab = tabsView.find((t) => t.path === activePath) ?? null;
  const language = activeTab ? languageFor(activeTab.path) : 'plaintext';

  if (!agent) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        Pick an agent to browse its workspace.
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-950">
      {/* LEFT — file tree */}
      <div className="w-64 border-r border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-800 flex items-center gap-2">
          <PrimitiveBadge primitive="workspace" onTeach={onTeach} compact />
          <div className="text-xs font-semibold text-slate-100">Workspace</div>
          <button
            onClick={refreshTree}
            className="ml-auto text-[10px] text-slate-500 hover:text-slate-200 underline decoration-dotted"
            title="Re-list ./workspace from the agent's filesystem"
          >
            refresh
          </button>
        </div>

        <div className="px-3 py-1 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => newFilePrompt(tree.path)}
            className="text-[10px] text-slate-300 hover:text-slate-100 border border-slate-700 hover:border-slate-500 rounded px-2 py-0.5"
            title="Create a new file at the workspace root"
          >
            + file
          </button>
          <button
            onClick={() => newDirPrompt(tree.path)}
            className="text-[10px] text-slate-300 hover:text-slate-100 border border-slate-700 hover:border-slate-500 rounded px-2 py-0.5"
            title="Create a new directory at the workspace root"
          >
            + folder
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 text-[11px]">
          <TreeRow
            node={tree}
            depth={0}
            onToggle={toggleDir}
            onOpen={openFile}
            selected={activePath}
          />
        </div>

        <div className="p-2 border-t border-slate-800 text-[10px] text-slate-500 leading-snug">
          Reads / writes go through{' '}
          <span className="font-mono text-slate-300">fs_*</span> MCP tools —
          same access the agent has.
        </div>
      </div>

      {/* RIGHT — tabs + editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab bar */}
        <div className="border-b border-slate-800 flex items-center overflow-x-auto bg-slate-900/40">
          {tabsView.length === 0 && (
            <div className="px-3 py-2 text-[11px] text-slate-500">
              Open a file from the tree to start editing.
            </div>
          )}
          {tabsView.map((t) => (
            <div
              key={t.path}
              onClick={() => setActivePath(t.path)}
              className={`group flex items-center gap-2 px-3 py-1.5 border-r border-slate-800 cursor-pointer text-[11px] ${
                t.path === activePath
                  ? 'bg-slate-950 text-slate-100'
                  : 'bg-slate-900/40 text-slate-400 hover:text-slate-200'
              }`}
              title={t.path}
            >
              <span className="font-mono truncate max-w-[160px]">{t.name}</span>
              {t.dirty && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-400"
                  title="unsaved changes"
                />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(t.path);
                }}
                className="opacity-50 hover:opacity-100 hover:text-rose-300 ml-1"
                title="Close tab"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 px-3">
            {bannerMsg && (
              <div className="text-[10px] text-emerald-300">{bannerMsg}</div>
            )}
            <button
              disabled={!activeTab || !activeTab.dirty || activeTab.saving}
              onClick={() => void saveActive()}
              className="text-[10px] px-2 py-0.5 rounded border border-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
              title="Save (⌘S / Ctrl+S)"
            >
              {activeTab?.saving ? 'saving…' : 'save'}
            </button>
          </div>
        </div>

        {/* Path bar */}
        {activeTab && (
          <div className="px-3 py-1 border-b border-slate-800 text-[10px] font-mono text-slate-500 truncate">
            {activeTab.path}
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 min-h-0">
          {activeTab ? (
            <Editor
              key={activeTab.path}
              height="100%"
              theme="vs-dark"
              language={language}
              value={activeTab.content}
              onChange={onChange}
              onMount={(ed) => {
                editorRef.current = ed;
              }}
              options={{
                minimap: { enabled: true },
                fontSize: 13,
                wordWrap: 'on',
                tabSize: 2,
                automaticLayout: true,
                scrollBeyondLastLine: false,
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              Pick a file from the tree to open it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRootNode(): TreeNode {
  return {
    name: 'workspace',
    path: ROOT_PATH,
    type: 'directory',
    children: [],
    loaded: false,
    expanded: true,
  };
}

function toNode(e: WorkspaceEntry): TreeNode {
  return {
    name: e.name ?? e.path ?? '?',
    path: e.path ?? e.name ?? '?',
    type: e.type === 'directory' ? 'directory' : 'file',
    size: e.size,
    loaded: e.type !== 'directory',
    expanded: false,
  };
}

async function expandPath(
  root: TreeNode,
  path: string,
  loadDir: (p: string) => Promise<WorkspaceEntry[]>,
): Promise<TreeNode> {
  if (root.path === path) {
    if (!root.loaded) {
      const entries = await loadDir(path);
      root.children = entries.map(toNode);
      root.loaded = true;
    }
    root.expanded = !root.expanded;
    return { ...root };
  }
  if (root.children) {
    for (let i = 0; i < root.children.length; i++) {
      const c = root.children[i];
      if (path === c.path || path.startsWith(c.path + '/')) {
        root.children[i] = await expandPath(c, path, loadDir);
        return { ...root, children: [...root.children] };
      }
    }
  }
  return root;
}

function basename(path: string): string {
  const idx = path.lastIndexOf('/');
  return idx >= 0 ? path.slice(idx + 1) : path;
}

function languageFor(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
  if (lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return 'javascript';
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
  if (lower.endsWith('.css')) return 'css';
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'markdown';
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'shell';
  if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'yaml';
  if (lower.endsWith('.toml')) return 'toml';
  if (lower.endsWith('.xml') || lower.endsWith('.svg')) return 'xml';
  if (lower.endsWith('.sql')) return 'sql';
  return 'plaintext';
}

// ---------------------------------------------------------------------------
// Tree row (recursive)
// ---------------------------------------------------------------------------

function TreeRow({
  node,
  depth,
  onToggle,
  onOpen,
  selected,
}: {
  node: TreeNode;
  depth: number;
  onToggle: (p: string) => void;
  onOpen: (p: string) => void;
  selected: string | null;
}) {
  const isDir = node.type === 'directory';
  const pad = { paddingLeft: `${depth * 10}px` } as const;
  return (
    <div>
      <button
        onClick={() => (isDir ? onToggle(node.path) : onOpen(node.path))}
        className={`w-full flex items-center gap-1 py-0.5 rounded hover:bg-slate-800/40 text-left ${
          selected === node.path ? 'bg-indigo-500/10' : ''
        }`}
        style={pad}
      >
        <span className="w-3 text-slate-500">
          {isDir ? (node.expanded ? '▾' : '▸') : ' '}
        </span>
        <span className={isDir ? 'text-indigo-300' : 'text-slate-300'}>
          {isDir ? '📁' : '📄'}
        </span>
        <span className="truncate font-mono">{node.name}</span>
        {typeof node.size === 'number' && !isDir && (
          <span className="ml-auto text-[9px] text-slate-600">
            {formatSize(node.size)}
          </span>
        )}
      </button>
      {isDir && node.expanded &&
        node.children?.map((c) => (
          <TreeRow
            key={c.path}
            node={c}
            depth={depth + 1}
            onToggle={onToggle}
            onOpen={onOpen}
            selected={selected}
          />
        ))}
    </div>
  );
}

function formatSize(n: number): string {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}K`;
  return `${(n / 1024 / 1024).toFixed(1)}M`;
}
