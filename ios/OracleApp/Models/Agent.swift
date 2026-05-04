import Foundation

struct AgentSummary: Identifiable, Equatable, Sendable, Codable {
    let id: String
    var name: String?
    var description: String?
    var modelId: String?
    var instructions: String?
    var tools: [ToolSummary]
    var subAgentIds: [String]
    var workflowIds: [String]

    var displayName: String { name ?? id }
}

struct ToolSummary: Identifiable, Equatable, Sendable, Codable, Hashable {
    let id: String          // tool id, e.g. "tavily-search"
    var description: String?
}
