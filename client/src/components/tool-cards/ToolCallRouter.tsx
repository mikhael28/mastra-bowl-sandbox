import { classifyTool } from '../../lib/education';
import { GenericToolCard } from './GenericToolCard';
import {
  WorkspaceListCard,
  WorkspaceReadCard,
  WorkspaceWriteCard,
  WorkspaceDeleteCard,
  WorkspaceSimpleCard,
} from './WorkspaceCards';
import { SandboxExecCard } from './SandboxCard';
import { StagehandCard } from './StagehandCard';
import { RagSearchCard } from './RagSearchCard';
import { SubagentCard } from './SubagentCard';
import { WorkflowCard } from './WorkflowCard';
import { TodoCard } from './TodoCard';
import { ToolCardProps } from './types';

/**
 * Central dispatcher. Replaces the monolithic ToolCallView in Chat.tsx. Looks
 * at the tool's name (plus, optionally, the set of known subagents/workflows
 * for this agent) and picks the right specialized card. Fallback is
 * GenericToolCard so nothing disappears.
 */
export interface ToolCallRouterProps extends ToolCardProps {
  /** Known subagent tool names for this agent (so subagents aren't mis-detected). */
  knownSubagents?: string[];
  /** Known workflow ids for this agent. */
  knownWorkflows?: string[];
  /** For TodoCard → refresh the sidebar after any todo-* call. */
  onRefreshTodos?: () => void;
}

export function ToolCallRouter(props: ToolCallRouterProps) {
  const kind = classifyTool(
    props.tc.toolName,
    props.knownWorkflows ?? [],
    props.knownSubagents ?? [],
  );

  switch (kind) {
    case 'workspace-list':
      return <WorkspaceListCard {...props} />;
    case 'workspace-read':
      return <WorkspaceReadCard {...props} />;
    case 'workspace-write':
    case 'workspace-edit':
      return <WorkspaceWriteCard {...props} />;
    case 'workspace-delete':
      return <WorkspaceDeleteCard {...props} />;
    case 'workspace-grep':
    case 'workspace-mkdir':
      return <WorkspaceSimpleCard {...props} />;

    case 'sandbox-exec':
    case 'sandbox-kill':
      return <SandboxExecCard {...props} />;

    case 'stagehand-navigate':
    case 'stagehand-observe':
    case 'stagehand-act':
    case 'stagehand-extract':
    case 'stagehand-close':
    case 'stagehand-other':
      return <StagehandCard {...props} />;

    case 'rag-search':
      return <RagSearchCard {...props} />;

    case 'subagent':
      return <SubagentCard {...props} />;

    case 'workflow':
      return <WorkflowCard {...props} />;

    case 'todo':
      return <TodoCard {...props} onRefreshTodos={props.onRefreshTodos} />;

    default:
      return <GenericToolCard {...props} />;
  }
}
