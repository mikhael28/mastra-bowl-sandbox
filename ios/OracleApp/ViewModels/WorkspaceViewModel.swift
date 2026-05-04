import SwiftUI

@MainActor
final class WorkspaceViewModel: ObservableObject {
    @Published private(set) var path: String = "workspace"
    @Published private(set) var entries: [WorkspaceEntry] = []
    @Published private(set) var loading: Bool = false
    @Published var error: String?

    @Published var openFile: OpenFile?

    struct OpenFile: Identifiable, Equatable {
        var id: String { path }
        let name: String
        let path: String
        let content: String
    }

    func load(path: String, using client: MastraClient, agentId: String) async {
        self.path = path
        self.loading = true
        self.error = nil
        defer { self.loading = false }
        do {
            entries = try await client.listWorkspace(agentId: agentId, path: path)
        } catch {
            self.entries = []
            self.error = error.localizedDescription
        }
    }

    func enter(_ entry: WorkspaceEntry, using client: MastraClient, agentId: String) async {
        switch entry.kind {
        case .directory:
            await load(path: entry.path, using: client, agentId: agentId)
        case .file:
            await loadFile(entry, using: client, agentId: agentId)
        }
    }

    func goUp(using client: MastraClient, agentId: String) async {
        guard path != "workspace", path.contains("/") else { return }
        let parent = String(path.split(separator: "/").dropLast().joined(separator: "/"))
        let next = parent.isEmpty ? "workspace" : parent
        await load(path: next, using: client, agentId: agentId)
    }

    func refresh(using client: MastraClient, agentId: String) async {
        await load(path: path, using: client, agentId: agentId)
    }

    private func loadFile(_ entry: WorkspaceEntry, using client: MastraClient, agentId: String) async {
        loading = true
        defer { loading = false }
        do {
            let content = try await client.readWorkspaceFile(agentId: agentId, path: entry.path)
            openFile = OpenFile(name: entry.name, path: entry.path, content: content)
        } catch {
            self.error = error.localizedDescription
        }
    }
}
