import SwiftUI

/// Drives a live conversation against `/api/agents/:id/stream`. Folds NDJSON
/// chunks into one assistant `Message`, mirroring how the React reference
/// client folds them in `streamParse.ts` — that keeps the iOS UI in step
/// with the same chunk vocabulary.
@MainActor
final class ChatViewModel: ObservableObject {
    @Published private(set) var messages: [Message] = []
    @Published private(set) var isResponding: Bool = false
    @Published private(set) var statusLine: String = ""
    @Published var lastError: String?

    private weak var appState: AppState?
    private var task: Task<Void, Never>?

    init() {
        seedGreeting()
    }

    func bind(_ appState: AppState) {
        self.appState = appState
    }

    func reset() {
        task?.cancel()
        task = nil
        messages.removeAll()
        isResponding = false
        statusLine = ""
        lastError = nil
        seedGreeting()
    }

    /// Hydrate the chat from server-stored history for the current
    /// `appState.threadId`. Call this on launch (auto-resume) and whenever
    /// the user picks a different thread from the history sheet.
    func resumeFromServer() async {
        guard let appState else { return }
        guard let client = appState.client else { return }
        let threadId = appState.threadId
        let agentId = appState.activeAgentId

        task?.cancel()
        task = nil
        isResponding = false
        statusLine = "loading thread…"
        lastError = nil

        do {
            let history = try await client.threadMessages(threadId: threadId, agentId: agentId)
            messages = history
            if messages.isEmpty {
                seedGreeting()
            }
            statusLine = ""
        } catch {
            statusLine = ""
            // Non-fatal: just keep the greeting and let the user start fresh.
            messages.removeAll()
            seedGreeting()
        }
    }

    func send(_ raw: String) {
        let text = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, !isResponding else { return }
        guard let appState else {
            lastError = "internal: app state not bound"
            return
        }
        guard let client = appState.client else {
            lastError = "set a valid Mastra endpoint URL in Settings."
            return
        }

        messages.append(Message(role: .user, text: text))
        let assistant = Message(role: .assistant, text: "", isStreaming: true)
        messages.append(assistant)

        let agentId = appState.activeAgentId
        let threadId = appState.threadId
        let resourceId = appState.resourceId
        isResponding = true
        statusLine = "thinking…"
        lastError = nil

        task = Task { [weak self, weak appState] in
            await self?.consume(
                stream: client.streamAgent(
                    agentId: agentId,
                    userMessage: text,
                    threadId: threadId,
                    resourceId: resourceId
                ),
                client: client,
                agentId: agentId,
                assistantId: assistant.id
            )
            await MainActor.run {
                guard let self else { return }
                self.markStreamingFinished(self.indexOf(assistant.id))
                self.isResponding = false
                self.statusLine = ""
            }
            // Refresh thread list so a brand-new thread shows up in history
            // (titled, once Mastra's generateTitle has run).
            if let appState {
                await appState.reloadThreads()
            }
        }
    }

    func cancel() {
        task?.cancel()
        task = nil
        isResponding = false
        statusLine = ""
        if let idx = messages.indices.last, messages[idx].role == .assistant {
            markStreamingFinished(idx)
        }
    }

    // MARK: - Stream consumption

    private func consume(
        stream: AsyncThrowingStream<MastraChunk, Error>,
        client: MastraClient,
        agentId: String,
        assistantId: UUID
    ) async {
        do {
            for try await chunk in stream {
                if Task.isCancelled { break }
                await apply(chunk: chunk, to: assistantId, client: client, agentId: agentId)
            }
        } catch is CancellationError {
            return
        } catch {
            await MainActor.run {
                self.lastError = error.localizedDescription
                if let idx = self.indexOf(assistantId) {
                    self.messages[idx].error = error.localizedDescription
                }
            }
        }
    }

    private func apply(
        chunk: MastraChunk,
        to assistantId: UUID,
        client: MastraClient,
        agentId: String
    ) async {
        await MainActor.run {
            guard let idx = self.indexOf(assistantId) else { return }
            switch chunk {
            case .textDelta(let text):
                self.messages[idx].text += text
                if self.statusLine != "speaking…" {
                    self.statusLine = "speaking…"
                }

            case .reasoningDelta:
                // Don't surface reasoning in the on-rails UI — keep it clean.
                break

            case let .toolCallStart(id, name, argsJSON, _):
                if !self.messages[idx].toolCalls.contains(where: { $0.id == id }) {
                    self.messages[idx].toolCalls.append(
                        ToolCall(
                            id: id,
                            name: name,
                            argsPreview: Self.truncate(argsJSON ?? ""),
                            status: .calling
                        )
                    )
                    self.statusLine = "calling \(ToolStyle.displayName(for: name))…"
                }

            case let .toolCallApproval(id, name, argsJSON, runId):
                self.upsertToolCall(at: idx, id: id, name: name, argsJSON: argsJSON, status: .awaitingApproval)
                if !runId.isEmpty {
                    self.statusLine = "auto-approving \(ToolStyle.displayName(for: name))…"
                    Task { [weak self] in
                        await self?.autoApprove(
                            client: client,
                            agentId: agentId,
                            runId: runId,
                            toolCallId: id,
                            assistantId: assistantId
                        )
                    }
                }

            case let .toolResult(id, resultJSON, isError, _):
                self.completeToolCall(
                    at: idx,
                    id: id,
                    result: resultJSON,
                    status: isError ? .error : .done
                )

            case let .toolError(id, message, _):
                if let id {
                    self.completeToolCall(at: idx, id: id, result: message, status: .error)
                } else {
                    self.lastError = message
                }

            case .tripwire(let reason):
                self.messages[idx].error = "blocked: \(reason)"

            case .finish:
                self.markStreamingFinished(idx)

            case .error(let message):
                self.messages[idx].error = message
                self.lastError = message

            case .ignored:
                break
            }
        }
    }

    private func autoApprove(
        client: MastraClient,
        agentId: String,
        runId: String,
        toolCallId: String,
        assistantId: UUID
    ) async {
        let stream = client.resumeToolApproval(
            agentId: agentId,
            runId: runId,
            toolCallId: toolCallId,
            approved: true
        )
        await consume(stream: stream, client: client, agentId: agentId, assistantId: assistantId)
    }

    // MARK: - Mutations

    private func upsertToolCall(
        at idx: Int,
        id: String,
        name: String,
        argsJSON: String?,
        status: ToolStatus
    ) {
        if let pos = messages[idx].toolCalls.firstIndex(where: { $0.id == id }) {
            messages[idx].toolCalls[pos].status = status
            if messages[idx].toolCalls[pos].argsPreview.isEmpty, let argsJSON {
                messages[idx].toolCalls[pos].argsPreview = Self.truncate(argsJSON)
            }
        } else {
            messages[idx].toolCalls.append(
                ToolCall(
                    id: id,
                    name: name,
                    argsPreview: Self.truncate(argsJSON ?? ""),
                    status: status
                )
            )
        }
    }

    private func completeToolCall(at idx: Int, id: String, result: String, status: ToolStatus) {
        guard let pos = messages[idx].toolCalls.firstIndex(where: { $0.id == id }) else { return }
        messages[idx].toolCalls[pos].status = status
        messages[idx].toolCalls[pos].resultPreview = Self.truncate(result, max: 800)
    }

    private func markStreamingFinished(_ idx: Int?) {
        guard let idx, messages.indices.contains(idx) else { return }
        messages[idx].isStreaming = false
    }

    private func indexOf(_ id: UUID) -> Int? {
        messages.firstIndex(where: { $0.id == id })
    }

    private func seedGreeting() {
        let greeting = Message(
            role: .assistant,
            text: "I'm MastraClaw — an autonomous assistant for business development and content. Ask me to research, draft, qualify a lead, or organize your workspace. I'll narrate what I'm doing as I go."
        )
        messages.append(greeting)
    }

    private static func truncate(_ s: String, max: Int = 400) -> String {
        guard s.count > max else { return s }
        return String(s.prefix(max)) + "…"
    }
}
