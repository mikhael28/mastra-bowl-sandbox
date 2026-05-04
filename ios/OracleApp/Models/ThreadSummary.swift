import Foundation

struct ThreadSummary: Identifiable, Equatable, Sendable, Hashable {
    let id: String
    let title: String?
    let resourceId: String?
    let createdAt: Date?
    let updatedAt: Date?
    let messageCount: Int?

    var displayTitle: String {
        if let title, !title.trimmingCharacters(in: .whitespaces).isEmpty {
            return title
        }
        return "Conversation"
    }

    /// Best-known timestamp for sorting.
    var sortDate: Date {
        updatedAt ?? createdAt ?? .distantPast
    }
}
