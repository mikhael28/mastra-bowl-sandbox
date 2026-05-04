import SwiftUI

/// Compact agent identity card shown above the chat list. Combines the
/// agent name, connection state, and a tiny status line that reflects
/// what the agent is doing right now (calling tools, speaking, etc.).
struct AgentHeader: View {
    let agentName: String
    let connection: ConnectionStatus
    let statusLine: String
    let isResponding: Bool

    @State private var rotate = false

    var body: some View {
        VStack(spacing: 6) {
            ZStack {
                Circle()
                    .stroke(
                        AngularGradient(
                            colors: [
                                Theme.gold.opacity(0.0),
                                Theme.gold.opacity(0.9),
                                Theme.goldSoft,
                                Theme.gold.opacity(0.0)
                            ],
                            center: .center
                        ),
                        lineWidth: 1.4
                    )
                    .frame(width: 64, height: 64)
                    .rotationEffect(.degrees(rotate ? 360 : 0))
                    .animation(.linear(duration: 18).repeatForever(autoreverses: false), value: rotate)

                Image(systemName: "sparkle")
                    .font(.system(size: 26, weight: .light))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [Theme.goldSoft, Theme.gold],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .symbolEffect(.pulse, options: .repeat(.continuous), isActive: isResponding)
            }

            Text(agentName.uppercased())
                .font(.system(.caption, design: .rounded).weight(.semibold))
                .tracking(4)
                .foregroundStyle(.secondary)

            HStack(spacing: 6) {
                ConnectionDot(connection: connection)
                Text(subtitle)
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(.tertiary)
                    .animation(.easeInOut(duration: 0.25), value: subtitle)
            }
            .frame(height: 14)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .onAppear { rotate = true }
    }

    private var subtitle: String {
        if !statusLine.isEmpty { return statusLine }
        switch connection {
        case .unknown: return "checking…"
        case .connecting: return "connecting…"
        case .online: return "ready"
        case .offline(let reason): return reason.lowercased()
        }
    }
}

private struct ConnectionDot: View {
    let connection: ConnectionStatus

    var body: some View {
        Circle()
            .fill(color)
            .frame(width: 6, height: 6)
            .overlay(
                Circle().stroke(color.opacity(0.4), lineWidth: 0.5)
            )
            .shadow(color: color.opacity(0.7), radius: 3)
    }

    private var color: Color {
        switch connection {
        case .online: .green
        case .connecting, .unknown: .yellow
        case .offline: .red
        }
    }
}
