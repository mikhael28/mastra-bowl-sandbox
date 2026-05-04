import SwiftUI

struct ToolCallCard: View {
    let call: ToolCall
    @State private var expanded: Bool = false

    private var accent: Color { ToolStyle.accent(for: call.name) }
    private var icon: String { ToolStyle.icon(for: call.name) }
    private var displayName: String { ToolStyle.displayName(for: call.name) }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header
            if expanded {
                Divider()
                    .overlay(accent.opacity(0.25))
                    .padding(.horizontal, 14)
                expandedBody
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .strokeBorder(accent.opacity(0.30), lineWidth: 0.6)
        )
    }

    private var header: some View {
        Button {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                expanded.toggle()
            }
        } label: {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(accent.opacity(0.18))
                        .frame(width: 32, height: 32)
                    Image(systemName: icon)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(accent)
                        .symbolEffect(.pulse, options: .repeat(.continuous), isActive: call.status == .calling || call.status == .awaitingApproval)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(displayName)
                        .font(.system(.subheadline, design: .rounded).weight(.medium))
                        .foregroundStyle(.primary)
                    Text(call.name)
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.tertiary)
                        .lineLimit(1)
                }

                Spacer(minLength: 8)

                statusBadge

                Image(systemName: "chevron.down")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.tertiary)
                    .rotationEffect(.degrees(expanded ? 0 : -90))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private var statusBadge: some View {
        Group {
            switch call.status {
            case .calling:
                HStack(spacing: 5) {
                    ProgressView()
                        .controlSize(.mini)
                        .tint(accent)
                    Text("running")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                }
            case .awaitingApproval:
                HStack(spacing: 4) {
                    Image(systemName: "lock.shield.fill")
                        .font(.system(size: 9, weight: .bold))
                    Text("approving")
                        .font(.system(.caption2, design: .monospaced))
                }
                .foregroundStyle(accent)
            case .done:
                HStack(spacing: 4) {
                    Image(systemName: "checkmark")
                        .font(.system(size: 9, weight: .bold))
                    Text("done")
                        .font(.system(.caption2, design: .monospaced))
                }
                .foregroundStyle(accent)
            case .error:
                HStack(spacing: 4) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 9, weight: .bold))
                    Text("error")
                        .font(.system(.caption2, design: .monospaced))
                }
                .foregroundStyle(.red)
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(
            Capsule().fill((call.status == .error ? Color.red : accent).opacity(0.10))
        )
    }

    private var expandedBody: some View {
        VStack(alignment: .leading, spacing: 10) {
            if !call.argsPreview.isEmpty {
                section(title: "INPUT", body: call.argsPreview)
            }
            if let result = call.resultPreview, !result.isEmpty {
                section(
                    title: call.status == .error ? "ERROR" : "OUTPUT",
                    body: result,
                    bodyColor: call.status == .error ? .red : nil
                )
            }
            if call.argsPreview.isEmpty && (call.resultPreview ?? "").isEmpty {
                Text("(no payload yet)")
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
    }

    private func section(title: String, body: String, bodyColor: Color? = nil) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(.caption2, design: .monospaced).weight(.semibold))
                .tracking(1.5)
                .foregroundStyle(.tertiary)
            Text(body)
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(bodyColor ?? .secondary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .textSelection(.enabled)
        }
    }
}
