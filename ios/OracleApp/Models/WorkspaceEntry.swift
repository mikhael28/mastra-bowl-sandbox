import Foundation

struct WorkspaceEntry: Identifiable, Equatable, Sendable, Hashable {
    enum Kind: String, Sendable { case file, directory }

    var id: String { path }
    let name: String
    let path: String
    let kind: Kind
    let size: Int?

    var sizeLabel: String? {
        guard let size, kind == .file else { return nil }
        let formatter = ByteCountFormatter()
        formatter.allowedUnits = [.useKB, .useMB, .useBytes]
        formatter.countStyle = .file
        return formatter.string(fromByteCount: Int64(size))
    }
}
