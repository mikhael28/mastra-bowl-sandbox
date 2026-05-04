import Foundation

enum MessageRole: String, Codable, Sendable {
    case user
    case assistant
}

struct Message: Identifiable, Equatable, Sendable {
    let id: UUID
    let role: MessageRole
    var text: String
    var toolCalls: [ToolCall]
    var isStreaming: Bool
    var error: String?
    let timestamp: Date

    init(
        id: UUID = UUID(),
        role: MessageRole,
        text: String = "",
        toolCalls: [ToolCall] = [],
        isStreaming: Bool = false,
        error: String? = nil,
        timestamp: Date = .init()
    ) {
        self.id = id
        self.role = role
        self.text = text
        self.toolCalls = toolCalls
        self.isStreaming = isStreaming
        self.error = error
        self.timestamp = timestamp
    }
}
