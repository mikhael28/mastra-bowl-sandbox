import SwiftUI

enum Appearance: String, CaseIterable, Identifiable, Codable, Sendable {
    case system, light, dark

    var id: String { rawValue }

    var label: String {
        switch self {
        case .system: "System"
        case .light: "Light"
        case .dark: "Dark"
        }
    }

    var symbol: String {
        switch self {
        case .system: "circle.lefthalf.filled"
        case .light: "sun.max.fill"
        case .dark: "moon.stars.fill"
        }
    }

    var colorScheme: ColorScheme? {
        switch self {
        case .system: nil
        case .light: .light
        case .dark: .dark
        }
    }
}

enum ConnectionStatus: Equatable, Sendable {
    case unknown
    case connecting
    case online(agent: String)        // human-friendly label of the resolved agent
    case offline(reason: String)
}

/// App-level state shared across tabs. Owns:
///   – the configured Mastra endpoint URL
///   – the persistent thread/resource IDs (so observational memory carries
///     across launches)
///   – live `ConnectionStatus` + the cached agent summary
///   – appearance setting
///
/// Re-pings whenever the URL changes; the chat view subscribes via
/// `@EnvironmentObject` and reacts.
@MainActor
final class AppState: ObservableObject {
    // The agent we always talk to — this is the on-rails part. If the user
    // points at a Mastra server that doesn't have a `mastraclaw-agent`, we
    // surface a friendly error and let them open Settings.
    static let preferredAgentId = "mastraclaw-agent"

    @AppStorage("endpoint-url") private var storedURL: String = AppState.defaultEndpoint
    @AppStorage("appearance") private var storedAppearance: String = Appearance.system.rawValue
    @AppStorage("thread-id") private var storedThreadId: String = ""
    @AppStorage("resource-id") private var storedResourceId: String = ""

    @Published var endpointURL: String {
        didSet {
            storedURL = endpointURL
            if endpointURL != oldValue {
                Task { await refresh() }
            }
        }
    }

    @Published var appearance: Appearance {
        didSet { storedAppearance = appearance.rawValue }
    }

    @Published private(set) var connection: ConnectionStatus = .unknown
    @Published private(set) var agent: AgentSummary?

    /// Stable across launches — the resourceId scopes working memory to "this
    /// device's user". The threadId scopes observational/last-N memory to
    /// "this conversation". User can clear the conversation to mint a new
    /// threadId without resetting working memory.
    @Published private(set) var resourceId: String
    @Published private(set) var threadId: String

    /// Bumps when the user resets the chat manually. ChatViewModel listens.
    @Published var resetSignal: Int = 0

    /// Bumps when `threadId` was set via thread switching/auto-resume so the
    /// chat view knows to rehydrate from history rather than show the
    /// default greeting. Distinct from `resetSignal`, which means "blank
    /// slate".
    @Published var threadResumeSignal: Int = 0

    /// Cached most-recent thread list — surfaced in ThreadsSheet.
    @Published var threads: [ThreadSummary] = []

    init() {
        let initialURL = Self.normalizeURL(UserDefaults.standard.string(forKey: "endpoint-url") ?? Self.defaultEndpoint)
        self.endpointURL = initialURL
        self.appearance = Appearance(rawValue: UserDefaults.standard.string(forKey: "appearance") ?? "")
            ?? .system

        let savedResource = UserDefaults.standard.string(forKey: "resource-id") ?? ""
        let resourceId = savedResource.isEmpty ? UUID().uuidString : savedResource
        self.resourceId = resourceId
        self.storedResourceId = resourceId

        let savedThread = UserDefaults.standard.string(forKey: "thread-id") ?? ""
        let threadId = savedThread.isEmpty ? UUID().uuidString : savedThread
        self.threadId = threadId
        self.storedThreadId = threadId
    }

    var client: MastraClient? {
        guard let url = URL(string: endpointURL) else { return nil }
        return MastraClient(baseURL: url)
    }

    /// Fire-and-forget probe of the configured endpoint. Updates
    /// `connection` and caches the agent summary on success, then resumes
    /// the most recent thread for `resourceId` if one exists.
    func refresh() async {
        connection = .connecting
        guard let client else {
            connection = .offline(reason: "endpoint URL is invalid")
            return
        }
        let alive = await client.ping()
        guard alive else {
            connection = .offline(reason: "could not reach \(endpointURL)")
            agent = nil
            return
        }
        do {
            let summary = try await client.getAgent(Self.preferredAgentId)
            agent = summary
            connection = .online(agent: summary.displayName)
        } catch {
            // Server is up, but no MastraClaw agent — degrade to a list probe
            // so the user at least sees something useful.
            do {
                let list = try await client.listAgents()
                agent = list.first
                if let first = list.first {
                    connection = .online(agent: first.displayName)
                } else {
                    connection = .offline(reason: "no agents on this server")
                }
            } catch {
                connection = .offline(reason: "agent metadata unavailable")
                agent = nil
            }
        }
        await reloadThreads(resumeMostRecent: true)
    }

    /// Pull the latest thread list for our resource. When `resumeMostRecent`
    /// is true and we don't yet have a server-known thread selected, swap
    /// `threadId` to the freshest one so chat picks up where the user left
    /// off — even across app reinstalls (the resourceId is durable).
    func reloadThreads(resumeMostRecent: Bool = false) async {
        guard let client, agent != nil else { return }
        let agentId = activeAgentId
        do {
            let list = try await client.listThreads(agentId: agentId, resourceId: resourceId)
            threads = list
            if resumeMostRecent, let mostRecent = list.first, mostRecent.id != threadId {
                // Only auto-switch if our current threadId isn't already in
                // the server's list — i.e. we're holding a freshly-minted
                // local UUID with no history yet.
                let known = list.contains { $0.id == threadId }
                if !known {
                    threadId = mostRecent.id
                    storedThreadId = mostRecent.id
                    threadResumeSignal &+= 1
                }
            }
        } catch {
            // Non-fatal; the picker will just show empty.
        }
    }

    /// Switch to an existing thread (from the history sheet). The chat view
    /// will rehydrate from server history when `threadResumeSignal` bumps.
    func selectThread(_ id: String) {
        guard id != threadId else { return }
        threadId = id
        storedThreadId = id
        threadResumeSignal &+= 1
    }

    /// Forget the current chat thread. Working memory (resourceId) survives
    /// so the assistant still remembers durable facts across resets.
    func resetConversation() {
        threadId = UUID().uuidString
        storedThreadId = threadId
        resetSignal &+= 1
    }

    /// Permanently delete a thread server-side and update local state. If we
    /// just deleted the active thread, mint a fresh local UUID.
    func deleteThread(_ id: String) async {
        guard let client else { return }
        do {
            try await client.deleteThread(threadId: id)
            threads.removeAll { $0.id == id }
            if id == threadId {
                resetConversation()
            }
        } catch {
            // surface elsewhere if needed; non-fatal for state
        }
    }

    /// Clear durable memory entirely — both thread and resource. Used by
    /// "Forget me" in Settings.
    func resetMemory() {
        resourceId = UUID().uuidString
        storedResourceId = resourceId
        resetConversation()
    }

    var activeAgentId: String { agent?.id ?? Self.preferredAgentId }

    // MARK: -

    static let defaultEndpoint = "http://localhost:4111"

    static func normalizeURL(_ raw: String) -> String {
        let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return defaultEndpoint }
        // strip trailing slash for cleaner display + reliable URL composition
        return trimmed.hasSuffix("/") ? String(trimmed.dropLast()) : trimmed
    }
}
