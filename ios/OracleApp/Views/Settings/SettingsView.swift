import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var appState: AppState
    @Environment(\.colorScheme) private var scheme

    @State private var endpointDraft: String = ""
    @State private var confirmReset: Bool = false
    @State private var confirmForgetMemory: Bool = false

    var body: some View {
        ZStack {
            Theme.backdrop(for: scheme).ignoresSafeArea()
            StarfieldBackground().ignoresSafeArea().opacity(0.6)

            ScrollView {
                VStack(spacing: 20) {
                    title

                    GlassEffectContainer(spacing: 12) {
                        VStack(spacing: 12) {
                            connectionCard
                            appearanceCard
                            conversationCard
                            aboutCard
                        }
                    }
                    .padding(.horizontal, 16)

                    Spacer(minLength: 40)
                }
                .padding(.top, 8)
            }
        }
        .onAppear {
            endpointDraft = appState.endpointURL
        }
        .onChange(of: appState.endpointURL) { _, newValue in
            if endpointDraft != newValue { endpointDraft = newValue }
        }
        .alert("Clear the conversation?", isPresented: $confirmReset) {
            Button("Cancel", role: .cancel) {}
            Button("Clear", role: .destructive) { appState.resetConversation() }
        } message: {
            Text("This thread will be archived. The agent's working-memory profile of you stays.")
        }
        .alert("Forget me entirely?", isPresented: $confirmForgetMemory) {
            Button("Cancel", role: .cancel) {}
            Button("Forget", role: .destructive) { appState.resetMemory() }
        } message: {
            Text("Both the current thread and the persistent profile (working memory) will be replaced with fresh IDs. The agent will start over.")
        }
    }

    private var title: some View {
        VStack(spacing: 4) {
            Text("SETTINGS")
                .font(.system(.caption, design: .rounded).weight(.semibold))
                .tracking(4)
                .foregroundStyle(.secondary)
            Text("MastraClaw")
                .font(Font.system(.title2, design: .rounded).weight(.semibold))
                .foregroundStyle(.primary)
        }
        .padding(.top, 18)
        .padding(.bottom, 6)
    }

    // MARK: - Connection

    private var connectionCard: some View {
        SettingsCard(title: "Mastra endpoint", icon: "antenna.radiowaves.left.and.right") {
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 8) {
                    Image(systemName: connectionIcon)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(connectionColor)
                    Text(connectionLabel)
                        .font(.system(.footnote, design: .rounded).weight(.medium))
                        .foregroundStyle(connectionColor)
                    Spacer()
                    if case .connecting = appState.connection {
                        ProgressView().controlSize(.mini)
                    } else {
                        Button {
                            Task { await appState.refresh() }
                        } label: {
                            Image(systemName: "arrow.clockwise")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(Theme.gold)
                        }
                        .buttonStyle(.plain)
                    }
                }

                TextField("https://mastra.example.com", text: $endpointDraft)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .keyboardType(.URL)
                    .font(.system(.footnote, design: .monospaced))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .strokeBorder(Theme.gold.opacity(0.18), lineWidth: 0.5)
                    )
                    .onSubmit { commitEndpoint() }

                HStack(spacing: 8) {
                    presetButton("Local", value: AppState.defaultEndpoint)
                    Spacer()
                    Button {
                        commitEndpoint()
                    } label: {
                        Text("Save")
                            .font(.system(.footnote, design: .rounded).weight(.semibold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 7)
                            .background(
                                Capsule().fill(
                                    LinearGradient(
                                        colors: [Theme.goldSoft, Theme.gold],
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )
                            )
                    }
                    .buttonStyle(.plain)
                    .disabled(endpointDraft == appState.endpointURL || endpointDraft.isEmpty)
                    .opacity((endpointDraft == appState.endpointURL || endpointDraft.isEmpty) ? 0.4 : 1.0)
                }

                if let agent = appState.agent {
                    Divider()
                        .overlay(Theme.gold.opacity(0.15))
                        .padding(.vertical, 4)
                    LabeledLine("agent", value: agent.displayName)
                    if let model = agent.modelId {
                        LabeledLine("model", value: model)
                    }
                    LabeledLine("tools", value: "\(agent.tools.count)")
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
        }
    }

    private func presetButton(_ label: String, value: String) -> some View {
        Button {
            endpointDraft = value
        } label: {
            Text(label)
                .font(.system(.caption, design: .rounded).weight(.medium))
                .foregroundStyle(.secondary)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(
                    Capsule().fill(Theme.gold.opacity(0.10))
                )
        }
        .buttonStyle(.plain)
    }

    private func commitEndpoint() {
        let normalized = AppState.normalizeURL(endpointDraft)
        endpointDraft = normalized
        if normalized != appState.endpointURL {
            appState.endpointURL = normalized
        } else {
            Task { await appState.refresh() }
        }
    }

    private var connectionIcon: String {
        switch appState.connection {
        case .online: "checkmark.circle.fill"
        case .connecting, .unknown: "ellipsis.circle.fill"
        case .offline: "xmark.octagon.fill"
        }
    }

    private var connectionColor: Color {
        switch appState.connection {
        case .online: .green
        case .connecting, .unknown: .yellow
        case .offline: .red
        }
    }

    private var connectionLabel: String {
        switch appState.connection {
        case .online(let name): "online · \(name)"
        case .connecting: "connecting…"
        case .unknown: "checking…"
        case .offline(let reason): reason
        }
    }

    // MARK: - Appearance

    private var appearanceCard: some View {
        SettingsCard(title: "Appearance", icon: "moon.stars.fill") {
            VStack(spacing: 0) {
                ForEach(Appearance.allCases) { option in
                    appearanceRow(option)
                    if option != Appearance.allCases.last {
                        Divider().padding(.leading, 44)
                    }
                }
            }
        }
    }

    private func appearanceRow(_ option: Appearance) -> some View {
        Button {
            withAnimation(.easeInOut(duration: 0.25)) {
                appState.appearance = option
            }
        } label: {
            HStack(spacing: 14) {
                Image(systemName: option.symbol)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(Theme.gold)
                    .frame(width: 24)

                Text(option.label)
                    .font(.system(.body, design: .rounded))
                    .foregroundStyle(.primary)

                Spacer()

                Image(systemName: "checkmark")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(Theme.gold)
                    .opacity(appState.appearance == option ? 1 : 0)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    // MARK: - Conversation

    private var conversationCard: some View {
        SettingsCard(title: "Memory", icon: "brain.head.profile") {
            VStack(spacing: 0) {
                Button {
                    confirmReset = true
                } label: {
                    actionRow(
                        symbol: "wind",
                        label: "Clear conversation",
                        sublabel: "start a new thread; keep your profile",
                        tint: Theme.gold
                    )
                }
                .buttonStyle(.plain)

                Divider().padding(.leading, 44)

                Button {
                    confirmForgetMemory = true
                } label: {
                    actionRow(
                        symbol: "eraser.fill",
                        label: "Forget me",
                        sublabel: "wipe working memory + thread",
                        tint: .red
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }

    private func actionRow(symbol: String, label: String, sublabel: String, tint: Color) -> some View {
        HStack(spacing: 14) {
            Image(systemName: symbol)
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(tint.opacity(0.85))
                .frame(width: 24)

            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.system(.body, design: .rounded))
                    .foregroundStyle(tint == .red ? .red : .primary)
                Text(sublabel)
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(.tertiary)
            }

            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .contentShape(Rectangle())
    }

    // MARK: - About

    private var aboutCard: some View {
        SettingsCard(title: "About", icon: "sparkles") {
            VStack(alignment: .leading, spacing: 8) {
                Text("MastraClaw is an autonomous business-development and content assistant. This app is a portfolio piece for the Mastra framework — point it at any Mastra server and chat with the agent it hosts.")
                    .font(.system(.footnote, design: .rounded))
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)

                HStack(spacing: 6) {
                    Text("Version")
                    Text("1.0").foregroundStyle(.secondary)
                    Spacer()
                    Text("built with Mastra").italic().foregroundStyle(.tertiary)
                }
                .font(.system(.caption2, design: .monospaced))
                .padding(.top, 4)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
        }
    }
}

private struct SettingsCard<Content: View>: View {
    let title: String
    let icon: String
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Theme.gold)
                Text(title.uppercased())
                    .font(.system(.caption2, design: .rounded).weight(.semibold))
                    .tracking(2.5)
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal, 16)
            .padding(.top, 14)
            .padding(.bottom, 8)

            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .glassEffect(
            .regular,
            in: RoundedRectangle(cornerRadius: 22, style: .continuous)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .strokeBorder(Theme.gold.opacity(0.18), lineWidth: 0.5)
        )
    }
}

private struct LabeledLine: View {
    let label: String
    let value: String

    init(_ label: String, value: String) {
        self.label = label
        self.value = value
    }

    var body: some View {
        HStack(spacing: 6) {
            Text(label)
                .font(.system(.caption2, design: .monospaced))
                .foregroundStyle(.tertiary)
            Spacer()
            Text(value)
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(.secondary)
                .lineLimit(1)
                .truncationMode(.middle)
        }
    }
}
