import { useCallback, useEffect, useState } from 'react';
import { listWorkspace, readWorkspaceFile, WorkspaceEntry } from '../../lib/mastraClient';
import { PrimitiveBadge } from '../PrimitiveBadge';
import ReactMarkdown from 'react-markdown';
import { PrimitiveId } from '../../lib/education';

/**
 * Workspace Explorer — a right-rail file tree + viewer for the agent's
 * `./workspace` directory. Uses `mastra_workspace_list_files` and
 * `mastra_workspace_read_file` under the hood (see mastraClient.ts), which
 * means the tree here is exactly the same tree the agent sees.
 *
 * Teaching points:
 *   • The workspace is real files, not a metaphor — you can browse them.
 *   • The tree is built from the same tools the agent calls — you're using
 *     the primitive, not a separate API.
 *   • Markdown, HTML and plain text get friendly previews; everything else
 *     falls back to monospace.
 */

interface Props {
  agentId: string;
  onTeach: (p: PrimitiveId) => void;
  openPath?: string | null;
  onClearOpenPath?: () => void;
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

export function WorkspaceExplorer({ agentId, onTeach, openPath, onClearOpenPath }: Props) {
  const [tree, setTree] = useState<TreeNode>({
    name: 'workspace',
    path: '.',
    type: 'directory',
    children: [],
    loaded: false,
    expanded: true,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  const loadDir = useCallback(
    async (path: string): Promise<WorkspaceEntry[]> => {
      return listWorkspace(agentId, path);
    },
    [agentId],
  );

  useEffect(() => {
    if (tree.loaded) return;
    loadDir('.').then((entries) => {
      setTree((t) => ({
        ...t,
        loaded: true,
        children: entries.map(toNode),
      }));
    });
  }, [loadDir, tree.loaded]);

  // When Chat.tsx requests a specific file (e.g. click on a file surfaced in a
  // tool-call), open it.
  useEffect(() => {
    if (!openPath) return;
    void openFile(openPath);
    onClearOpenPath?.();
  }, [openPath]);

  async function openFile(path: string) {
    setSelected(path);
    setFileLoading(true);
    setFileContent(null);
    const file = await readWorkspaceFile(agentId, path);
    setFileContent(file?.content ?? '(unable to read)');
    setFileLoading(false);
  }

  async function toggleDir(path: string) {
    const updated = await expandPath(tree, path, loadDir);
    setTree({ ...updated });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-800 flex items-center gap-2">
        <PrimitiveBadge primitive="workspace" onTeach={onTeach} compact />
        <div className="text-xs font-semibold text-slate-100">Workspace</div>
        <button
          onClick={() =>
            setTree({
              name: 'workspace',
              path: '.',
              type: 'directory',
              children: [],
              loaded: false,
              expanded: true,
            })
          }
          className="ml-auto text-[10px] text-slate-500 hover:text-slate-200 underline decoration-dotted"
          title="Re-list ./workspace from the agent's filesystem"
        >
          refresh
        </button>
      </div>
      <div className="flex-1 overflow-hidden flex min-h-0">
        <div className="w-48 border-r border-slate-800 overflow-y-auto p-2 text-[11px]">
          <TreeRow
            node={tree}
            depth={0}
            onToggle={toggleDir}
            onOpen={openFile}
            selected={selected}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-3 min-w-0">
          {!selected && (
            <div className="text-slate-500 text-xs">
              Select a file to preview. Tree is served by{' '}
              <span className="font-mono">mastra_workspace_list_files</span> —
              the same tool the agent uses.
            </div>
          )}
          {selected && (
            <div>
              <div className="text-[10px] font-mono text-slate-500 mb-2 truncate">
                {selected}
              </div>
              {fileLoading ? (
                <div className="text-xs text-slate-500 italic">reading…</div>
              ) : (
                <FilePreview path={selected} content={fileContent ?? ''} />
              )}
            </div>
          )}
        </div>
      </div>
      <div className="p-2 border-t border-slate-800 text-[10px] text-slate-500 leading-snug">
        Reads go through{' '}
        <span className="font-mono text-slate-300">
          POST /api/agents/{agentId}/tools/mastra_workspace_read_file/execute
        </span>
        . No backend shortcut — the UI uses the primitive.
      </div>
    </div>
  );
}

function toNode(e: WorkspaceEntry): TreeNode {
  return {
    name: e.name ?? e.path ?? '?',
    path: e.path ?? e.name ?? '?',
    type: (e.type === 'directory' ? 'directory' : 'file'),
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

function FilePreview({ path, content }: { path: string; content: string }) {
  const lower = path.toLowerCase();
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
    return (
      <div className="prose-chat text-sm">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }
  if (lower.endsWith('.html') || lower.endsWith('.htm')) {
    return (
      <iframe
        srcDoc={content}
        className="w-full h-[60vh] bg-white rounded"
        title={path}
        sandbox=""
      />
    );
  }
  if (lower.endsWith('.json')) {
    let pretty = content;
    try {
      pretty = JSON.stringify(JSON.parse(content), null, 2);
    } catch {
      /* leave as-is */
    }
    return (
      <pre className="bg-slate-950 rounded p-3 text-[11px] whitespace-pre-wrap break-all font-mono overflow-auto">
        {pretty}
      </pre>
    );
  }
  return (
    <pre className="bg-slate-950 rounded p-3 text-[11px] whitespace-pre-wrap break-all font-mono overflow-auto">
      {content || '(empty)'}
    </pre>
  );
}
