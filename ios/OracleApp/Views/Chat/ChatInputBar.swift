import SwiftUI

struct ChatInputBar: View {
    @Binding var text: String
    let isResponding: Bool
    let onSend: () -> Void
    let onCancel: () -> Void

    @FocusState private var focused: Bool

    var body: some View {
        HStack(alignment: .bottom, spacing: 10) {
            HStack(alignment: .bottom, spacing: 8) {
                Image(systemName: "sparkle")
                    .font(.system(size: 14, weight: .regular))
                    .foregroundStyle(Theme.gold.opacity(0.85))
                    .padding(.bottom, 10)

                TextField(
                    "Ask MastraClaw anything…",
                    text: $text,
                    axis: .vertical
                )
                .focused($focused)
                .lineLimit(1...5)
                .font(.system(.body, design: .rounded))
                .submitLabel(.send)
                .onSubmit(send)
                .padding(.vertical, 10)
            }
            .padding(.horizontal, 14)
            .glassEffect(
                .regular,
                in: RoundedRectangle(cornerRadius: 22, style: .continuous)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .strokeBorder(Theme.gold.opacity(focused ? 0.45 : 0.18), lineWidth: 0.6)
            )
            .animation(.easeInOut(duration: 0.2), value: focused)

            actionButton
        }
        .padding(.horizontal, 12)
        .padding(.bottom, 10)
        .padding(.top, 8)
    }

    private var actionButton: some View {
        Button(action: primaryAction) {
            Image(systemName: isResponding ? "stop.fill" : "arrow.up")
                .font(.system(size: 16, weight: .bold))
                .foregroundStyle(.white)
                .frame(width: 40, height: 40)
                .background(
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Theme.goldSoft, Theme.gold],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                )
                .shadow(color: Theme.gold.opacity(0.35), radius: 10, y: 4)
        }
        .disabled(isResponding ? false : !canSend)
        .opacity((isResponding || canSend) ? 1.0 : 0.45)
        .animation(.easeInOut(duration: 0.15), value: canSend)
        .animation(.easeInOut(duration: 0.15), value: isResponding)
    }

    private var canSend: Bool {
        !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private func primaryAction() {
        if isResponding {
            onCancel()
        } else {
            send()
        }
    }

    private func send() {
        guard canSend, !isResponding else { return }
        onSend()
    }
}
