import Foundation

/// HTTP/streaming client for a Mastra server. Stateless — instantiated per
/// call from view models with the user-configured `baseURL`. Uses
/// `URLSession.shared.bytes` for the NDJSON agent stream so chunks arrive
/// without buffering.
struct MastraClient: Sendable {
    let baseURL: URL

    enum ClientError: LocalizedError {
        case http(Int, String)
        case decoding(String)
        case unreachable

        var errorDescription: String? {
            switch self {
            case .http(let code, let body):
                return "HTTP \(code) — \(body.prefix(200))"
            case .decoding(let detail):
                return "could not decode response: \(detail)"
            case .unreachable:
                return "could not reach the Mastra server"
            }
        }
    }

    // MARK: - Health

    func ping() async -> Bool {
        guard let url = url(path: "/api/agents") else { return false }
        var request = URLRequest(url: url)
        request.timeoutInterval = 4
        do {
            let (_, response) = try await URLSession.shared.data(for: request)
            return (response as? HTTPURLResponse).map { (200..<300).contains($0.statusCode) } ?? false
        } catch {
            return false
        }
    }

    // MARK: - Agents

    func listAgents() async throws -> [AgentSummary] {
        let raw: Any = try await getJSON("/api/agents")
        return parseAgentList(raw)
    }

    /// Hydrates the full agent description: tools, sub-agents, workflows,
    /// instructions. Mastra returns these as keyed dictionaries — we
    /// flatten them into arrays for SwiftUI lists.
    func getAgent(_ id: String) async throws -> AgentSummary {
        let raw: Any = try await getJSON("/api/agents/\(id)")
        guard let dict = raw as? [String: Any] else {
            throw ClientError.decoding("agent \(id) did not return an object")
        }
        return parseAgent(id: id, dict: dict)
    }

    // MARK: - Workspace

    /// Lists a directory under `workspace/`. We drive this through the
    /// MCP `fs_list_directory_with_sizes` tool the agent already has so
    /// access rules stay in lock-step with what the agent sees.
    func listWorkspace(agentId: String, path: String = "workspace") async throws -> [WorkspaceEntry] {
        let normalized = (path == "" || path == ".") ? "workspace" : path
        let raw = try await executeAgentTool(
            agentId: agentId,
            toolId: "fs_list_directory_with_sizes",
            data: ["path": normalized]
        )
        let unwrapped = unwrapToolResult(raw)
        let text: String = {
            if let s = unwrapped as? String { return s }
            if let dict = unwrapped as? [String: Any], let s = dict["content"] as? String { return s }
            return ""
        }()
        return Self.parseFsListing(text, basePath: normalized)
    }

    // MARK: - Memory threads

    /// List every thread that belongs to a `resourceId` for a given agent.
    /// Sorted newest first by best-available timestamp.
    func listThreads(agentId: String, resourceId: String) async throws -> [ThreadSummary] {
        var components = URLComponents(string: "/api/memory/threads")!
        components.queryItems = [
            URLQueryItem(name: "resourceId", value: resourceId),
            URLQueryItem(name: "agentId", value: agentId),
        ]
        let raw = try await getJSON(components.string ?? "/api/memory/threads")
        let array = Self.extractThreadsArray(raw)
        let parsed = array.compactMap(Self.parseThread)
        return parsed.sorted { $0.sortDate > $1.sortDate }
    }

    /// Pull a thread's messages and re-form them into the iOS `Message`
    /// shape the chat list renders. Tool-call/tool-result content parts are
    /// dropped — only the user/assistant text survives, which is enough to
    /// give the user a readable transcript when resuming.
    func threadMessages(threadId: String, agentId: String) async throws -> [Message] {
        var components = URLComponents(string: "/api/memory/threads/\(threadId)/messages")!
        components.queryItems = [URLQueryItem(name: "agentId", value: agentId)]
        let raw = try await getJSON(components.string ?? "/api/memory/threads/\(threadId)/messages")
        let array: [[String: Any]] = {
            if let arr = raw as? [[String: Any]] { return arr }
            if let dict = raw as? [String: Any], let inner = dict["messages"] as? [[String: Any]] { return inner }
            return []
        }()
        return array.compactMap(Self.parseMemoryMessage).sorted { $0.timestamp < $1.timestamp }
    }

    /// Permanently delete a thread.
    func deleteThread(threadId: String) async throws {
        guard let url = url(path: "/api/memory/threads/\(threadId)") else { throw ClientError.unreachable }
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        request.timeoutInterval = 10
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw ClientError.unreachable }
        guard (200..<300).contains(http.statusCode) else {
            throw ClientError.http(http.statusCode, String(data: data, encoding: .utf8) ?? "")
        }
    }

    // MARK: - Workspace

    func readWorkspaceFile(agentId: String, path: String) async throws -> String {
        let raw = try await executeAgentTool(
            agentId: agentId,
            toolId: "fs_read_text_file",
            data: ["path": path]
        )
        let unwrapped = unwrapToolResult(raw)
        if let s = unwrapped as? String { return s }
        if let dict = unwrapped as? [String: Any] {
            if let s = dict["content"] as? String { return s }
            if let s = dict["text"] as? String { return s }
            if let s = dict["data"] as? String { return s }
        }
        return ""
    }

    // MARK: - Streaming

    /// Open an agent stream. The returned `AsyncThrowingStream` yields one
    /// `MastraChunk` per NDJSON line and finishes when the server closes
    /// the connection. Cancelling the consumer cancels the network task.
    func streamAgent(
        agentId: String,
        userMessage: String,
        threadId: String,
        resourceId: String
    ) -> AsyncThrowingStream<MastraChunk, Error> {
        // The server-side Memory on the agent already configures lastMessages,
        // workingMemory, and generateTitle. Newer Mastra rejects the legacy
        // `threads.generateTitle` shape (HTTP 500), so just hand it the
        // thread + resource and let the server decide everything else.
        let body: [String: Any] = [
            "messages": userMessage,
            "memory": [
                "thread": threadId,
                "resource": resourceId,
            ],
        ]
        return openNDJSONStream(path: "/api/agents/\(agentId)/stream", body: body)
    }

    /// Resume a suspended run after a `tool-call-approval` chunk. Returns a
    /// fresh stream that continues the same run; consumers fold its chunks
    /// into the same assistant message.
    func resumeToolApproval(
        agentId: String,
        runId: String,
        toolCallId: String,
        approved: Bool
    ) -> AsyncThrowingStream<MastraChunk, Error> {
        let path = approved ? "approve-tool-call" : "decline-tool-call"
        let body: [String: Any] = ["runId": runId, "toolCallId": toolCallId]
        return openNDJSONStream(path: "/api/agents/\(agentId)/\(path)", body: body)
    }

    // MARK: - Internal

    private func url(path: String) -> URL? {
        URL(string: path, relativeTo: baseURL)?.absoluteURL
    }

    private func getJSON(_ path: String) async throws -> Any {
        guard let url = url(path: path) else { throw ClientError.unreachable }
        var request = URLRequest(url: url)
        request.timeoutInterval = 15
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw ClientError.unreachable }
        guard (200..<300).contains(http.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw ClientError.http(http.statusCode, body)
        }
        return try JSONSerialization.jsonObject(with: data, options: [.fragmentsAllowed])
    }

    private func executeAgentTool(
        agentId: String,
        toolId: String,
        data: [String: Any]
    ) async throws -> Any {
        guard let url = url(path: "/api/agents/\(agentId)/tools/\(toolId)/execute") else {
            throw ClientError.unreachable
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 30
        request.httpBody = try JSONSerialization.data(withJSONObject: ["data": data])
        let (responseData, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw ClientError.unreachable }
        guard (200..<300).contains(http.statusCode) else {
            let body = String(data: responseData, encoding: .utf8) ?? ""
            throw ClientError.http(http.statusCode, body)
        }
        return try JSONSerialization.jsonObject(with: responseData, options: [.fragmentsAllowed])
    }

    private func openNDJSONStream(path: String, body: [String: Any]) -> AsyncThrowingStream<MastraChunk, Error> {
        let baseURL = self.baseURL
        return AsyncThrowingStream { continuation in
            let task = Task {
                do {
                    guard let url = URL(string: path, relativeTo: baseURL)?.absoluteURL else {
                        throw ClientError.unreachable
                    }
                    var request = URLRequest(url: url)
                    request.httpMethod = "POST"
                    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                    request.setValue("application/x-ndjson", forHTTPHeaderField: "Accept")
                    request.timeoutInterval = 600
                    request.httpBody = try JSONSerialization.data(withJSONObject: body)

                    let (bytes, response) = try await URLSession.shared.bytes(for: request)
                    guard let http = response as? HTTPURLResponse else {
                        throw ClientError.unreachable
                    }
                    guard (200..<300).contains(http.statusCode) else {
                        var collected = Data()
                        for try await byte in bytes {
                            collected.append(byte)
                            if collected.count > 4_096 { break }
                        }
                        let body = String(data: collected, encoding: .utf8) ?? ""
                        throw ClientError.http(http.statusCode, body)
                    }

                    for try await rawLine in bytes.lines {
                        if Task.isCancelled { break }
                        let trimmed = rawLine.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !trimmed.isEmpty else { continue }
                        let payloadString = trimmed.hasPrefix("data:")
                            ? String(trimmed.dropFirst(5)).trimmingCharacters(in: .whitespaces)
                            : trimmed
                        if payloadString.isEmpty || payloadString == "[DONE]" { continue }
                        if let chunk = MastraChunk.decode(line: payloadString) {
                            continuation.yield(chunk)
                        }
                    }
                    continuation.finish()
                } catch {
                    if Task.isCancelled {
                        continuation.finish()
                    } else {
                        continuation.finish(throwing: error)
                    }
                }
            }
            continuation.onTermination = { _ in task.cancel() }
        }
    }
}

// MARK: - Parsing helpers

private func unwrapToolResult(_ raw: Any) -> Any {
    guard let dict = raw as? [String: Any] else { return raw }
    if let inner = dict["data"] { return inner }
    if let inner = dict["result"] { return inner }
    return raw
}

private func parseAgentList(_ raw: Any) -> [AgentSummary] {
    if let array = raw as? [[String: Any]] {
        return array.compactMap { dict -> AgentSummary? in
            guard let id = dict["id"] as? String else { return nil }
            return parseAgent(id: id, dict: dict)
        }
    }
    if let object = raw as? [String: Any] {
        return object.compactMap { (id, value) -> AgentSummary? in
            guard let dict = value as? [String: Any] else { return nil }
            return parseAgent(id: id, dict: dict)
        }
    }
    return []
}

private func parseAgent(id: String, dict: [String: Any]) -> AgentSummary {
    let tools = parseToolsField(dict["tools"])
    let subAgents = parseIdMap(dict["agents"])
    let workflows = parseIdMap(dict["workflows"])
    return AgentSummary(
        id: id,
        name: dict["name"] as? String,
        description: dict["description"] as? String,
        modelId: dict["modelId"] as? String,
        instructions: dict["instructions"] as? String,
        tools: tools.sorted { $0.id < $1.id },
        subAgentIds: subAgents.sorted(),
        workflowIds: workflows.sorted()
    )
}

private func parseToolsField(_ value: Any?) -> [ToolSummary] {
    if let dict = value as? [String: Any] {
        return dict.compactMap { (id, raw) in
            let entry = raw as? [String: Any]
            return ToolSummary(id: id, description: entry?["description"] as? String)
        }
    }
    if let array = value as? [[String: Any]] {
        return array.compactMap { entry in
            guard let id = entry["id"] as? String else { return nil }
            return ToolSummary(id: id, description: entry["description"] as? String)
        }
    }
    return []
}

private func parseIdMap(_ value: Any?) -> [String] {
    if let dict = value as? [String: Any] { return Array(dict.keys) }
    if let array = value as? [[String: Any]] { return array.compactMap { $0["id"] as? String } }
    if let array = value as? [String] { return array }
    return []
}

// MARK: - Thread parsing

extension MastraClient {
    fileprivate static func extractThreadsArray(_ raw: Any) -> [[String: Any]] {
        if let arr = raw as? [[String: Any]] { return arr }
        if let dict = raw as? [String: Any] {
            if let inner = dict["threads"] as? [[String: Any]] { return inner }
        }
        return []
    }

    fileprivate static func parseThread(_ dict: [String: Any]) -> ThreadSummary? {
        guard let id = dict["id"] as? String else { return nil }
        return ThreadSummary(
            id: id,
            title: (dict["title"] as? String).flatMap { $0.isEmpty ? nil : $0 },
            resourceId: dict["resourceId"] as? String,
            createdAt: parseISODate(dict["createdAt"]),
            updatedAt: parseISODate(dict["updatedAt"]),
            messageCount: dict["messageCount"] as? Int
        )
    }

    fileprivate static func parseMemoryMessage(_ dict: [String: Any]) -> Message? {
        guard let roleString = dict["role"] as? String else { return nil }
        let role: MessageRole
        switch roleString.lowercased() {
        case "user": role = .user
        case "assistant", "ai", "model": role = .assistant
        default: return nil  // skip system / tool / unknown
        }
        let text = extractText(dict["content"])
        if text.isEmpty { return nil }
        let id = parseUUID(dict["id"]) ?? UUID()
        let timestamp = parseISODate(dict["createdAt"]) ?? .init()
        return Message(
            id: id,
            role: role,
            text: text,
            isStreaming: false,
            timestamp: timestamp
        )
    }

    /// Mastra messages may store `content` as a plain string, an array of
    /// content parts (`{type: text, text: ...}`), or a wrapping object.
    /// Concatenate every text fragment we can find; ignore tool parts.
    private static func extractText(_ value: Any?) -> String {
        if let s = value as? String { return s }
        if let array = value as? [Any] {
            var parts: [String] = []
            for item in array {
                if let s = item as? String { parts.append(s); continue }
                if let dict = item as? [String: Any] {
                    let type = dict["type"] as? String
                    if type == nil || type == "text" {
                        if let text = dict["text"] as? String { parts.append(text) }
                    }
                }
            }
            return parts.joined()
        }
        if let dict = value as? [String: Any] {
            if let text = dict["text"] as? String { return text }
            if let parts = dict["parts"] as? [Any] { return extractText(parts) }
        }
        return ""
    }

    private static func parseISODate(_ value: Any?) -> Date? {
        guard let s = value as? String, !s.isEmpty else { return nil }
        if let d = isoFractional.date(from: s) { return d }
        if let d = isoStandard.date(from: s) { return d }
        return nil
    }

    private static func parseUUID(_ value: Any?) -> UUID? {
        if let s = value as? String, let uuid = UUID(uuidString: s) { return uuid }
        return nil
    }

    private static let isoFractional: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()

    private static let isoStandard: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f
    }()
}

extension MastraClient {
    fileprivate static func parseFsListing(_ text: String, basePath: String) -> [WorkspaceEntry] {
        guard !text.isEmpty else { return [] }
        var entries: [WorkspaceEntry] = []
        for rawLine in text.split(separator: "\n") {
            let line = rawLine.trimmingCharacters(in: .whitespaces)
            if line.isEmpty || line.hasPrefix("Total:") || line.hasPrefix("Combined size:") { continue }

            if line.hasPrefix("[DIR]") {
                let rest = line.dropFirst(5).trimmingCharacters(in: .whitespaces)
                let name = rest.split(separator: " ").first.map(String.init) ?? rest
                entries.append(WorkspaceEntry(
                    name: name,
                    path: "\(basePath)/\(name)",
                    kind: .directory,
                    size: nil
                ))
            } else if line.hasPrefix("[FILE]") {
                let rest = line.dropFirst(6).trimmingCharacters(in: .whitespaces)
                let parts = rest.split(separator: " ", maxSplits: 2, omittingEmptySubsequences: true)
                let name = parts.first.map(String.init) ?? rest
                var size: Int?
                if parts.count >= 2 {
                    let sizeToken = parts[1]
                    let unit = parts.count >= 3 ? parts[2].uppercased() : "B"
                    if let value = Double(sizeToken) {
                        let multiplier: Double
                        switch unit {
                        case "KB": multiplier = 1_024
                        case "MB": multiplier = 1_024 * 1_024
                        case "GB": multiplier = 1_024 * 1_024 * 1_024
                        default: multiplier = 1
                        }
                        size = Int(value * multiplier)
                    }
                }
                entries.append(WorkspaceEntry(
                    name: name,
                    path: "\(basePath)/\(name)",
                    kind: .file,
                    size: size
                ))
            }
        }
        // dirs first, alphabetical within each kind
        entries.sort { lhs, rhs in
            if lhs.kind != rhs.kind { return lhs.kind == .directory }
            return lhs.name.localizedCaseInsensitiveCompare(rhs.name) == .orderedAscending
        }
        return entries
    }
}
