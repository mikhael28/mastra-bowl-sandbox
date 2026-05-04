import SwiftUI

enum ToolStatus: String, Sendable, Equatable {
    case calling           // tool-call chunk arrived, awaiting result
    case awaitingApproval  // tool-call-approval chunk — paused for HITL
    case done              // tool-result with no error
    case error             // tool-error or tool-result.isError
}

/// A single tool invocation made by the agent during one assistant turn.
/// Generic — no built-in mystical kinds. The display layer styles based on
/// tool name and a small lookup table of known Mastra tools.
struct ToolCall: Identifiable, Equatable, Sendable {
    let id: String          // Mastra's toolCallId — stable across stream chunks
    let name: String        // toolName, e.g. "tavily-search", "fs_read_text_file"
    var argsPreview: String // pretty-printed JSON, capped to ~400 chars
    var resultPreview: String?
    var status: ToolStatus
    let startedAt: Date

    init(
        id: String,
        name: String,
        argsPreview: String = "",
        resultPreview: String? = nil,
        status: ToolStatus = .calling,
        startedAt: Date = .init()
    ) {
        self.id = id
        self.name = name
        self.argsPreview = argsPreview
        self.resultPreview = resultPreview
        self.status = status
        self.startedAt = startedAt
    }
}

/// Tiny lookup of accent colors + SF Symbols for known Mastra tools so the
/// chat cards aren't a wall of identical pills. Falls back to a neutral
/// "tool" icon when we don't recognise the name.
enum ToolStyle {
    static func icon(for toolName: String) -> String {
        let n = toolName.lowercased()
        if n.contains("tavily") || n.contains("exa") || n.contains("search") { return "magnifyingglass" }
        if n.contains("deep-research") || n.contains("research") { return "books.vertical.fill" }
        if n.contains("kb-") || n.contains("rag") || n.contains("ingest") { return "tray.full.fill" }
        if n.contains("todo") { return "checklist" }
        if n.contains("qualify-lead") || n.contains("lead") { return "person.2.fill" }
        if n.contains("readdocs") || n.contains("docs") { return "doc.text.fill" }
        if n.contains("fs_read") || n.contains("read_file") { return "doc.fill" }
        if n.contains("fs_write") || n.contains("write_file") { return "square.and.pencil" }
        if n.contains("fs_list") || n.contains("directory") { return "folder.fill" }
        if n.contains("fs_") { return "folder" }
        if n.contains("stagehand") || n.contains("browser") { return "safari.fill" }
        if n.contains("voice") || n.contains("speak") { return "waveform" }
        if n.contains("email") || n.contains("inbox") || n.contains("agentmail") { return "envelope.fill" }
        if n.contains("slack") { return "message.fill" }
        if n.contains("notion") { return "doc.richtext.fill" }
        if n.contains("linear") { return "list.bullet.rectangle.fill" }
        if n.contains("github") { return "chevron.left.forwardslash.chevron.right" }
        if n.contains("gmail") { return "envelope.badge.fill" }
        if n.contains("hubspot") { return "chart.line.uptrend.xyaxis" }
        if n.contains("workflow") { return "flowchart.fill" }
        return "wrench.and.screwdriver.fill"
    }

    static func accent(for toolName: String) -> Color {
        let n = toolName.lowercased()
        if n.contains("tavily") || n.contains("exa") || n.contains("search") {
            return Color(red: 0.55, green: 0.78, blue: 1.00)
        }
        if n.contains("deep-research") || n.contains("research") {
            return Color(red: 0.86, green: 0.66, blue: 0.95)
        }
        if n.contains("kb-") || n.contains("rag") {
            return Color(red: 0.62, green: 0.86, blue: 0.94)
        }
        if n.contains("fs_") {
            return Color(red: 0.84, green: 0.74, blue: 0.42)
        }
        if n.contains("stagehand") || n.contains("browser") {
            return Color(red: 0.40, green: 0.76, blue: 0.62)
        }
        if n.contains("email") || n.contains("agentmail") || n.contains("gmail") {
            return Color(red: 0.98, green: 0.62, blue: 0.36)
        }
        if n.contains("slack") {
            return Color(red: 0.78, green: 0.55, blue: 0.95)
        }
        if n.contains("todo") || n.contains("qualify") {
            return Color(red: 0.95, green: 0.85, blue: 0.55)
        }
        return Color(red: 0.86, green: 0.71, blue: 0.36)
    }

    static func displayName(for toolName: String) -> String {
        // "kb-search" → "KB Search", "fs_read_text_file" → "Read text file"
        if toolName.hasPrefix("fs_") {
            let trimmed = toolName.dropFirst(3).replacingOccurrences(of: "_", with: " ")
            return trimmed.prefix(1).uppercased() + trimmed.dropFirst()
        }
        if toolName.hasPrefix("kb-") {
            let rest = toolName.dropFirst(3).replacingOccurrences(of: "-", with: " ")
            return "KB " + rest
        }
        let words = toolName
            .replacingOccurrences(of: "-", with: " ")
            .replacingOccurrences(of: "_", with: " ")
            .split(separator: " ")
            .map { $0.prefix(1).uppercased() + $0.dropFirst() }
        return words.joined(separator: " ")
    }
}
