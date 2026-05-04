import SwiftUI

/// Read-only showcase of the connected agent's capabilities. Each tool the
/// agent has registered shows up as a Liquid Glass card; sub-agents and
/// workflows get compact rows below. The whole tab is "look but don't
/// touch" — invocation happens in chat.
struct ToolsView: View {
    @EnvironmentObject private var appState: AppState
    @Environment(\.colorScheme) private var scheme

    @State private var search: String = ""

    var body: some View {
        ZStack {
            Theme.backdrop(for: scheme).ignoresSafeArea()
            StarfieldBackground().ignoresSafeArea().opacity(0.6)

            ScrollView {
                VStack(spacing: 20) {
                    header

                    switch appState.connection {
                    case .unknown, .connecting:
                        ProgressView().padding(.vertical, 60)
                    case .offline(let reason):
                        offlineCard(reason)
                    case .online:
                        if let agent = appState.agent {
                            toolsSection(for: agent)
                            if !agent.subAgentIds.isEmpty {
                                subAgentsSection(agent.subAgentIds)
                            }
                            if !agent.workflowIds.isEmpty {
                                workflowsSection(agent.workflowIds)
                            }
                        }
                    }

                    Spacer(minLength: 40)
                }
                .padding(.top, 8)
            }
            .scrollDismissesKeyboard(.interactively)
        }
    }

    // MARK: - Sections

    private var header: some View {
        VStack(spacing: 4) {
            Text("CAPABILITIES")
                .font(.system(.caption, design: .rounded).weight(.semibold))
                .tracking(4)
                .foregroundStyle(.secondary)
            Text("What MastraClaw can do")
                .font(Font.system(.title2, design: .rounded).weight(.semibold))
                .foregroundStyle(.primary)
            if let agent = appState.agent, let model = agent.modelId {
                Text(model)
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(.tertiary)
                    .padding(.top, 2)
            }
        }
        .padding(.top, 18)
        .padding(.bottom, 6)
    }

    private func toolsSection(for agent: AgentSummary) -> some View {
        let filtered: [ToolSummary] = {
            guard !search.trimmingCharacters(in: .whitespaces).isEmpty else { return agent.tools }
            let q = search.lowercased()
            return agent.tools.filter {
                $0.id.lowercased().contains(q)
                || ($0.description?.lowercased().contains(q) ?? false)
            }
        }()

        return VStack(alignment: .leading, spacing: 12) {
            sectionHeader(
                "Tools",
                count: agent.tools.count,
                icon: "wrench.and.screwdriver.fill"
            )
            searchField

            if filtered.isEmpty {
                emptyState(filtered: !search.isEmpty)
            } else {
                GlassEffectContainer(spacing: 10) {
                    VStack(spacing: 10) {
                        ForEach(filtered) { tool in
                            ToolCard(tool: tool)
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 16)
    }

    private func subAgentsSection(_ ids: [String]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader("Sub-agents", count: ids.count, icon: "person.2.wave.2.fill")
                .padding(.top, 12)
            GlassEffectContainer(spacing: 10) {
                VStack(spacing: 10) {
                    ForEach(ids, id: \.self) { id in
                        PrimitiveRow(
                            symbol: "person.crop.circle.badge.checkmark",
                            accent: Color(red: 0.78, green: 0.55, blue: 0.95),
                            title: ToolStyle.displayName(for: id),
                            subtitle: "specialist agent"
                        )
                    }
                }
            }
        }
        .padding(.horizontal, 16)
    }

    private func workflowsSection(_ ids: [String]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader("Workflows", count: ids.count, icon: "flowchart.fill")
                .padding(.top, 12)
            GlassEffectContainer(spacing: 10) {
                VStack(spacing: 10) {
                    ForEach(ids, id: \.self) { id in
                        PrimitiveRow(
                            symbol: "flowchart.fill",
                            accent: Color(red: 0.40, green: 0.76, blue: 0.62),
                            title: ToolStyle.displayName(for: id),
                            subtitle: "deterministic pipeline"
                        )
                    }
                }
            }
        }
        .padding(.horizontal, 16)
    }

    private func sectionHeader(_ title: String, count: Int, icon: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Theme.gold)
            Text(title.uppercased())
                .font(.system(.caption2, design: .rounded).weight(.semibold))
                .tracking(2.5)
                .foregroundStyle(.secondary)
            Spacer()
            Text("\(count)")
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(.tertiary)
                .padding(.horizontal, 8)
                .padding(.vertical, 2)
                .background(Capsule().fill(Theme.gold.opacity(0.10)))
        }
    }

    private var searchField: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 13))
                .foregroundStyle(.tertiary)
            TextField("filter…", text: $search)
                .font(.system(.subheadline, design: .rounded))
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
            if !search.isEmpty {
                Button {
                    search = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 14))
                        .foregroundStyle(.tertiary)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 9)
        .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .strokeBorder(Theme.gold.opacity(0.15), lineWidth: 0.5)
        )
    }

    private func emptyState(filtered: Bool) -> some View {
        VStack(spacing: 6) {
            Image(systemName: filtered ? "magnifyingglass" : "tray")
                .font(.system(size: 24))
                .foregroundStyle(.tertiary)
            Text(filtered ? "no tools match" : "no tools registered")
                .font(.system(.subheadline, design: .rounded))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 28)
    }

    private func offlineCard(_ reason: String) -> some View {
        VStack(spacing: 10) {
            Image(systemName: "antenna.radiowaves.left.and.right.slash")
                .font(.system(size: 26))
                .foregroundStyle(.orange)
            Text("Not connected")
                .font(.system(.headline, design: .rounded))
            Text(reason)
                .font(.system(.subheadline, design: .rounded))
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Text("Open Settings to point at a Mastra server.")
                .font(.system(.caption, design: .rounded))
                .foregroundStyle(.tertiary)
        }
        .padding(20)
        .frame(maxWidth: .infinity)
        .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
        .padding(.horizontal, 16)
        .padding(.top, 24)
    }
}

private struct ToolCard: View {
    let tool: ToolSummary

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            ZStack {
                Circle()
                    .fill(ToolStyle.accent(for: tool.id).opacity(0.20))
                    .frame(width: 36, height: 36)
                Image(systemName: ToolStyle.icon(for: tool.id))
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(ToolStyle.accent(for: tool.id))
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(ToolStyle.displayName(for: tool.id))
                    .font(.system(.subheadline, design: .rounded).weight(.semibold))
                    .foregroundStyle(.primary)
                Text(tool.id)
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(.tertiary)
                if let desc = tool.description, !desc.isEmpty {
                    Text(desc)
                        .font(.system(.footnote, design: .rounded))
                        .foregroundStyle(.secondary)
                        .lineLimit(3)
                        .padding(.top, 2)
                }
            }

            Spacer(minLength: 4)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .glassEffect(
            .regular.tint(ToolStyle.accent(for: tool.id).opacity(0.06)),
            in: RoundedRectangle(cornerRadius: 18, style: .continuous)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .strokeBorder(ToolStyle.accent(for: tool.id).opacity(0.25), lineWidth: 0.6)
        )
    }
}

private struct PrimitiveRow: View {
    let symbol: String
    let accent: Color
    let title: String
    let subtitle: String

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle().fill(accent.opacity(0.18)).frame(width: 32, height: 32)
                Image(systemName: symbol)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(accent)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(.subheadline, design: .rounded).weight(.medium))
                Text(subtitle)
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(.tertiary)
            }
            Spacer()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .strokeBorder(accent.opacity(0.20), lineWidth: 0.5)
        )
    }
}
