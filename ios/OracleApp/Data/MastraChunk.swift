import Foundation

/// Decoded view of a single NDJSON line from /api/agents/:id/stream.
///
/// Mastra streams a permissive set of chunk types — we only model the ones
/// the chat UI cares about and quietly ignore everything else.
enum MastraChunk: Sendable {
    case textDelta(String)
    case reasoningDelta(String)
    case toolCallStart(id: String, name: String, argsJSON: String?, runId: String?)
    case toolCallApproval(id: String, name: String, argsJSON: String?, runId: String)
    case toolResult(id: String, resultJSON: String, isError: Bool, runId: String?)
    case toolError(id: String?, message: String, runId: String?)
    case tripwire(reason: String)
    case finish(runId: String?)
    case error(String)
    case ignored(String)
}

extension MastraChunk {
    /// Parse a single NDJSON line into a chunk. Returns nil for lines we
    /// can't decode at all (so the stream loop can drop them silently).
    static func decode(line: String) -> MastraChunk? {
        guard let data = line.data(using: .utf8) else { return nil }
        guard let object = try? JSONSerialization.jsonObject(with: data),
              let dict = object as? [String: Any] else {
            return nil
        }
        let type = (dict["type"] as? String) ?? "unknown"
        let runId = dict["runId"] as? String
        let payload = (dict["payload"] as? [String: Any]) ?? [:]
        let dataField = (dict["data"] as? [String: Any]) ?? [:]

        switch type {
        case "text-delta":
            let t = (payload["text"] as? String)
                ?? (dict["textDelta"] as? String)
                ?? (payload["textDelta"] as? String)
                ?? ""
            return t.isEmpty ? .ignored(type) : .textDelta(t)

        case "reasoning-delta":
            let t = (payload["text"] as? String) ?? ""
            return t.isEmpty ? .ignored(type) : .reasoningDelta(t)

        case "tool-call":
            let id = (payload["toolCallId"] as? String) ?? UUID().uuidString
            let name = (payload["toolName"] as? String) ?? "tool"
            let argsJSON = encodeJSON(payload["args"])
            return .toolCallStart(id: id, name: name, argsJSON: argsJSON, runId: runId)

        case "tool-call-approval", "data-tool-call-approval":
            let id = (payload["toolCallId"] as? String)
                ?? (dataField["toolCallId"] as? String)
                ?? UUID().uuidString
            let name = (payload["toolName"] as? String)
                ?? (dataField["toolName"] as? String)
                ?? "tool"
            let argsJSON = encodeJSON(payload["args"] ?? dataField["args"])
            // For approvals we *must* have a runId — without it we can't
            // resume. Fall back to empty string so callers can detect this
            // edge case without crashing.
            return .toolCallApproval(id: id, name: name, argsJSON: argsJSON, runId: runId ?? "")

        case "tool-result":
            let id = (payload["toolCallId"] as? String) ?? ""
            let isError = (payload["isError"] as? Bool) ?? false
            let resultJSON = encodeJSON(payload["result"]) ?? ""
            return .toolResult(id: id, resultJSON: resultJSON, isError: isError, runId: runId)

        case "tool-error":
            let id = payload["toolCallId"] as? String
            let message = describeError(payload["error"]) ?? "tool errored"
            return .toolError(id: id, message: message, runId: runId)

        case "tripwire":
            let reason = (payload["reason"] as? String) ?? "blocked by safety processor"
            return .tripwire(reason: reason)

        case "finish":
            return .finish(runId: runId)

        case "error":
            let msg = describeError(payload["error"]) ?? "stream error"
            return .error(msg)

        default:
            return .ignored(type)
        }
    }

    private static func encodeJSON(_ value: Any?) -> String? {
        guard let value, !(value is NSNull) else { return nil }
        if let s = value as? String { return s }
        guard JSONSerialization.isValidJSONObject(value) else { return String(describing: value) }
        let opts: JSONSerialization.WritingOptions = [.sortedKeys, .withoutEscapingSlashes]
        guard let data = try? JSONSerialization.data(withJSONObject: value, options: opts) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    private static func describeError(_ value: Any?) -> String? {
        guard let value, !(value is NSNull) else { return nil }
        if let s = value as? String { return s }
        if let dict = value as? [String: Any] {
            if let msg = dict["message"] as? String { return msg }
            if let err = dict["error"] as? String { return err }
        }
        return encodeJSON(value)
    }
}
