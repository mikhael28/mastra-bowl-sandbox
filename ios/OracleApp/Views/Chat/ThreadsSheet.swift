import SwiftUI

/// Sheet that lists every prior thread for the current `resourceId`. Tap a
/// row to switch to that thread; swipe to delete. Shown from the chat
/// header's history button.
struct ThreadsSheet: View {
    @EnvironmentObject private var appState: AppState
    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) private var scheme

    @State private var loading: Bool = false
    @State private var pendingDelete: ThreadSummary?

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backdrop(for: scheme).ignoresSafeArea()
                StarfieldBackground().ignoresSafeArea().opacity(0.5)

                content
            }
            .navigationTitle("Conversations")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        appState.resetConversation()
                        dismiss()
                    } label: {
                        Label("New", systemImage: "square.and.pencil")
                            .font(.system(.body, design: .rounded).weight(.medium))
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(.system(.body, design: .rounded).weight(.medium))
                }
            }
        }
        .task { await refresh() }
        .alert("Delete this conversation?", isPresented: deleteBinding) {
            Button("Cancel", role: .cancel) { pendingDelete = nil }
            Button("Delete", role: .destructive) {
                if let pending = pendingDelete {
                    Task {
                        await appState.deleteThread(pending.id)
                        pendingDelete = nil
                    }
                }
            }
        } message: {
            Text(pendingDelete?.displayTitle ?? "")
        }
    }

    @ViewBuilder
    private var content: some View {
        if loading && appState.threads.isEmpty {
            VStack { Spacer(); ProgressView(); Spacer() }
        } else if appState.threads.isEmpty {
            emptyState
        } else {
            ScrollView {
                GlassEffectContainer(spacing: 8) {
                    VStack(spacing: 8) {
                        ForEach(appState.threads) { thread in
                            ThreadRow(
                                thread: thread,
                                isActive: thread.id == appState.threadId,
                                onTap: {
                                    appState.selectThread(thread.id)
                                    dismiss()
                                },
                                onDelete: { pendingDelete = thread }
                            )
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
            }
            .refreshable { await refresh() }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 10) {
            Spacer()
            Image(systemName: "bubble.left.and.bubble.right")
                .font(.system(size: 28))
                .foregroundStyle(.tertiary)
            Text("No prior conversations")
                .font(.system(.subheadline, design: .rounded))
                .foregroundStyle(.secondary)
            Text("Send a message to begin one.")
                .font(.system(.caption, design: .rounded))
                .foregroundStyle(.tertiary)
            Spacer()
        }
        .padding(.horizontal, 24)
    }

    private var deleteBinding: Binding<Bool> {
        Binding(
            get: { pendingDelete != nil },
            set: { if !$0 { pendingDelete = nil } }
        )
    }

    private func refresh() async {
        loading = true
        defer { loading = false }
        await appState.reloadThreads()
    }
}

private struct ThreadRow: View {
    let thread: ThreadSummary
    let isActive: Bool
    let onTap: () -> Void
    let onDelete: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(Theme.gold.opacity(isActive ? 0.30 : 0.16))
                        .frame(width: 32, height: 32)
                    Image(systemName: isActive ? "checkmark" : "bubble.left.fill")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Theme.gold)
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text(thread.displayTitle)
                        .font(.system(.subheadline, design: .rounded).weight(.medium))
                        .foregroundStyle(.primary)
                        .lineLimit(2)

                    HStack(spacing: 6) {
                        Text(relativeDate)
                            .font(.system(.caption2, design: .monospaced))
                            .foregroundStyle(.tertiary)
                        if let count = thread.messageCount {
                            Text("·")
                                .font(.system(.caption2, design: .monospaced))
                                .foregroundStyle(.tertiary)
                            Text("\(count) msg")
                                .font(.system(.caption2, design: .monospaced))
                                .foregroundStyle(.tertiary)
                        }
                    }
                }

                Spacer()

                if isActive {
                    Text("active")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(Theme.gold)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Capsule().fill(Theme.gold.opacity(0.12)))
                } else {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(.tertiary)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .strokeBorder(Theme.gold.opacity(isActive ? 0.45 : 0.18), lineWidth: 0.6)
            )
            .contentShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
        .buttonStyle(.plain)
        .swipeActions(edge: .trailing) {
            Button(role: .destructive, action: onDelete) {
                Label("Delete", systemImage: "trash")
            }
        }
        .contextMenu {
            Button(role: .destructive, action: onDelete) {
                Label("Delete", systemImage: "trash")
            }
        }
    }

    private var relativeDate: String {
        let date = thread.updatedAt ?? thread.createdAt
        guard let date else { return "—" }
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        return formatter.localizedString(for: date, relativeTo: .init())
    }
}
