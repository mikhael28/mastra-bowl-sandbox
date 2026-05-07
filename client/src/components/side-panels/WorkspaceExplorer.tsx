import { useCallback, useEffect, useState } from 'react';
import { listWorkspace, readWorkspaceFile, WorkspaceEntry } from '../../lib/mastraClient';
import { PrimitiveBadge } from '../PrimitiveBadge';
import ReactMarkdown from 'react-markdown';
import { PrimitiveId } from '../../lib/education';
import { createPortal } from 'react-dom';

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
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

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
      <div className="p-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.22)' }}>
        <PrimitiveBadge primitive="workspace" onTeach={onTeach} compact />
        <div className="holo-title text-xs">WORKSPACE</div>
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
          className="ml-auto text-[10px] holo-readout underline decoration-dotted uppercase tracking-widest"
          style={{ color: 'rgba(108, 230, 248, 0.6)' }}
          title="Re-list ./workspace from the agent's filesystem"
        >
          ↻ REFRESH
        </button>
      </div>
      <div className="flex-1 overflow-hidden flex min-h-0">
        <div
          className="w-48 overflow-y-auto p-2 text-[11px]"
          style={{ borderRight: '1px solid rgba(108, 230, 248, 0.18)' }}
        >
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
            <div className="text-xs holo-readout" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
              // Select a file to preview. Tree is served by{' '}
              <span className="font-mono" style={{ color: '#aaf6ff' }}>mastra_workspace_list_files</span> —
              the same tool the agent uses.
            </div>
          )}
          {selected && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="text-[10px] font-mono truncate flex-1 min-w-0" style={{ color: '#aaf6ff' }}>
                  &gt; {selected}
                </div>
                <button
                  onClick={() => setFullscreen(true)}
                  className="shrink-0 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 transition-all"
                  style={{
                    border: '1px solid rgba(108, 230, 248, 0.35)',
                    color: '#88efff',
                    background: 'rgba(108, 230, 248, 0.04)',
                  }}
                  title="Open full screen (Esc to exit)"
                >
                  ⛶ FULLSCREEN
                </button>
              </div>
              {fileLoading ? (
                <div className="text-xs italic holo-readout" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>// reading...</div>
              ) : (
                <FilePreview path={selected} content={fileContent ?? ''} />
              )}
            </div>
          )}
        </div>
      </div>
      <div className="p-2 text-[10px] holo-readout leading-snug" style={{ borderTop: '1px solid rgba(108, 230, 248, 0.22)', color: 'rgba(108, 230, 248, 0.55)' }}>
        // Reads go through{' '}
        <span className="font-mono" style={{ color: '#aaf6ff' }}>
          POST /api/agents/{agentId}/tools/mastra_workspace_read_file/execute
        </span>
      </div>
      {fullscreen && selected &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex flex-col scan-lines"
            style={{
              background: 'rgba(2, 14, 20, 0.97)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div
              className="flex items-center gap-3 px-6 py-3"
              style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.35)' }}
            >
              <span className="glow-cyan" style={{ color: '#aaf6ff' }}>▤</span>
              <div className="text-sm font-mono uppercase tracking-wider truncate flex-1 min-w-0" style={{ color: '#aaf6ff' }}>
                &gt; {selected}
              </div>
              <span className="text-[10px] holo-readout hidden sm:inline" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
                ESC TO CLOSE
              </span>
              <button
                onClick={() => setFullscreen(false)}
                className="holo-button"
              >
                ✕ EXIT
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 md:px-12 py-6">
              <div className="max-w-4xl mx-auto">
                {fileLoading ? (
                  <div className="text-sm italic holo-readout" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>// reading...</div>
                ) : (
                  <FilePreview
                    path={selected}
                    content={fileContent ?? ''}
                    fullscreen
                  />
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
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
  const isSelected = selected === node.path;
  return (
    <div>
      <button
        onClick={() => (isDir ? onToggle(node.path) : onOpen(node.path))}
        className="w-full flex items-center gap-1 py-0.5 text-left transition-colors"
        style={{
          ...pad,
          background: isSelected
            ? 'linear-gradient(90deg, rgba(108, 230, 248, 0.18), transparent 90%)'
            : 'transparent',
          borderLeft: isSelected ? '2px solid #aaf6ff' : '2px solid transparent',
          color: isSelected ? '#aaf6ff' : '#a8e0ec',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'rgba(108, 230, 248, 0.05)';
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'transparent';
        }}
      >
        <span className="w-3" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
          {isDir ? (node.expanded ? '▾' : '▸') : ' '}
        </span>
        <span style={{ color: isDir ? '#88efff' : 'rgba(108, 230, 248, 0.7)' }}>
          {isDir ? '▤' : '▢'}
        </span>
        <span className="truncate font-mono">{node.name}</span>
        {typeof node.size === 'number' && !isDir && (
          <span className="ml-auto text-[9px]" style={{ color: 'rgba(108, 230, 248, 0.4)' }}>
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

function FilePreview({
  path,
  content,
  fullscreen = false,
}: {
  path: string;
  content: string;
  fullscreen?: boolean;
}) {
  const lower = path.toLowerCase();
  const textSize = fullscreen ? 'text-base' : 'text-sm';
  const codeSize = fullscreen ? 'text-sm p-4' : 'text-[11px] p-3';
  const iframeHeight = fullscreen ? 'h-[80vh]' : 'h-[60vh]';

  if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
    return (
      <div className={`prose-chat ${textSize}`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }
  if (lower.endsWith('.html') || lower.endsWith('.htm')) {
    return (
      <iframe
        srcDoc={content}
        className={`w-full ${iframeHeight} bg-white rounded`}
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
      <pre
        className={`${codeSize} whitespace-pre-wrap break-all font-mono overflow-auto`}
        style={{ background: 'rgba(2, 14, 20, 0.85)', border: '1px solid rgba(108, 230, 248, 0.18)', color: '#cdf2fb' }}
      >
        {pretty}
      </pre>
    );
  }
  return (
    <pre
      className={`${codeSize} whitespace-pre-wrap break-all font-mono overflow-auto`}
      style={{ background: 'rgba(2, 14, 20, 0.85)', border: '1px solid rgba(108, 230, 248, 0.18)', color: '#cdf2fb' }}
    >
      {content || '(empty)'}
    </pre>
  );
}
