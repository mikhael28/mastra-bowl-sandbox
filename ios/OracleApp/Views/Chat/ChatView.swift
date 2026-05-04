import SwiftUI

struct ChatView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var vm = ChatViewModel()
    @Environment(\.colorScheme) private var scheme

    @State private var draft: String = ""
    @State private var showThreadsSheet: Bool = false
    @State private var hasResumed: Bool = false

    var body: some View {
        ZStack {
            Theme.backdrop(for: scheme)
                .ignoresSafeArea()
            StarfieldBackground()
                .ignoresSafeArea()

            VStack(spacing: 0) {
                AgentHeader(
                    agentName: agentLabel,
                    connection: appState.connection,
                    statusLine: vm.statusLine,
                    isResponding: vm.isResponding
                )
                .padding(.horizontal, 16)

                threadBar

                messagesList
                    .frame(maxWidth: .infinity, maxHeight: .infinity)

                ChatInputBar(
                    text: $draft,
                    isResponding: vm.isResponding,
                    onSend: send,
                    onCancel: vm.cancel
                )
            }
        }
        .onAppear { vm.bind(appState) }
        .onChange(of: appState.resetSignal) { _, _ in
            vm.reset()
            draft = ""
        }
        .onChange(of: appState.threadResumeSignal) { _, _ in
            Task { await vm.resumeFromServer() }
        }
        .onChange(of: appState.connection) { _, new in
            // First successful connection of the session — pull history once.
            if case .online = new, !hasResumed {
                hasResumed = true
                Task { await vm.resumeFromServer() }
            }
        }
        .sheet(isPresented: $showThreadsSheet) {
            ThreadsSheet()
                .presentationDetents([.large])
        }
    }

    private var agentLabel: String {
        if case let .online(name) = appState.connection { return name }
        return appState.agent?.displayName ?? "MastraClaw"
    }

    /// Tiny bar between the agent header and the messages list. Shows the
    /// current thread title and exposes the history + new-thread actions.
    private var threadBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "bubble.left.fill")
                .font(.system(size: 10))
                .foregroundStyle(Theme.gold.opacity(0.85))

            Text(currentThreadLabel)
                .font(.system(.caption, design: .rounded))
                .foregroundStyle(.secondary)
                .lineLimit(1)
                .truncationMode(.tail)
                .frame(maxWidth: .infinity, alignment: .leading)

            Button {
                appState.resetConversation()
            } label: {
                Image(systemName: "square.and.pencil")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Theme.gold)
                    .frame(width: 28, height: 28)
                    .background(Circle().fill(Theme.gold.opacity(0.10)))
            }
            .buttonStyle(.plain)
            .help("New conversation")

            Button {
                showThreadsSheet = true
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "clock.arrow.circlepath")
                        .font(.system(size: 11, weight: .semibold))
                    if appState.threads.count > 1 {
                        Text("\(appState.threads.count)")
                            .font(.system(.caption2, design: .monospaced))
                    }
                }
                .foregroundStyle(Theme.gold)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Capsule().fill(Theme.gold.opacity(0.10)))
            }
            .buttonStyle(.plain)
            .help("Thread history")
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 6)
    }

    private var currentThreadLabel: String {
        if let active = appState.threads.first(where: { $0.id == appState.threadId }) {
            return active.displayTitle
        }
        return "New conversation"
    }

    private var messagesList: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 14) {
                    ForEach(vm.messages) { message in
                        MessageBubble(message: message)
                            .id(message.id)
                            .transition(.asymmetric(
                                insertion: .opacity.combined(with: .move(edge: .bottom)),
                                removal: .opacity
                            ))
                    }

                    if vm.isResponding,
                       let last = vm.messages.last,
                       last.role == .assistant,
                       last.text.isEmpty,
                       last.toolCalls.isEmpty {
                        HStack {
                            TypingIndicator()
                            Spacer()
                        }
                        .id("typing")
                    }

                    Color.clear.frame(height: 4).id("bottom")
                }
                .padding(.horizontal, 16)
                .padding(.top, 4)
                .padding(.bottom, 12)
                .animation(.spring(response: 0.45, dampingFraction: 0.85), value: vm.messages)
            }
            .scrollDismissesKeyboard(.interactively)
            .onChange(of: vm.messages.count) { _, _ in
                withAnimation(.easeOut(duration: 0.25)) {
                    proxy.scrollTo("bottom", anchor: .bottom)
                }
            }
            .onChange(of: latestSignature) { _, _ in
                withAnimation(.easeOut(duration: 0.2)) {
                    proxy.scrollTo("bottom", anchor: .bottom)
                }
            }
        }
    }

    /// Compact signature of "what changed inside the last message" so we can
    /// auto-scroll while a single message is streaming.
    private var latestSignature: String {
        guard let last = vm.messages.last else { return "" }
        let toolBits = last.toolCalls.map { tc in
            "\(tc.id):\(tc.status.rawValue):\((tc.resultPreview ?? "").count)"
        }.joined(separator: "|")
        return "\(last.id)|\(last.text.count)|\(toolBits)"
    }

    private func send() {
        let text = draft
        draft = ""
        vm.send(text)
    }
}
