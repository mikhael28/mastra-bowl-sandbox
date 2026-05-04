import SwiftUI

/// Browse the agent's `./workspace` directory. Tap a folder to descend, tap
/// a file to open it in a glass sheet. Read-only — the on-rails iOS app
/// doesn't let you edit; that's what chat is for.
struct WorkspaceView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var vm = WorkspaceViewModel()
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        ZStack {
            Theme.backdrop(for: scheme).ignoresSafeArea()
            StarfieldBackground().ignoresSafeArea().opacity(0.6)

            VStack(spacing: 12) {
                header

                pathBar

                if vm.loading && vm.entries.isEmpty {
                    Spacer()
                    ProgressView()
                    Spacer()
                } else if vm.entries.isEmpty {
                    emptyState
                } else {
                    entryList
                }
            }
            .padding(.top, 8)
        }
        .task {
            await reloadIfPossible()
        }
        .onChange(of: appState.connection) { _, _ in
            Task { await reloadIfPossible() }
        }
        .sheet(item: $vm.openFile) { file in
            FileViewer(file: file)
        }
        .alert("Workspace error", isPresented: errorBinding) {
            Button("OK") { vm.error = nil }
        } message: {
            Text(vm.error ?? "")
        }
    }

    // MARK: - Sections

    private var header: some View {
        VStack(spacing: 4) {
            Text("WORKSPACE")
                .font(.system(.caption, design: .rounded).weight(.semibold))
                .tracking(4)
                .foregroundStyle(.secondary)
            Text("Files the agent can see")
                .font(Font.system(.title2, design: .rounded).weight(.semibold))
                .foregroundStyle(.primary)
        }
    }

    private var pathBar: some View {
        HStack(spacing: 10) {
            Button {
                Task { await goUp() }
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(canGoUp ? AnyShapeStyle(Theme.gold) : AnyShapeStyle(.tertiary))
                    .frame(width: 32, height: 32)
                    .background(
                        Circle().fill(Theme.gold.opacity(canGoUp ? 0.12 : 0.04))
                    )
            }
            .buttonStyle(.plain)
            .disabled(!canGoUp)

            HStack(spacing: 6) {
                Image(systemName: "folder.fill")
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.gold.opacity(0.9))
                Text(vm.path)
                    .font(.system(.footnote, design: .monospaced))
                    .lineLimit(1)
                    .truncationMode(.head)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 9)
            .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .strokeBorder(Theme.gold.opacity(0.18), lineWidth: 0.5)
            )

            Button {
                Task { await refresh() }
            } label: {
                Image(systemName: "arrow.clockwise")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.gold)
                    .frame(width: 32, height: 32)
                    .background(Circle().fill(Theme.gold.opacity(0.12)))
                    .symbolEffect(.rotate, options: .nonRepeating, value: vm.loading)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 16)
    }

    private var entryList: some View {
        ScrollView {
            GlassEffectContainer(spacing: 6) {
                VStack(spacing: 6) {
                    ForEach(vm.entries) { entry in
                        Button {
                            Task { await open(entry) }
                        } label: {
                            EntryRow(entry: entry)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 10) {
            Spacer()
            Image(systemName: "folder")
                .font(.system(size: 28))
                .foregroundStyle(.tertiary)
            switch appState.connection {
            case .offline(let reason):
                Text("Not connected")
                    .font(.system(.headline, design: .rounded))
                Text(reason)
                    .font(.system(.subheadline, design: .rounded))
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            default:
                Text("This folder is empty")
                    .font(.system(.subheadline, design: .rounded))
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding(.horizontal, 24)
    }

    // MARK: - Helpers

    private var canGoUp: Bool { vm.path != "workspace" && vm.path.contains("/") }

    private var errorBinding: Binding<Bool> {
        Binding(
            get: { vm.error != nil },
            set: { if !$0 { vm.error = nil } }
        )
    }

    private func reloadIfPossible() async {
        guard let client = appState.client else { return }
        await vm.load(path: vm.path, using: client, agentId: appState.activeAgentId)
    }

    private func open(_ entry: WorkspaceEntry) async {
        guard let client = appState.client else { return }
        await vm.enter(entry, using: client, agentId: appState.activeAgentId)
    }

    private func goUp() async {
        guard let client = appState.client else { return }
        await vm.goUp(using: client, agentId: appState.activeAgentId)
    }

    private func refresh() async {
        guard let client = appState.client else { return }
        await vm.refresh(using: client, agentId: appState.activeAgentId)
    }
}

private struct EntryRow: View {
    let entry: WorkspaceEntry

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(accent.opacity(0.18))
                    .frame(width: 32, height: 32)
                Image(systemName: icon)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(accent)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(entry.name)
                    .font(.system(.subheadline, design: .rounded))
                    .foregroundStyle(.primary)
                if let size = entry.sizeLabel {
                    Text(size)
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.tertiary)
                } else if entry.kind == .directory {
                    Text("folder")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.tertiary)
                }
            }

            Spacer()

            if entry.kind == .directory {
                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.tertiary)
            } else {
                Image(systemName: "doc.text.magnifyingglass")
                    .font(.system(size: 12))
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 11)
        .frame(maxWidth: .infinity, alignment: .leading)
        .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .strokeBorder(accent.opacity(0.18), lineWidth: 0.5)
        )
        .contentShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private var icon: String {
        switch entry.kind {
        case .directory: "folder.fill"
        case .file: iconForExtension(entry.name)
        }
    }

    private var accent: Color {
        switch entry.kind {
        case .directory: Theme.gold
        case .file: Theme.goldSoft
        }
    }

    private func iconForExtension(_ name: String) -> String {
        let lower = name.lowercased()
        if lower.hasSuffix(".md") || lower.hasSuffix(".txt") { return "doc.text.fill" }
        if lower.hasSuffix(".json") || lower.hasSuffix(".yaml") || lower.hasSuffix(".yml") { return "curlybraces" }
        if lower.hasSuffix(".pdf") { return "doc.richtext.fill" }
        if lower.hasSuffix(".png") || lower.hasSuffix(".jpg") || lower.hasSuffix(".jpeg") { return "photo.fill" }
        if lower.hasSuffix(".csv") || lower.hasSuffix(".xlsx") { return "tablecells.fill" }
        if lower.hasSuffix(".html") { return "chevron.left.forwardslash.chevron.right" }
        return "doc.fill"
    }
}
